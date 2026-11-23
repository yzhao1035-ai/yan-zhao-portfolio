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
uniform sampler2D u_texture;
uniform vec2 u_pointer;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_radius;
uniform float u_strength;
uniform float u_swirl;
uniform float u_rings;
uniform float u_spread;
uniform float u_fade;
uniform float u_dispersion;
uniform float u_grayscale;
uniform float u_tintAmount;
uniform float u_glint;
uniform vec3 u_tint;
uniform vec3 u_highlight;
uniform float u_clickAge;
uniform float u_clickStrength;
uniform float u_enabled;

void main() {
  vec2 delta = v_uv - u_pointer;
  delta.x *= u_resolution.x / u_resolution.y;
  float distanceToPointer = length(delta);
  float brush = (1.0 - smoothstep(u_radius * 0.65, u_radius, distanceToPointer)) * u_enabled;
  float phase = distanceToPointer * u_rings * 6.28318 - u_time * 3.8;
  float wave = sin(phase) * exp(-distanceToPointer * u_fade) * brush;

  if (u_clickAge >= 0.0) {
    float ringRadius = u_clickAge * u_spread * 0.2;
    float ringDistance = distanceToPointer - ringRadius;
    float clickWave = exp(-ringDistance * ringDistance * 1000.0) * exp(-u_clickAge * 2.0);
    wave += sin(ringDistance * 52.0) * clickWave * u_clickStrength;
  }

  vec2 direction = delta / max(distanceToPointer, 0.0001);
  float angle = wave * u_swirl * 0.28;
  float sine = sin(angle);
  float cosine = cos(angle);
  vec2 rotated = vec2(delta.x * cosine - delta.y * sine, delta.x * sine + delta.y * cosine);
  vec2 warpedUv = u_pointer + vec2(rotated.x / (u_resolution.x / u_resolution.y), rotated.y);
  warpedUv += vec2(direction.x / (u_resolution.x / u_resolution.y), direction.y) * wave * u_strength * 0.025;
  warpedUv = clamp(warpedUv, 0.001, 0.999);

  vec2 colorShift = direction * wave * u_dispersion * 0.0015;
  colorShift.x /= u_resolution.x / u_resolution.y;
  vec4 center = texture2D(u_texture, warpedUv);
  vec4 redSample = texture2D(u_texture, clamp(warpedUv + colorShift, 0.001, 0.999));
  vec4 blueSample = texture2D(u_texture, clamp(warpedUv - colorShift, 0.001, 0.999));
  vec3 color = vec3(redSample.r, center.g, blueSample.b);
  float gray = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(color, vec3(gray), u_grayscale);
  color = mix(color, color * u_tint, u_tintAmount);
  float highlight = min(abs(wave) * u_glint, 1.0);
  color = mix(color, u_highlight, highlight);
  gl_FragColor = vec4(color, center.a);
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

function colorToRgb(color) {
  const value = color.replace('#', '');
  const normalized = value.length === 3 ? value.split('').map((part) => part + part).join('') : value;
  return [0, 2, 4].map((index) => parseInt(normalized.slice(index, index + 2), 16) / 255);
}

export default function RippleDistortion({
  src,
  brushSize = 150,
  strength = 0.2,
  swirl = 1,
  rings = 4,
  grayscale = false,
  spread = 5,
  fade = 3,
  dispersion = 0,
  glint = 0,
  tint = '#a855f7',
  tintAmount = 0.1,
  highlightColor = '#ffffff',
  trigger = 'hover',
  clickStrength = 2,
  quality = 'low',
  enabled = true,
  className = '',
}) {
  const canvasRef = useRef(null);
  const hostRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const fallback = imageRef.current;
    if (!canvas || !host || !fallback) return undefined;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: quality !== 'low', premultipliedAlpha: true });
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

    const positions = gl.createBuffer();
    const texture = gl.createTexture();
    if (!positions || !texture) {
      gl.deleteProgram(program);
      return undefined;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positions);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);

    const uniforms = Object.fromEntries([
      'u_pointer', 'u_resolution', 'u_time', 'u_radius', 'u_strength', 'u_swirl', 'u_rings', 'u_spread', 'u_fade',
      'u_dispersion', 'u_grayscale', 'u_tintAmount', 'u_glint', 'u_tint', 'u_highlight', 'u_clickAge', 'u_clickStrength', 'u_enabled',
    ].map((name) => [name, gl.getUniformLocation(program, name)]));

    const pointer = { x: 0.5, y: 0.5, inside: false, clickAt: -1 };
    const tintRgb = colorToRgb(tint);
    const highlightRgb = colorToRgb(highlightColor);
    const startTime = performance.now();
    let frameId = 0;
    let disposed = false;
    let imageReady = false;

    const uploadImage = () => {
      if (!fallback.complete || !fallback.naturalWidth) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fallback);
      imageReady = true;
      host.classList.add('is-webgl-ready');
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const pixelRatio = quality === 'low' ? Math.min(window.devicePixelRatio || 1, 0.8) : Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(rect.width * pixelRatio));
      const height = Math.max(1, Math.round(rect.height * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const setUniforms = (now) => {
      gl.uniform2f(uniforms.u_pointer, pointer.x, pointer.y);
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.u_time, (now - startTime) / 1000);
      gl.uniform1f(uniforms.u_radius, brushSize / Math.max(host.getBoundingClientRect().width, 1));
      gl.uniform1f(uniforms.u_strength, strength);
      gl.uniform1f(uniforms.u_swirl, swirl);
      gl.uniform1f(uniforms.u_rings, rings);
      gl.uniform1f(uniforms.u_spread, spread);
      gl.uniform1f(uniforms.u_fade, fade);
      gl.uniform1f(uniforms.u_dispersion, dispersion);
      gl.uniform1f(uniforms.u_grayscale, grayscale ? 1 : 0);
      gl.uniform1f(uniforms.u_tintAmount, tintAmount);
      gl.uniform1f(uniforms.u_glint, glint);
      gl.uniform3fv(uniforms.u_tint, tintRgb);
      gl.uniform3fv(uniforms.u_highlight, highlightRgb);
      gl.uniform1f(uniforms.u_clickAge, pointer.clickAt < 0 ? -1 : (now - pointer.clickAt) / 1000);
      gl.uniform1f(uniforms.u_clickStrength, clickStrength);
      const clickActive = pointer.clickAt >= 0 && (now - pointer.clickAt) < 1500;
      const triggerActive = trigger === 'hover' ? pointer.inside || (clickActive && clickStrength > 0) : trigger === 'click' ? clickActive : trigger === 'both' ? pointer.inside || clickActive : false;
      gl.uniform1f(uniforms.u_enabled, enabled && triggerActive ? 1 : 0);
    };

    const render = (now) => {
      if (disposed || !imageReady) return;
      resize();
      gl.useProgram(program);
      setUniforms(now);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (enabled && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) frameId = window.requestAnimationFrame(render);
    };

    const updatePointer = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      pointer.y = 1 - Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      pointer.inside = true;
    };
    const onPointerMove = (event) => updatePointer(event);
    const onPointerLeave = () => { pointer.inside = false; };
    const onClick = (event) => {
      updatePointer(event);
      pointer.clickAt = performance.now();
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('click', onClick);
    window.addEventListener('resize', resize);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();
    fallback.addEventListener('load', uploadImage);
    if (fallback.complete) uploadImage();
    frameId = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('click', onClick);
      fallback.removeEventListener('load', uploadImage);
      host.classList.remove('is-webgl-ready');
      gl.deleteTexture(texture);
      gl.deleteBuffer(positions);
      gl.deleteProgram(program);
    };
  }, [brushSize, clickStrength, dispersion, enabled, fade, glint, grayscale, highlightColor, quality, rings, src, spread, strength, swirl, tint, tintAmount, trigger]);

  return (
    <div className={`ripple-distortion ${className}`} ref={hostRef}>
      <img className="ripple-distortion-fallback" ref={imageRef} src={src} alt="" draggable="false" />
      <canvas className="ripple-distortion-canvas" ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
