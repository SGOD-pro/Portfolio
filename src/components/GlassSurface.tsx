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

// Fixed rounded glass volume with liquid bevel refraction.
// Center is crystal clear and undistorted; refraction and chromatic dispersion occur along the bevel edge.
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

// Signed distance function for rounded rectangle
float outline(vec2 p) {
  vec2 q = abs(p) - (size * 0.5 - vec2(radius));
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

// 2D surface normal from the signed distance field gradient
vec2 surfaceNormal2D(vec2 p) {
  float h = 0.5;
  return normalize(vec2(
    outline(p + vec2(h, 0.0)) - outline(p - vec2(h, 0.0)),
    outline(p + vec2(0.0, h)) - outline(p - vec2(0.0, h))
  ));
}

vec4 sampleScene(vec2 point) {
  vec2 st = (point - sourceOrigin) / sourceSize;
  if (clipToSource > 0.5 && (st.x < 0.0 || st.y < 0.0 || st.x > 1.0 || st.y > 1.0)) return vec4(0.0);
  return texture(textureImage, vec2(clamp(st.x, 0.0, 1.0), 1.0 - clamp(st.y, 0.0, 1.0)));
}

void main() {
  vec2 point = vec2(uv.x * size.x, (1.0 - uv.y) * size.y);
  vec2 p = point - size * 0.5;
  float d = outline(p);
  float mask = 1.0 - smoothstep(-aa, aa, d);
  if (mask < 0.001) { fragColor = vec4(0.0); return; }

  // Distance inside from the perimeter (0 at boundary, increases inwards)
  float inside = max(0.0, -d);

  // Bevel zone: liquid refraction occurs strictly within the curved bevel edge
  float bevelZone = max(bevel * thickness * 2.5, 4.0);
  float t = 1.0 - clamp(inside / bevelZone, 0.0, 1.0); // 1.0 at outer edge, 0.0 in interior

  // Liquid curvature profile: smooth meniscus curve along the rounded bevel edge
  float profile = pow(t, 2.2);

  // Edge normal pointing outward from boundary
  vec2 n2D = surfaceNormal2D(p);

  // Liquid refraction displacement:
  // At inside >= bevelZone (central reading area): t == 0, bend == 0 (zero distortion, crystal clear!)
  float bendScale = refractAmount * thickness * 0.75;
  vec2 bend = n2D * (profile * bendScale);

  // Light angle and specular rim highlight along the liquid edge
  vec2 lightDir = vec2(cos(angle), sin(angle));
  float nDotL = clamp(dot(n2D, lightDir), 0.0, 1.0);
  float rim = pow(t, 2.0) * (0.3 + 0.7 * nDotL) * shine * reflection;

  // Thin, crisp border stroke
  float border = 0.0;
  if (borderWidth > 0.0) {
    border = (1.0 - smoothstep(0.0, borderWidth + aa, inside)) * borderOpacity;
  }
  float edgeHighlight = clamp(rim + border, 0.0, 0.95);

  if (hasSource > 0.5) {
    vec4 color;
    if (t > 0.001 && dispersion > 0.001 && refractAmount > 0.001) {
      // Chromatic dispersion strictly on the liquid bevel
      float disp = dispersion * 18.0 * profile;
      vec2 redPt = point - (bend + n2D * disp);
      vec2 greenPt = point - bend;
      vec2 bluePt = point - (bend - n2D * disp);

      color.r = sampleScene(redPt).r;
      color.g = sampleScene(greenPt).g;
      color.b = sampleScene(bluePt).b;
      color.a = sampleScene(greenPt).a;
    } else {
      // Crystal clear undistorted sampling in the central reading area!
      color = sampleScene(point - bend);
    }

    // Apply frost blur only if frost is configured and only on the edge
    if (frost > 0.001 && t > 0.0) {
      float r = frost * 4.0 * profile;
      vec4 blurColor = (
        sampleScene(point - bend + vec2(r, 0.0)) +
        sampleScene(point - bend - vec2(r, 0.0)) +
        sampleScene(point - bend + vec2(0.0, r)) +
        sampleScene(point - bend - vec2(0.0, r))
      ) * 0.25;
      color = mix(color, blurColor, frost * 0.5);
    }

    // Apply surface tint (subtle glass tint, e.g. 1% white or amber)
    color.rgb = mix(color.rgb, surfaceTint.rgb, surfaceTint.a);

    // Composite edge specular highlight over the refracted color
    vec3 premultiplied = color.rgb * color.a * (1.0 - edgeHighlight) + vec3(1.0) * edgeHighlight;
    float alpha = color.a + edgeHighlight * (1.0 - color.a);
    fragColor = vec4(premultiplied / max(alpha, 0.0001), alpha * mask);
  } else {
    // Honest fallback surface lighting when no texture is available
    fragColor = vec4(vec3(1.0), edgeHighlight * mask);
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
      refraction = 0.55,
      thickness = 10,
      reflection = 0.42,
      distortion = 0.02,
      bevel = 0.3,
      dispersion = 0.02,
      frost = 0.01,
      shine = 0.35,
      shineAngle = 315,
      tint = "#ffffff",
      tintOpacity = 0.01,
      borderWidth = 1,
      borderOpacity = 0.12,
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
            
          }}
        />
        {children}
      </div>
    );
  },
);

export default GlassSurface;
