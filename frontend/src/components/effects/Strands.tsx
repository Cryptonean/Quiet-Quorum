import { Color, Mesh, Program, Renderer, RenderTarget, Triangle } from 'ogl';
import { type CSSProperties, useEffect, useRef } from 'react';

const MAX_STRANDS = 12;
const MAX_COLORS = 8;

const VERTEX_SHADER = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const STRANDS_SHADER = `#version 300 es
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[${MAX_COLORS}];
uniform int uColorCount;
uniform int uStrandCount;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaviness;
uniform float uThickness;
uniform float uGlow;
uniform float uTaper;
uniform float uSpread;
uniform float uHueShift;
uniform float uIntensity;
uniform float uOpacity;
uniform float uScale;
uniform float uSaturation;

out vec4 fragColor;

const float PI = 3.14159265;

vec3 spectrum(float t) {
  return 0.5 + 0.5 * cos(2.0 * PI * (t + vec3(0.00, 0.33, 0.67)));
}

vec3 samplePalette(float t) {
  t = fract(t);
  float scaled = t * float(uColorCount);
  int idx = int(floor(scaled));
  float blend = fract(scaled);
  int nextIdx = idx + 1;
  if (nextIdx >= uColorCount) nextIdx = 0;
  return mix(uColors[idx], uColors[nextIdx], blend);
}

vec3 strandColor(float t) {
  if (uColorCount > 0) return samplePalette(t);
  return spectrum(t);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  uv /= max(uScale, 0.0001);

  float energy = 0.06 + uIntensity * 0.94;
  float envelope = pow(max(cos(uv.x * PI * 1.3), 0.0), uTaper);
  vec3 color = vec3(0.0);

  for (int i = 0; i < ${MAX_STRANDS}; i++) {
    if (i >= uStrandCount) break;

    float strand = float(i);
    float phase = strand * 1.7 * uSpread;
    float frequency = (2.0 + strand * 0.35) * uWaviness;
    float velocity = 1.4 + strand * 1.2;
    float time = uTime * uSpeed;
    float wave = sin(uv.x * frequency + time * velocity + phase) * 0.60
      + sin(uv.x * frequency * 1.1 - time * velocity * 0.7 + phase * 1.7) * 0.40;

    float amplitude = (0.1 + 0.02 * energy) * envelope * uAmplitude;
    float distanceToWave = abs(uv.y - wave * amplitude);
    float width = (0.001 + 0.05 * energy) * (0.35 + envelope) * uThickness;
    float glow = width / (distanceToWave + width * 0.45);
    glow *= glow;

    float hue = strand / float(uStrandCount) + uv.x * 0.30 + uTime * 0.04 + uHueShift;
    color += strandColor(hue) * glow * envelope;
  }

  color *= 0.45 + 0.7 * energy;
  color = 1.0 - exp(-color * uGlow);
  float gray = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = max(mix(vec3(gray), color, uSaturation), 0.0);
  float luminance = max(max(color.r, color.g), color.b);
  float alpha = clamp(luminance, 0.0, 1.0) * uOpacity;
  fragColor = vec4(color * uOpacity, alpha);
}
`;

const GLASS_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uScene;
uniform vec2 uResolution;
uniform float uRadius;
uniform float uRefraction;
uniform float uDispersion;

out vec4 fragColor;

vec2 toUv(vec2 point) {
  return point * (uResolution.y / uResolution) + 0.5;
}

