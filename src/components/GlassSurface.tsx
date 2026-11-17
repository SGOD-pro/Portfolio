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

// Fixed rounded glass volume. No time, pointer, noise, springs or shape morphing.
const FRAGMENT = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D textureImage;
uniform vec2 size, sourceOrigin, sourceSize;
uniform float radius, aa, refractAmount, distortion, bevel, dispersion;
uniform float thickness, reflection;
uniform float frost, shine, angle, borderWidth, borderOpacity, hasSource, clipToSource;
uniform vec4 surfaceTint;
out vec4 fragColor;

float outline(vec2 p) {
  vec2 q = abs(p) - (size * 0.5 - vec2(radius));
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float field(vec3 p) {
  float rim = max(0.02, min(thickness * 0.48, 24.0) * bevel);
  vec2 relative = p.xy / max(size * 0.5, vec2(1.0));
  float dome = 1.0 - distortion * 0.3 * clamp(dot(relative, relative) * 0.5, 0.0, 1.0);
  vec2 q = vec2(outline(p.xy) + rim, abs(p.z) - thickness * 0.5 * dome + rim);
  // Conservative stepping for the slightly curved front/back faces.
  return (length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rim) * 0.75;
}

vec3 surfaceNormal(vec3 p) {
  float e = 0.12;
  return normalize(vec3(
    field(p + vec3(e, 0.0, 0.0)) - field(p - vec3(e, 0.0, 0.0)),
    field(p + vec3(0.0, e, 0.0)) - field(p - vec3(0.0, e, 0.0)),
    field(p + vec3(0.0, 0.0, e)) - field(p - vec3(0.0, 0.0, e))
  ));
}

vec4 sampleScene(vec2 point) {
  vec2 st = (point - sourceOrigin) / sourceSize;
  if (clipToSource > 0.5 && (st.x < 0.0 || st.y < 0.0 || st.x > 1.0 || st.y > 1.0)) return vec4(0.0);
  return texture(textureImage, vec2(clamp(st.x, 0.0, 1.0), 1.0 - clamp(st.y, 0.0, 1.0)));
}

vec4 smoothScene(vec2 point) {
  if (frost < 0.001) return sampleScene(point);
  float r = frost * 7.0;
  return sampleScene(point) * 0.4 + (
    sampleScene(point + vec2(r, 0.0)) + sampleScene(point - vec2(r, 0.0)) +
    sampleScene(point + vec2(0.0, r)) + sampleScene(point - vec2(0.0, r))
  ) * 0.15;
}

vec2 landing(vec3 p, vec3 direction, vec2 fallback) {
  if (direction.z > -0.001) return fallback;
  float travel = (-thickness * 0.5 - 1.0 - p.z) / direction.z;
  return p.xy + size * 0.5 + direction.xy * max(travel, 0.0);
}

// Static studio lights, adapted from the original component's reflection model.
vec3 studio(vec3 direction) {
  vec2 a = vec2(atan(direction.x, direction.z), direction.y);
  float key = (1.0 - smoothstep(0.22, 0.42, abs(a.x + 0.62))) *
              (1.0 - smoothstep(0.12, 0.3, abs(a.y - 0.5)));
  float strip = (1.0 - smoothstep(0.05, 0.12, abs(a.x - 0.95))) *
                (1.0 - smoothstep(0.35, 0.8, abs(a.y - 0.05)));
  return vec3(key + strip * 0.45);
}

void main() {
  vec2 point = vec2(uv.x * size.x, (1.0 - uv.y) * size.y);
  vec2 p = point - size * 0.5;
  float d = outline(p);
  float mask = 1.0 - smoothstep(-aa, aa, d);
  if (mask < 0.001) { fragColor = vec4(0.0); return; }

  vec3 ray = vec3(0.0, 0.0, -1.0);
  vec3 entry = vec3(p, thickness * 0.5 + 1.0);
  bool hit = false;
  for (int i = 0; i < 48; i++) {
    float distance = field(entry);
    if (distance < 0.03) { hit = true; break; }
    entry += ray * max(distance, 0.025);
    if (entry.z < -thickness) break;
  }
  if (!hit) { fragColor = vec4(0.0); return; }

  vec3 n = surfaceNormal(entry);
  float ior = 1.0 + refractAmount * 0.5;
  vec3 inside = refract(ray, n, 1.0 / ior);
  vec3 exitPoint = entry;
  vec3 exitNormal = -n;
  vec3 outgoing = ray;
  bool escaped = false;

  // Only trace the interior when there is a real texture to refract.
  if (hasSource > 0.5) {
    exitPoint = entry + inside * 0.16;
    for (int bounce = 0; bounce < 2; bounce++) {
      bool reachedExit = false;
      for (int i = 0; i < 64; i++) {
        float distance = field(exitPoint);
        if (distance > -0.025) { reachedExit = true; break; }
        exitPoint += inside * max(-distance, 0.025);
      }
      if (!reachedExit) break;
      exitNormal = surfaceNormal(exitPoint);
      outgoing = refract(inside, -exitNormal, ior);
      if (dot(outgoing, outgoing) > 0.001) { escaped = true; break; }
      inside = reflect(inside, -exitNormal);
      exitPoint += inside * 0.16;
    }
  }

  float cosi = clamp(dot(-ray, n), 0.0, 1.0);
  float f0 = pow((ior - 1.0) / (ior + 1.0), 2.0);
  float fresnel = f0 + (1.0 - f0) * pow(1.0 - cosi, 5.0);
  vec3 mirror = reflect(ray, n);
  // Rotate only the fixed light direction, never the surface or its contents.
  float rotation = angle - 5.49778714;
  mirror.xy = mat2(cos(rotation), sin(rotation), -sin(rotation), cos(rotation)) * mirror.xy;
  vec3 light = studio(mirror);
  float edgeDepth = max(-d, 0.0);
  float border = borderWidth > 0.0 ? 1.0 - smoothstep(borderWidth, borderWidth + aa, edgeDepth) : 0.0;
  float highlightAlpha = clamp(shine * reflection * (fresnel * 0.32 + max(light.r, max(light.g, light.b)) * 0.5) +
                               border * borderOpacity, 0.0, 0.9);
  vec3 highlight = vec3(1.0);

  if (hasSource > 0.5) {
    vec2 samplePoint = escaped ? landing(exitPoint, outgoing, point) : point;
    vec4 color = smoothScene(samplePoint);
    if (escaped && dispersion > 0.001 && refractAmount > 0.001) {
      vec3 red = refract(inside, -exitNormal, max(1.0, ior - dispersion * 0.03));
      vec3 blue = refract(inside, -exitNormal, ior + dispersion * 0.03);
      color.r = smoothScene(landing(exitPoint, red, samplePoint)).r;
      color.b = smoothScene(landing(exitPoint, blue, samplePoint)).b;
    }
    color.rgb = mix(color.rgb, surfaceTint.rgb, surfaceTint.a);
    float alpha = color.a + highlightAlpha * (1.0 - color.a);
    vec3 premultiplied = color.rgb * color.a * (1.0 - highlightAlpha) + highlight * highlightAlpha;
    fragColor = vec4(premultiplied / max(alpha, 0.0001), alpha * mask);
  } else {
    // No texture: honest surface lighting, with live DOM children untouched.
    fragColor = vec4(highlight, highlightAlpha * mask);
  }
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
      refraction = 0.8,
      thickness = 12,
      reflection = 1,
      distortion = 0.22,
      bevel = 0.45,
      dispersion = 0.12,
      frost = 0.05,
      shine = 0.75,
      shineAngle = 315,
      tint = "#ffffff",
      tintOpacity = 0.045,
      borderWidth = 1,
      borderOpacity = 0.28,
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
        refs.current.onEffectError?.(
          new Error("WebGL 2 is unavailable; using the CSS material fallback."),
        );
        return;
      }
      let program: WebGLProgram | null = null;
      let buffer: WebGLBuffer | null = null;
      let texture: WebGLTexture | null = null;
      let source: Exclude<GlassBackdrop, string> | null = null;
      let disposed = false,
        lost = false,
        visible = true,
        frame = 0,
        needsUpload = false;
      let shaders: WebGLShader[] = [];
      let cancelLoad = () => {};
      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      const fail = (reason: unknown) => {
        if (disposed) return;
        setTextured(false);
        setStatus("fallback");
        refs.current.onEffectError?.(
          reason instanceof Error ? reason : new Error(String(reason)),
        );
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
        if (disposed || lost || !program || !visible || document.hidden) return;
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
            gl!.texImage2D(
              gl!.TEXTURE_2D,
              0,
              gl!.RGBA,
              gl!.RGBA,
              gl!.UNSIGNED_BYTE,
              source!,
            );
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
        if (!frame && !disposed && !lost && visible && !document.hidden)
          frame = requestAnimationFrame(draw);
      }
      function initialize() {
        try {
          lost = false;
          release();
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
        window.removeEventListener("resize", requestDraw);
        window.removeEventListener("scroll", requestDraw, true);
        document.removeEventListener("visibilitychange", onVisibility);
        target.removeEventListener("webglcontextlost", onLost);
        target.removeEventListener("webglcontextrestored", initialize);
        release();
      };
    }, [backdrop, backdropRef, enableLiquidEffect, solid]);

    const effectOn = enableLiquidEffect && !solid;
    const blur = effectOn && !textured ? limit(frost, 0, 1) * 14 : 0;
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
            background:
              !solid && (!effectOn || status !== "webgl")
                ? `linear-gradient(${shineAngle}deg,rgba(255,255,255,${limit(shine, 0, 1) * 0.08}),transparent 55%)`
                : undefined,
          }}
        />
        {children}
      </div>
    );
  },
);

export default GlassSurface;
