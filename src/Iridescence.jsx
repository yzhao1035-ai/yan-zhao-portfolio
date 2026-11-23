import { useEffect, useRef } from 'react';

const vertexSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const fragmentSource = `
precision mediump float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_click;
uniform float u_time;
uniform float u_hueShift;
uniform float u_saturation;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_scale;
uniform float u_detail;
uniform float u_warp;
uniform float u_amplitude;
uniform float u_stir;
uniform float u_sheen;
uniform float u_grain;
uniform float u_fade;
uniform float u_mouseReact;
uniform float u_clickAge;
uniform vec3 u_color;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 8; i++) {
    if (float(i) >= u_detail) break;
    value += noise(p) * amplitude;
    p = p * 2.03 + vec2(7.1, 3.7);
    amplitude *= 0.5;
  }
  return value;
}

vec3 hueShift(vec3 color, float shift) {
  const mat3 toYIQ = mat3(
    0.299, 0.587, 0.114,
    0.596, -0.274, -0.322,
    0.211, -0.523, 0.312
  );
  const mat3 toRGB = mat3(
    1.0, 0.956, 0.621,
    1.0, -0.272, -0.647,
    1.0, -1.107, 1.704
  );
  vec3 yiq = toYIQ * color;
  float angle = shift * 6.2831853;
  float chroma = atan(yiq.z, yiq.y) + angle;
  float amplitude = length(yiq.yz);
  yiq.y = amplitude * cos(chroma);
  yiq.z = amplitude * sin(chroma);
  return toRGB * yiq;
}

void main() {
  vec2 uv = v_uv;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect * u_scale;
  float time = u_time * 0.09;
  vec2 flow = vec2(
    fbm(p * 1.15 + vec2(time, -time * 0.72)),
    fbm(p * 1.15 + vec2(5.2 - time * 0.8, 2.4 + time))
  );

  vec2 mouseDelta = (uv - u_mouse) * aspect;
  float mouseDistance = length(mouseDelta);
  float mouseMask = exp(-mouseDistance * 4.0) * u_mouseReact;
  flow += vec2(-mouseDelta.y, mouseDelta.x) * mouseMask * u_stir;

  if (u_clickAge >= 0.0) {
    vec2 clickDelta = (uv - u_click) * aspect;
    float clickDistance = length(clickDelta);
    float clickRadius = u_clickAge * 0.24;
    float clickRing = exp(-pow((clickDistance - clickRadius) * 15.0, 2.0)) * exp(-u_clickAge * 2.5);
    flow += vec2(-clickDelta.y, clickDelta.x) * clickRing * u_stir * 2.6;
  }

  vec2 warped = p + (flow - 0.5) * u_warp;
  float field = fbm(warped * 2.5 + flow * u_amplitude + vec2(time * 0.8, -time));
  float detail = fbm(warped * 5.0 - flow * u_amplitude * 1.7);
  float bands = sin((field * 2.0 + detail * 0.65 + length(warped) * 0.42) * 6.28318);
  float sheen = pow(max(0.0, 1.0 - abs(bands)), 7.0) * u_sheen;
  float light = (field * 0.7 + detail * 0.3) * u_brightness + sheen * 0.34;
  light = (light - 0.5) * u_contrast + 0.5;

  vec3 color = u_color * light;
  color += vec3(0.11, 0.22, 0.42) * sheen;
  color = hueShift(color, u_hueShift);
  float luminance = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(luminance), color, u_saturation);

  float vignette = smoothstep(0.0, 0.82, length((uv - 0.5) * vec2(0.88, 1.1)));
  float alpha = clamp((0.2 + field * 0.52 + sheen * 0.18) * (1.0 - u_fade * vignette), 0.0, 0.88);
  float grain = (hash(gl_FragCoord.xy + u_time) - 0.5) * u_grain;
  color += grain;
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), alpha);
}`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);
}

