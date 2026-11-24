"use client";

import React, { forwardRef, useEffect, useRef, useState } from "react";

export type GlassBackdrop =
  | string
  | HTMLImageElement
  | HTMLCanvasElement
  | HTMLVideoElement;

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  enableLiquidEffect?: boolean;
  /** Texture for real refraction. A URL must be same-origin or CORS-enabled. */
  backdrop?: GlassBackdrop;
  /** Element displaying that texture behind this surface. Centered object-fit only. */
  backdropRef?: React.RefObject<HTMLElement | null>;
  backdropFit?: "cover" | "contain" | "stretch";
  /** Update a moving surface, video or canvas every frame. Static surfaces render on demand. */
  live?: boolean;
  refraction?: number;
  /** Optical thickness in CSS pixels, bounded to the surface size. */
  thickness?: number;
  /** Strength of the fixed studio reflections, from 0 to 2. */
  reflection?: number;
  distortion?: number;
  bevel?: number;
  /** Refraction band in CSS pixels. Omit to derive it from radius and thickness. */
  bevelWidth?: number;
  dispersion?: number;
  frost?: number;
  shine?: number;
  /** Degrees clockwise from the top: 0 top, 90 right, 180 bottom, 270 left. */
  shineAngle?: number;
  tint?: string;
  tintOpacity?: number;
  borderWidth?: number;
  borderOpacity?: number;
  maxDpr?: number;
  onEffectError?: (error: Error) => void;
}