void main() {
  vec2 point = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float distanceFromCenter = length(point);
  float radius = uRadius;
  float edge = fwidth(distanceFromCenter) * 1.5;
  float mask = 1.0 - smoothstep(radius - edge, radius + edge, distanceFromCenter);

  if (mask <= 0.0) {
    fragColor = vec4(0.0);
    return;
  }

  float height = sqrt(max(radius * radius - distanceFromCenter * distanceFromCenter, 0.0)) / radius;
  float normalizedDistance = distanceFromCenter / radius;
  vec2 direction = distanceFromCenter > 0.0 ? point / distanceFromCenter : vec2(0.0);
  float lens = smoothstep(0.85, 1.0, normalizedDistance) * pow(normalizedDistance, 6.0);
  vec2 offset = -direction * lens * uRefraction * 0.15;
  vec2 dispersion = -direction * lens * uDispersion * 0.012;

  vec3 light;
  light.r = texture(uScene, toUv(point + offset - dispersion)).r;
  light.g = texture(uScene, toUv(point + offset)).g;
  light.b = texture(uScene, toUv(point + offset + dispersion)).b;

  float fresnel = pow(1.0 - height, 3.0);
  vec3 rim = vec3(1.0) * fresnel * 0.18;
  vec2 lightDirection = normalize(vec2(-0.55, 0.6));
  float specular = pow(max(dot(point / max(radius, 0.0001), lightDirection), 0.0), 6.0);
  specular *= smoothstep(radius, radius * 0.55, distanceFromCenter);

  vec3 lightOutput = light + rim + vec3(specular) * 0.4;
  float lightAlpha = clamp(max(max(lightOutput.r, lightOutput.g), lightOutput.b), 0.0, 1.0);
  float bodyAlpha = 0.05 + fresnel * 0.05;
  float outputAlpha = lightAlpha + bodyAlpha * (1.0 - lightAlpha);

  fragColor = vec4(lightOutput * mask, outputAlpha * mask);
}
`;

export interface StrandsProps {
  colors?: string[];
  count?: number;
  speed?: number;
  amplitude?: number;
  waviness?: number;
  thickness?: number;
  glow?: number;
  taper?: number;
  spread?: number;
  hueShift?: number;
  intensity?: number;
  saturation?: number;
  opacity?: number;
  scale?: number;
  glass?: boolean;
  refraction?: number;
  dispersion?: number;
  glassSize?: number;
  className?: string;
  style?: CSSProperties;
}

function buildPalette(colors: string[]): number[][] {
  const source = colors.length > 0 ? colors : ['#ffffff'];

  return Array.from({ length: MAX_COLORS }, (_, index) => {
    const color = new Color(source[index] ?? source[source.length - 1]);
    return [color.r, color.g, color.b];
  });
}

export function Strands({
  colors = ['#ffffff', '#bcbcbc', '#646464'],
  count = 3,
  speed = 0.5,
  amplitude = 1,
  waviness = 1,
  thickness = 0.7,
  glow = 2.6,
  taper = 3,
  spread = 1,
  hueShift = 0,
  intensity = 0.6,
  saturation = 1,
  opacity = 1,
  scale = 1.5,
  glass = false,
  refraction = 1,
  dispersion = 1,
  glassSize = 1,
  className = '',
  style,
}: StrandsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef({
    colors,
    count,
    speed,
    amplitude,
    waviness,
    thickness,
    glow,
    taper,
    spread,
    hueShift,
    intensity,
    saturation,
    opacity,
    scale,
    glass,
    refraction,
    dispersion,
    glassSize,
  });

  optionsRef.current = {
    colors,
    count,
    speed,
    amplitude,
    waviness,
    thickness,
    glow,
    taper,
    spread,
    hueShift,
    intensity,
    saturation,
    opacity,
    scale,
    glass,
    refraction,
    dispersion,
    glassSize,
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    let paletteKey = optionsRef.current.colors.join('|');
    let palette = buildPalette(optionsRef.current.colors);
    const initialWidth = Math.max(container.offsetWidth, 1);
    const initialHeight = Math.max(container.offsetHeight, 1);

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: STRANDS_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [initialWidth, initialHeight] },
        uColors: { value: palette },
        uColorCount: { value: Math.min(optionsRef.current.colors.length, MAX_COLORS) },
        uStrandCount: { value: Math.min(optionsRef.current.count, MAX_STRANDS) },
        uSpeed: { value: speed },
        uAmplitude: { value: amplitude },
        uWaviness: { value: waviness },
        uThickness: { value: thickness },
        uGlow: { value: glow },
        uTaper: { value: taper },
        uSpread: { value: spread },
        uHueShift: { value: hueShift },
        uIntensity: { value: intensity },
        uOpacity: { value: opacity },
        uScale: { value: scale },
        uSaturation: { value: saturation },
      },
    });
    const strandsMesh = new Mesh(gl, { geometry, program });
    const target = new RenderTarget(gl, {
      width: initialWidth,
      height: initialHeight,
    });
    const glassProgram = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: GLASS_SHADER,
      uniforms: {
        uScene: { value: target.texture },
        uResolution: { value: [initialWidth, initialHeight] },
        uRadius: { value: 0.46 * glassSize },
        uRefraction: { value: refraction },
        uDispersion: { value: dispersion },
      },
    });
    const glassMesh = new Mesh(gl, { geometry, program: glassProgram });

    container.appendChild(gl.canvas);

    const resize = () => {
      const width = Math.max(container.offsetWidth, 1);
      const height = Math.max(container.offsetHeight, 1);
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
      target.setSize(width, height);
      glassProgram.uniforms.uResolution.value = [width, height];
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = 0;
    let elapsed = 0;
    let previousTime = 0;

    const render = (time: number) => {
      animationFrame = 0;
      const current = optionsRef.current;
      const delta = previousTime === 0 ? 0 : time - previousTime;
      previousTime = time;
      const shouldAnimate = !prefersReducedMotion.matches && !document.hidden;
      if (shouldAnimate) elapsed += delta;

      program.uniforms.uTime.value = elapsed * 0.001;
      const nextPaletteKey = current.colors.join('|');
      if (nextPaletteKey !== paletteKey) {
        paletteKey = nextPaletteKey;
        palette = buildPalette(current.colors);
        program.uniforms.uColors.value = palette;
      }
      program.uniforms.uColorCount.value = Math.min(current.colors.length, MAX_COLORS);
      program.uniforms.uStrandCount.value = Math.min(
        Math.max(Math.round(current.count), 1),
        MAX_STRANDS,
      );
      program.uniforms.uSpeed.value = current.speed;
      program.uniforms.uAmplitude.value = current.amplitude;
      program.uniforms.uWaviness.value = current.waviness;
      program.uniforms.uThickness.value = current.thickness;
      program.uniforms.uGlow.value = current.glow;
      program.uniforms.uTaper.value = current.taper;
      program.uniforms.uSpread.value = current.spread;
      program.uniforms.uHueShift.value = current.hueShift;
      program.uniforms.uIntensity.value = current.intensity;
      program.uniforms.uOpacity.value = current.opacity;
      program.uniforms.uScale.value = current.scale;
      program.uniforms.uSaturation.value = current.saturation;

      if (current.glass) {
        renderer.render({ scene: strandsMesh, target });
        glassProgram.uniforms.uScene.value = target.texture;
        glassProgram.uniforms.uRefraction.value = current.refraction;
        glassProgram.uniforms.uDispersion.value = current.dispersion;
        glassProgram.uniforms.uRadius.value = 0.46 * current.glassSize;
        renderer.render({ scene: glassMesh });
      } else {
        renderer.render({ scene: strandsMesh });
      }

      if (shouldAnimate) animationFrame = requestAnimationFrame(render);
    };

    const startRendering = () => {
      if (animationFrame !== 0 || document.hidden) return;
      previousTime = 0;
      animationFrame = requestAnimationFrame(render);
    };

    const onMotionPreferenceChange = () => {
      if (prefersReducedMotion.matches) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      startRendering();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        return;
      }
      startRendering();
    };

    prefersReducedMotion.addEventListener('change', onMotionPreferenceChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    startRendering();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      prefersReducedMotion.removeEventListener('change', onMotionPreferenceChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`strands-container ${className}`.trim()}
      style={style}
    />
  );
}