export default function Iridescence({
  color = '#5c8fd8',
  hueShift = 0,
  saturation = 1,
  brightness = 1.5,
  contrast = 1,
  speed = 1,
  scale = 1,
  detail = 8,
  warp = 1,
  rotation = 0,
  mouseReact = true,
  amplitude = 0.1,
  stir = 0.5,
  sheen = 0.3,
  clickSwirl = true,
  grain = 0,
  fade = 0,
  quality = 'high',
  interactionRef,
  className = '',
}) {
  const canvasRef = useRef(null);
  const hostRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const scope = interactionRef?.current || host?.parentElement;
    if (!canvas || !host || !scope) return undefined;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: quality === 'high', premultipliedAlpha: false });
    if (!gl) return undefined;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return undefined;

    const program = gl.createProgram();
    if (!program) return undefined;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return undefined;
    }

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      return undefined;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const names = ['u_resolution', 'u_mouse', 'u_click', 'u_time', 'u_hueShift', 'u_saturation', 'u_brightness', 'u_contrast', 'u_scale', 'u_detail', 'u_warp', 'u_amplitude', 'u_stir', 'u_sheen', 'u_grain', 'u_fade', 'u_mouseReact', 'u_clickAge', 'u_color'];
    const uniforms = Object.fromEntries(names.map((name) => [name, gl.getUniformLocation(program, name)]));
    const pointer = { x: 0.5, y: 0.5, clickX: 0.5, clickY: 0.5, inside: false, clickAt: -1 };
    const rgb = hexToRgb(color);
    const startTime = performance.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let disposed = false;

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      const ratio = quality === 'high' ? Math.min(window.devicePixelRatio || 1, 2) : Math.min(window.devicePixelRatio || 1, 1);
      const width = Math.max(1, Math.round(bounds.width * ratio));
      const height = Math.max(1, Math.round(bounds.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const pointInScope = (event, point) => {
      const bounds = scope.getBoundingClientRect();
      point.x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      point.y = 1 - Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    };
    const onPointerMove = (event) => {
      const bounds = scope.getBoundingClientRect();
      pointer.inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      pointInScope(event, pointer);
    };
    const onPointerLeave = (event) => {
      if (event.relatedTarget && scope.contains(event.relatedTarget)) return;
      pointer.inside = false;
    };
    const onPointerDown = (event) => {
      pointInScope(event, pointer);
      pointer.clickX = pointer.x;
      pointer.clickY = pointer.y;
      pointer.clickAt = performance.now();
    };

    const render = (now) => {
      if (disposed) return;
      resize();
      gl.useProgram(program);
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.u_mouse, pointer.x, pointer.y);
      gl.uniform2f(uniforms.u_click, pointer.clickX, pointer.clickY);
      gl.uniform1f(uniforms.u_time, reducedMotion.matches ? 0 : ((now - startTime) / 1000) * speed + rotation);
      gl.uniform1f(uniforms.u_hueShift, hueShift);
      gl.uniform1f(uniforms.u_saturation, saturation);
      gl.uniform1f(uniforms.u_brightness, brightness);
      gl.uniform1f(uniforms.u_contrast, contrast);
      gl.uniform1f(uniforms.u_scale, scale);
      gl.uniform1f(uniforms.u_detail, detail);
      gl.uniform1f(uniforms.u_warp, warp);
      gl.uniform1f(uniforms.u_amplitude, amplitude);
      gl.uniform1f(uniforms.u_stir, stir);
      gl.uniform1f(uniforms.u_sheen, sheen);
      gl.uniform1f(uniforms.u_grain, grain);
      gl.uniform1f(uniforms.u_fade, fade);
      gl.uniform1f(uniforms.u_mouseReact, mouseReact && pointer.inside ? 1 : 0);
      gl.uniform1f(uniforms.u_clickAge, clickSwirl && pointer.clickAt >= 0 ? (now - pointer.clickAt) / 1000 : -1);
      gl.uniform3fv(uniforms.u_color, rgb);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reducedMotion.matches) frame = window.requestAnimationFrame(render);
    };

    scope.addEventListener('pointermove', onPointerMove);
    scope.addEventListener('pointerleave', onPointerLeave);
    scope.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', resize);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();
    frame = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      scope.removeEventListener('pointermove', onPointerMove);
      scope.removeEventListener('pointerleave', onPointerLeave);
      scope.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', resize);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [amplitude, brightness, clickSwirl, color, contrast, detail, fade, grain, hueShift, interactionRef, mouseReact, quality, rotation, saturation, scale, sheen, speed, stir, warp]);

  return <div className={`iridescence ${className}`} ref={hostRef} aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