const VERTEX = `#version 300 es
in vec2 position;
out vec2 uv;
void main() {
  uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Static, analytic WebGL meniscus. No SVG, time uniform or pointer deformation.
const FRAGMENT = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D textureImage;
uniform vec2 size, sourceOrigin, sourceSize;
uniform float radius, aa, refractAmount, distortion, bevel, bevelWidth, dispersion;
uniform float thickness, reflection;
uniform float frost, shine, angle, borderWidth, borderOpacity, hasSource, clipToSource;
uniform vec4 surfaceTint;
out vec4 fragColor;

float outline(vec2 p) {
  vec2 q = abs(p) - (size * 0.5 - vec2(radius));
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

vec2 outward(vec2 p) {
  vec2 g = vec2(
    outline(p + vec2(0.5, 0.0)) - outline(p - vec2(0.5, 0.0)),
    outline(p + vec2(0.0, 0.5)) - outline(p - vec2(0.0, 0.5))
  );
  // A flat center and the SDF's medial axes can have a zero gradient.
  // Never normalize zero: NaN * zero is still NaN in the clear region.
  return g / max(length(g), 0.0001);
}

vec4 sampleScene(vec2 point) {
  vec2 st = (point - sourceOrigin) / sourceSize;
  if (clipToSource > 0.5 && (st.x < 0.0 || st.y < 0.0 || st.x > 1.0 || st.y > 1.0)) return vec4(0.0);
  // Uploads use UNPACK_FLIP_Y_WEBGL. DOM coordinates increase downwards.
  return texture(textureImage, vec2(clamp(st.x, 0.0, 1.0), 1.0 - clamp(st.y, 0.0, 1.0)));
}

void main() {
  vec2 point = vec2(uv.x * size.x, (1.0 - uv.y) * size.y);
  vec2 p = point - size * 0.5;
  float d = outline(p);
  float mask = 1.0 - smoothstep(-aa, aa, d);
  if (mask < 0.001) { fragColor = vec4(0.0); return; }

  float inside = max(-d, 0.0);
  float automaticWidth = max(12.0, radius * (0.8 + bevel) + thickness * bevel);
  float reach = min(bevelWidth > 0.0 ? bevelWidth : automaticWidth, min(size.x, size.y) * 0.48);
  float u = clamp(inside / max(reach, 0.5), 0.0, 1.0);
  float edge = 1.0 - u;
  vec2 normal2 = outward(p);

  // A rounded meniscus, not a narrow power-function border. Its slope
  // settles smoothly to a flat, completely undistorted central face.
  float slope = sqrt(max(0.0, 1.0 - u * u));
  vec3 normal3 = normalize(vec3(normal2 * slope, max(u, 0.001)));
  float ior = 1.0 + refractAmount * 0.65;
  vec3 ray = refract(vec3(0.0, 0.0, -1.0), normal3, 1.0 / ior);
  vec2 bend = ray.xy / max(-ray.z, 0.2) * thickness * (0.75 + refractAmount * 0.5);
  // Bound sampling to one local bevel: no multiple folds or stretched panes.
  bend *= min(1.0, reach * 0.85 / max(length(bend), 0.0001));

  // Optional static lens curvature. Zero never warps the reading region.
  vec2 lens = p / max(size * 0.5, vec2(1.0));
  bend -= lens * distortion * thickness * refractAmount * (1.0 - edge);
  vec2 samplePoint = point + bend;

  // shineAngle is clockwise from the top, in DOM coordinates.
  vec2 light = vec2(sin(angle), -cos(angle));
  float facing = dot(normal2, light);
  float directional = 0.18 + 0.82 * pow(abs(facing), 4.0);
  float fresnel = pow(1.0 - clamp(normal3.z, 0.0, 1.0), 5.0);
  float edgeLight = (pow(edge, 5.0) * directional * 0.32 + fresnel * 0.12) * shine * reflection;
  float border = borderWidth > 0.0 ? (1.0 - smoothstep(borderWidth, borderWidth + aa, inside)) * borderOpacity : 0.0;
  float highlight = clamp(edgeLight + border, 0.0, 0.65);

  vec4 color = vec4(0.0);
  if (hasSource > 0.5) {
    color = sampleScene(samplePoint);
    if (edge > 0.0 && dispersion > 0.001 && refractAmount > 0.001) {
      vec2 split = normal2 * dispersion * thickness * 0.35 * slope;
      color.r = sampleScene(samplePoint + split).r;
      color.b = sampleScene(samplePoint - split).b;
    }
    float blurRadius = frost * 6.0 * slope;
    if (blurRadius > 0.15) {
      vec4 blurred = (sampleScene(samplePoint + vec2(blurRadius, 0.0)) +
                      sampleScene(samplePoint - vec2(blurRadius, 0.0)) +
                      sampleScene(samplePoint + vec2(0.0, blurRadius)) +
                      sampleScene(samplePoint - vec2(0.0, blurRadius))) * 0.25;
      color = mix(color, blurred, min(frost, 0.85));
    }
    // Restrained absorption adds depth without drawing an opaque white rim.
    color.rgb *= 1.0 - reflection * 0.075 * pow(edge, 3.0);
  }

  // Tint must also work when a source contains transparent pixels.
  float tintAlpha = surfaceTint.a;
  float alpha = color.a + tintAlpha * (1.0 - color.a);
  vec3 premul = color.rgb * color.a * (1.0 - tintAlpha) + surfaceTint.rgb * tintAlpha;
  premul = premul * (1.0 - highlight) + vec3(highlight);
  alpha = alpha + highlight * (1.0 - alpha);
  fragColor = vec4(premul / max(alpha, 0.0001), alpha * mask);
}
`;

const limit = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, Number.isFinite(value) ? value : low));

function tintRgba(
  value: string,
  opacity: number,
): [number, number, number, number] {
  const hex = value.trim().replace(/^#/, "");
  if (!/^(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(hex)) {
    return [255, 255, 255, opacity];
  }
  const expanded = hex.length <= 4 ? [...hex].map((c) => c + c).join("") : hex;
  const rgb = [0, 2, 4].map((i) => parseInt(expanded.slice(i, i + 2), 16));
  const alpha =
    expanded.length === 8 ? parseInt(expanded.slice(6), 16) / 255 : 1;
  return [rgb[0], rgb[1], rgb[2], alpha * opacity];
}

/**
 * Static WebGL 2 liquid-glass wrapper. Children remain live, clickable DOM.
 * backdrop accepts a same-origin/CORS image, video or canvas; backdropRef aligns
 * that texture with the visible element behind the wrapper. Arbitrary HTML
 * cannot be read by WebGL. With no texture, only surface lighting is rendered.
 * live only updates dynamic textures; it never moves, follows or wobbles glass.
 * For a static canvas refresh: ref.current?.dispatchEvent(new Event("glass-refresh"));
 */
const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
  function GlassSurface(
    {
      children,
      className,
      style,
      width,
      height,
      borderRadius = 24,
      enableLiquidEffect = true,
      backdrop,
      backdropRef,
      backdropFit = "cover",
      live = false,
      refraction = 0.85,
      thickness = 20,
      reflection = 0.8,
      distortion = 0,
      bevel = 0.5,
      bevelWidth,
      dispersion = 0.02,
      frost = 0,
      shine = 0.65,
      shineAngle = 315,
      tint = "#ffffff",
      tintOpacity = 0.01,
      borderWidth = 0.6,
      borderOpacity = 0.09,
      maxDpr = 1.5,
      onEffectError,
      ...rest
    },
    forwardedRef,
  ) {
    const host = useRef<HTMLDivElement | null>(null);
    const canvas = useRef<HTMLCanvasElement | null>(null);
    const render = useRef<() => void>(() => {});
    const options = useRef({
      refraction,
      thickness,
      reflection,
      distortion,
      bevel,
      bevelWidth,
      dispersion,
      frost,
      shine,
      shineAngle,
      borderWidth,
      borderOpacity,
      maxDpr,
      backdropFit,
      live,
      tint,
      tintOpacity,
    });
    const refs = useRef({ backdropRef, onEffectError });
    const [status, setStatus] = useState<"loading" | "webgl" | "fallback">(
      "loading",
    );
    const [textured, setTextured] = useState(false);
    const [solid, setSolid] = useState(false);

    useEffect(() => {
      const queries = [
        matchMedia("(prefers-reduced-transparency: reduce)"),
        matchMedia("(forced-colors: active)"),
      ];
      const update = () => setSolid(queries.some((q) => q.matches));
      update();
      queries.forEach((q) => q.addEventListener("change", update));
      return () =>
        queries.forEach((q) => q.removeEventListener("change", update));
    }, []);

    useEffect(() => {
      options.current = {
        refraction,
        thickness,
        reflection,
        distortion,
        bevel,
        bevelWidth,
        dispersion,
        frost,
        shine,
        shineAngle,
        borderWidth,
        borderOpacity,
        maxDpr,
        backdropFit,
        live,
        tint,
        tintOpacity,
      };
      refs.current = { backdropRef, onEffectError };
      render.current();
    }, [
      refraction,
      thickness,
      reflection,
      distortion,
      bevel,
      bevelWidth,
      dispersion,
      frost,
      shine,
      shineAngle,
      borderWidth,
      borderOpacity,
      maxDpr,
      backdropFit,
      live,
      backdropRef,
      onEffectError,
      borderRadius,
      width,
      height,
      className,
      style,
      tint,
      tintOpacity,
    ]);

    useEffect(() => {
      const element = host.current;
      const target = canvas.current;
      if (!element || !target || !enableLiquidEffect || solid) return;
      setStatus("loading");
      setTextured(false);
      const gl = target.getContext("webgl2", {
        alpha: true,
        premultipliedAlpha: false,
        antialias: false,
        stencil: false,
        depth: false,
      });
      if (!gl) {
        setStatus("fallback");
        const error = new Error("WebGL 2 is unavailable; using the CSS material fallback.");
        if (refs.current.onEffectError) refs.current.onEffectError(error);
        else console.warn("[GlassSurface]", error.message);
        return;
      }
      let program: WebGLProgram | null = null;
      let buffer: WebGLBuffer | null = null;
      let texture: WebGLTexture | null = null;
      let source: Exclude<GlassBackdrop, string> | null = null;
      let disposed = false,
        lost = false,
        failed = false,
        visible = true,
        frame = 0,
        needsUpload = false;
      let uploadedWidth = 0,
        uploadedHeight = 0;
      let shaders: WebGLShader[] = [];
      let cancelLoad = () => {};
      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      const fail = (reason: unknown) => {
        if (disposed || failed) return;
        failed = true;
        cancelAnimationFrame(frame);
        frame = 0;
        setTextured(false);
        setStatus("fallback");
        const error = reason instanceof Error ? reason : new Error(String(reason));
        if (refs.current.onEffectError) refs.current.onEffectError(error);
        else console.warn("[GlassSurface]", error.message);
      };
      function release() {
        if (program) gl!.deleteProgram(program);
        if (buffer) gl!.deleteBuffer(buffer);
        if (texture) gl!.deleteTexture(texture);
        shaders.forEach((s) => gl!.deleteShader(s));
        program = null;
        buffer = null;
        texture = null;
        shaders = [];
      }
      function compile(type: number, code: string) {
        const shader = gl!.createShader(type);
        if (!shader) throw new Error("Cannot allocate a glass shader.");
        shaders.push(shader);
        gl!.shaderSource(shader, code);
        gl!.compileShader(shader);
        if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS))
          throw new Error(
            gl!.getShaderInfoLog(shader) || "Glass shader failed to compile.",
          );
        return shader;
      }
      function sourceDimensions() {
        if (!source) return [0, 0];
        if (source instanceof HTMLVideoElement)
          return [source.videoWidth, source.videoHeight];
        if (source instanceof HTMLImageElement)
          return [source.naturalWidth, source.naturalHeight];
        return [source.width, source.height];
      }
      function draw() {
        frame = 0;
        if (disposed || lost || failed || !program || !visible || document.hidden) return;
        try {
          const o = options.current;
          const rect = element!.getBoundingClientRect();
          const w = element!.clientWidth,
            h = element!.clientHeight;
          if (!w || !h) return;
          const pixelLimit = Math.sqrt(2_000_000 / (w * h));
          const dpr = Math.min(
            devicePixelRatio || 1,
            limit(o.maxDpr, 0.5, 3),
            pixelLimit,
          );
          const rw = Math.max(1, Math.round(w * dpr)),
            rh = Math.max(1, Math.round(h * dpr));
          if (target!.width !== rw || target!.height !== rh) {
            target!.width = rw;
            target!.height = rh;
          }
          gl!.viewport(0, 0, rw, rh);
          gl!.useProgram(program);
          gl!.activeTexture(gl!.TEXTURE0);
          gl!.bindTexture(gl!.TEXTURE_2D, texture);
          const [sw, sh] = sourceDimensions();
          const hasSource = !!source && sw > 0 && sh > 0;
          if (
            hasSource &&
            (needsUpload || (o.live && !(source instanceof HTMLImageElement)))
          ) {
            gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true);
            if (sw === uploadedWidth && sh === uploadedHeight) {
              gl!.texSubImage2D(gl!.TEXTURE_2D, 0, 0, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, source!);
            } else {
              gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, source!);
              uploadedWidth = sw;
              uploadedHeight = sh;
            }
            if (gl!.getError() !== gl!.NO_ERROR)
              throw new Error("Glass texture upload failed.");
            needsUpload = false;
          }
          const f = (name: string, value: number) =>
            gl!.uniform1f(uniforms[name], value);
          const v = (name: string, x: number, y: number) =>
            gl!.uniform2f(uniforms[name], x, y);
          v("size", w, h);
          // Convert screen coordinates back to this surface's CSS-pixel space.
          const sx = rect.width / w || 1,
            sy = rect.height / h || 1;
          const bg =
            refs.current.backdropRef?.current?.getBoundingClientRect() || rect;
          const bw = bg.width / sx,
            bh = bg.height / sy;
          let dw = bw,
            dh = bh;
          if (hasSource && o.backdropFit !== "stretch") {
            const scale =
              o.backdropFit === "cover"
                ? Math.max(bw / sw, bh / sh)
                : Math.min(bw / sw, bh / sh);
            dw = sw * scale;
            dh = sh * scale;
          }
          v(
            "sourceOrigin",
            (bg.left - rect.left) / sx + (bw - dw) / 2,
            (bg.top - rect.top) / sy + (bh - dh) / 2,
          );
          v("sourceSize", Math.max(1, dw), Math.max(1, dh));
          const cssRadius =
            parseFloat(getComputedStyle(element!).borderTopLeftRadius) || 0;
          f("radius", Math.min(cssRadius, w / 2, h / 2));
          f("aa", 0.8 / Math.max(dpr, 0.1));
          f("refractAmount", limit(o.refraction, 0, 2));
          f(
            "thickness",
            Math.min(limit(o.thickness, 0.5, 100), Math.min(w, h) * 0.5),
          );
          f("reflection", limit(o.reflection, 0, 2));
          f("distortion", limit(o.distortion, 0, 1));
          f("bevel", limit(o.bevel, 0, 1));
          f("bevelWidth", o.bevelWidth === undefined ? 0 : limit(o.bevelWidth, 0.5, 200));
          f("dispersion", limit(o.dispersion, 0, 1));
          f("frost", limit(o.frost, 0, 1));
          f("shine", limit(o.shine, 0, 1));
          f("angle", ((o.shineAngle % 360) * Math.PI) / 180);
          f("borderWidth", limit(o.borderWidth, 0, 4));
          f("borderOpacity", limit(o.borderOpacity, 0, 1));
          const rgba = tintRgba(o.tint, limit(o.tintOpacity, 0, 1));
          gl!.uniform4f(
            uniforms.surfaceTint,
            rgba[0] / 255,
            rgba[1] / 255,
            rgba[2] / 255,
            rgba[3],
          );
          f("hasSource", hasSource ? 1 : 0);
          f("clipToSource", o.backdropFit === "contain" ? 1 : 0);
          gl!.uniform1i(uniforms.textureImage, 0);
          gl!.clearColor(0, 0, 0, 0);
          gl!.clear(gl!.COLOR_BUFFER_BIT);
          gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
          setStatus((previous) => (previous === "webgl" ? previous : "webgl"));
          setTextured((previous) =>
            previous === hasSource ? previous : hasSource,
          );
          if (o.live && source && !(source instanceof HTMLImageElement))
            frame = requestAnimationFrame(draw);
        } catch (error) {
          fail(error);
        }
      }
      function requestDraw() {
        if (!frame && !disposed && !lost && !failed && visible && !document.hidden)
          frame = requestAnimationFrame(draw);
      }
      function initialize() {
        try {
          lost = false;
          failed = false;
          release();
          uploadedWidth = 0;
          uploadedHeight = 0;
          program = gl!.createProgram();
          if (!program) throw new Error("Cannot allocate the glass program.");
          gl!.attachShader(program, compile(gl!.VERTEX_SHADER, VERTEX));
          gl!.attachShader(program, compile(gl!.FRAGMENT_SHADER, FRAGMENT));
          gl!.linkProgram(program);
          if (!gl!.getProgramParameter(program, gl!.LINK_STATUS))
            throw new Error(
              gl!.getProgramInfoLog(program) || "Glass program failed to link.",
            );
          gl!.useProgram(program);
          buffer = gl!.createBuffer();
          if (!buffer)
            throw new Error("Cannot allocate the glass vertex buffer.");
          gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer);
          gl!.bufferData(
            gl!.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            gl!.STATIC_DRAW,
          );
          const location = gl!.getAttribLocation(program, "position");
          gl!.enableVertexAttribArray(location);
          gl!.vertexAttribPointer(location, 2, gl!.FLOAT, false, 0, 0);
          texture = gl!.createTexture();
          if (!texture) throw new Error("Cannot allocate the glass texture.");
          gl!.bindTexture(gl!.TEXTURE_2D, texture);
          for (const [name, value] of [
            [gl!.TEXTURE_MIN_FILTER, gl!.LINEAR],
            [gl!.TEXTURE_MAG_FILTER, gl!.LINEAR],
            [gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE],
            [gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE],
          ])
            gl!.texParameteri(gl!.TEXTURE_2D, name, value);
          gl!.texImage2D(
            gl!.TEXTURE_2D,
            0,
            gl!.RGBA,
            1,
            1,
            0,
            gl!.RGBA,
            gl!.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 0]),
          );
          for (const name of [
            "textureImage",
            "size",
            "sourceOrigin",
            "sourceSize",
            "radius",
            "aa",
            "refractAmount",
            "thickness",
            "reflection",
            "distortion",
            "bevel",
            "bevelWidth",
            "dispersion",
            "frost",
            "shine",
            "angle",
            "borderWidth",
            "borderOpacity",
            "hasSource",
            "surfaceTint",
            "clipToSource",
          ])
            uniforms[name] = gl!.getUniformLocation(program, name);
          needsUpload = true;
          requestDraw();
        } catch (error) {
          release();
          fail(error);
        }
      }
      const onLost = (event: Event) => {
        event.preventDefault();
        lost = true;
        program = null;
        buffer = null;
        texture = null;
        shaders = [];
        cancelAnimationFrame(frame);
        frame = 0;
        setTextured(false);
        setStatus("fallback");
      };
      target.addEventListener("webglcontextlost", onLost);
      target.addEventListener("webglcontextrestored", initialize);
      render.current = requestDraw;
      initialize();
      if (backdrop) {
        const image = typeof backdrop === "string" ? new Image() : backdrop;
        if (typeof backdrop === "string" && image instanceof HTMLImageElement) {
          image.crossOrigin = "anonymous";
        }
        const loaded = () => {
          source = image;
          needsUpload = true;
          requestDraw();
        };
        const failed = () =>
          fail(
            new Error(
              "Glass backdrop failed to load. Use a same-origin image or enable CORS.",
            ),
          );
        const event = image instanceof HTMLVideoElement ? "loadeddata" : "load";
        image.addEventListener(event, loaded);
        image.addEventListener("error", failed);
        cancelLoad = () => {
          image.removeEventListener(event, loaded);
          image.removeEventListener("error", failed);
        };
        if (typeof backdrop === "string")
          (image as HTMLImageElement).src = backdrop;
        else if (
          image instanceof HTMLCanvasElement ||
          (image instanceof HTMLImageElement && image.complete) ||
          (image instanceof HTMLVideoElement && image.readyState >= 2)
        )
          loaded();
      }
      const resize = new ResizeObserver(requestDraw);
      resize.observe(element);
      if (refs.current.backdropRef?.current)
        resize.observe(refs.current.backdropRef.current);
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) requestDraw();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      });
      intersection.observe(element);
      const refreshSource = () => {
        needsUpload = true;
        requestDraw();
      };
      element.addEventListener("glass-refresh", refreshSource);
      element.addEventListener("glass-redraw", requestDraw);
      window.addEventListener("resize", requestDraw);
      window.addEventListener("scroll", requestDraw, true);
      const onVisibility = () => {
        if (document.hidden) {
          cancelAnimationFrame(frame);
          frame = 0;
        } else requestDraw();
      };
      document.addEventListener("visibilitychange", onVisibility);
      return () => {
        disposed = true;
        cancelAnimationFrame(frame);
        cancelLoad();
        render.current = () => {};
        resize.disconnect();
        intersection.disconnect();
        element.removeEventListener("glass-refresh", refreshSource);
        element.removeEventListener("glass-redraw", requestDraw);
        window.removeEventListener("resize", requestDraw);
        window.removeEventListener("scroll", requestDraw, true);
        document.removeEventListener("visibilitychange", onVisibility);
        target.removeEventListener("webglcontextlost", onLost);
        target.removeEventListener("webglcontextrestored", initialize);
        release();
      };
    }, [backdrop, backdropRef, enableLiquidEffect, solid]);

    const effectOn = enableLiquidEffect && !solid;
    const blur = effectOn && !textured ? limit(frost, 0, 2) * 20 : 0;
    const material = `rgba(${tintRgba(tint, limit(tintOpacity, 0, 1)).join(",")})`;
    return (
      <div
        {...rest}
        ref={(node) => {
          host.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        className={className}
        data-glass-renderer={effectOn ? status : "fallback"}
        data-glass-refraction={effectOn && textured ? "texture" : "none"}
        style={{
          position: "relative",
          isolation: "isolate",
          borderRadius,
          width,
          height,
          ...style,
          ...(solid ? { color: "CanvasText" } : {}),
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -2,
            pointerEvents: "none",
            borderRadius: "inherit",
            background: solid ? "Canvas" : material,
            backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
            WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
          }}
        />
        {effectOn && (
          <canvas
            ref={canvas}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: -1,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              borderRadius: "inherit",
              visibility: status === "webgl" ? "visible" : "hidden",
            }}
          />
        )}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -1,
            pointerEvents: "none",
            borderRadius: "inherit",
            boxShadow: `inset 0 0 0 ${effectOn && status === "webgl" ? 0 : limit(borderWidth, 0, 4)}px rgba(255,255,255,${limit(borderOpacity, 0, 1)})`,
          }}
        />
        {children}
      </div>
    );
  },
);

export default GlassSurface;

