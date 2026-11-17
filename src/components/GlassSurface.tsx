"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";

// The lens samples a reconstructed snapshot of the supplied navbar.
// WebGL cannot read pixels from unrelated HTML behind a canvas.
const VS = `attribute vec2 a; varying vec2 uv; void main(){uv=a*.5+.5;gl_Position=vec4(a,0.,1.);}`;
const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 uv; uniform sampler2D tex; uniform vec2 box, scene, origin;
uniform float refr,bevel,dispersion,frost,shine,radius,tintOpacity,fastLowFrost;
uniform vec3 tint;
float sd(vec2 p){vec2 q=abs(p)-(box*.5-vec2(radius));return length(max(q,0.))+min(max(q.x,q.y),0.)-radius;}
vec2 normal(vec2 p){vec2 q=abs(p)-(box*.5-vec2(radius));vec2 s=vec2(p.x<0.?-1.:1.,p.y<0.?-1.:1.);vec2 o=max(q,0.);if(o.x>0.&&o.y>0.)return normalize(o)*s;return q.x>q.y?vec2(s.x,0.):vec2(0.,s.y);}
vec3 at(vec2 p){return texture2D(tex,clamp(vec2(p.x/scene.x,1.-p.y/scene.y),vec2(0.),vec2(1.))).rgb;}
vec3 blurred(vec2 p){if(fastLowFrost > .5 && frost <= .05) return at(p);float sigma=frost*.8;vec3 sum=vec3(0.);float total=0.;for(int y=-2;y<=2;y++){for(int x=-2;x<=2;x++){vec2 q=vec2(float(x),float(y));float w=exp(-.5*dot(q,q));sum+=at(p+q*sigma)*w;total+=w;}}return sum/total;}
void main(){vec2 p=vec2(uv.x*box.x,(1.-uv.y)*box.y);vec2 v=p-box*.5;float d=sd(v);float mask=1.-smoothstep(-.75,.75,d);vec2 n=normal(v);float band=max(2.,bevel*min(box.x,box.y)*.4*(1.-.2*abs(n.y)));float edge=pow(1.-clamp(max(-d,0.)/band,0.,1.),2.2);float center=exp(-pow(v.x/(box.x*.42),2.));float inner=.45*center*smoothstep(0.,box.y*.5,abs(v.y));vec2 delta=edge*n-vec2(0.,sign(v.y)*inner);float bend=min(box.x,box.y)*.24*refr;float split=min(box.x,box.y)*.03*dispersion*refr;vec2 src=origin+p-delta*bend;vec3 c=vec3(blurred(src+delta*split).r,blurred(src).g,blurred(src-delta*split).b);c=mix(c,tint,tintOpacity);float rim=exp(-max(-d,0.)/1.2);float face=max(dot(n,normalize(vec2(-1.,-1.))),0.);c+=vec3(shine*(rim*(.07+.2*face)+edge*edge*.035*face));gl_FragColor=vec4(c,mask);}`;

const clamp = (v: number | string | undefined, min: number, max: number): number =>
  Math.max(min, Math.min(max, Number.isFinite(Number(v)) ? Number(v) : min));

function color3(value?: string): [number, number, number] {
  const m = /^#([0-9a-f]{6})$/i.exec(value || "");
  const h = m ? m[1] : "dfeeff";
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
}

function xml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SCENE_PADDING = 96;

function surroundingColor(menu: HTMLElement): string {
  let node: HTMLElement | null = menu.parentElement;
  while (node) {
    const color = getComputedStyle(node).backgroundColor;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return "#ffffff";
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    if (ctx.getImageData(0, 0, 1, 1).data[3] === 255) return color;
    node = node.parentElement;
  }
  return "#ffffff";
}

function stableChildRect(
  child: Element,
  link: Element,
  menuRect: DOMRect,
  sx: number,
  sy: number
): { x: number; y: number; width: number; height: number } {
  const r = child.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const transform = getComputedStyle(link).transform;
  let localScaleY = 1;
  if (transform && transform !== "none") {
    try {
      localScaleY = new DOMMatrixReadOnly(transform).d || 1;
    } catch {
      /* fallback for older browsers */
    }
  }
  const centerY = linkRect.top + linkRect.height / 2;
  return {
    x: (r.left - menuRect.left) / sx,
    y: (centerY - menuRect.top + (r.top - centerY) / localScaleY) / sy,
    width: r.width / sx,
    height: r.height / (sy * localScaleY),
  };
}

export interface CapturedSource {
  url: string;
  width: number;
  height: number;
  bg: string;
}

function capture(
  menu: HTMLElement | null,
  activeIndex = 0,
  activeColor = "#722F37"
): CapturedSource | null {
  if (!menu) return null;
  const rect = menu.getBoundingClientRect();
  const sx = rect.width / (menu.offsetWidth || 1) || 1;
  const sy = rect.height / (menu.offsetHeight || 1) || 1;
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;
  if (!width || !height) return null;
  const bg = getComputedStyle(menu).backgroundColor || "#E8DCC6";
  let elements = "";
  menu.querySelectorAll("a[data-index]").forEach((link) => {
    const icon = link.querySelector("svg");
    const label = link.querySelector("span");
    const idx = Number(link.getAttribute("data-index"));
    const isActive = idx === activeIndex;
    const inactiveColor = "rgba(255, 255, 255, 0.90)";
    const color = isActive ? activeColor : inactiveColor;
    if (icon) {
      const r = stableChildRect(icon, link, rect, sx, sy);
      const clone = icon.cloneNode(true) as SVGSVGElement;
      clone.removeAttribute("class");
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("width", String(r.width));
      clone.setAttribute("height", String(r.height));
      clone.setAttribute("x", String(r.x));
      clone.setAttribute("y", String(r.y));
      clone.style.color = color;
      elements += new XMLSerializer().serializeToString(clone);
    }
    if (label) {
      const r = stableChildRect(label, link, rect, sx, sy);
      const c = getComputedStyle(label);
      const fontFamily = c.fontFamily || "system-ui, sans-serif";
      const fontWeight = c.fontWeight || "600";
      const fontSize = parseFloat(c.fontSize) || 12;
      const ctx = document.createElement("canvas").getContext("2d");
      if (ctx) ctx.font = `${c.fontStyle || "normal"} ${fontWeight} ${fontSize}px ${fontFamily}`;
      const metrics = ctx?.measureText(label.textContent || "");
      const ascent = metrics?.fontBoundingBoxAscent ?? fontSize * 0.8;
      const descent = metrics?.fontBoundingBoxDescent ?? fontSize * 0.2;
      const baseline = r.y + (r.height - ascent - descent) / 2 + ascent;
      elements += `<text x="${r.x + r.width / 2}" y="${baseline}" text-anchor="middle" fill="${xml(color)}" font-family="${xml(fontFamily)}" font-size="${fontSize}" font-weight="${xml(fontWeight)}" font-style="${xml(c.fontStyle || "normal")}">${xml(label.textContent)}</text>`;
    }
  });
  const padding = SCENE_PADDING;
  const sceneWidth = width + padding * 2;
  const sceneHeight = height + padding * 2;
  const outside = surroundingColor(menu);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sceneWidth * 2}" height="${sceneHeight * 2}" viewBox="0 0 ${sceneWidth} ${sceneHeight}"><rect width="100%" height="100%" fill="${xml(outside)}"/><g transform="translate(${padding} ${padding})"><rect width="${width}" height="${height}" rx="${Math.min(width, height) / 2}" fill="${xml(bg)}"/>${elements}</g></svg>`;
  return {
    url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    width: sceneWidth,
    height: sceneHeight,
    bg,
  };
}

export interface MeasuredGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

function measure(menu: HTMLElement, lens: HTMLElement): MeasuredGeometry {
  const a = menu.getBoundingClientRect();
  const b = lens.getBoundingClientRect();
  const sx = a.width / (menu.offsetWidth || 1) || 1;
  const sy = a.height / (menu.offsetHeight || 1) || 1;
  return {
    x: SCENE_PADDING + (b.left - a.left) / sx,
    y: SCENE_PADDING + (b.top - a.top) / sy,
    width: b.width / sx,
    height: b.height / sy,
  };
}

function makeMap(w: number, h: number, r: number, bevel: number): string {
  if (typeof document === "undefined") return "";
  const c = document.createElement("canvas");
  c.width = Math.max(2, Math.round(w * 3));
  c.height = Math.max(2, Math.round(h * 3));
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const image = ctx.createImageData(c.width, c.height);
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const px = (x + 0.5) / 3 - w / 2;
      const py = (y + 0.5) / 3 - h / 2;
      const qx = Math.abs(px) - (w / 2 - r);
      const qy = Math.abs(py) - (h / 2 - r);
      const ox = Math.max(qx, 0);
      const oy = Math.max(qy, 0);
      const l = Math.hypot(ox, oy);
      const d = l + Math.min(Math.max(qx, qy), 0) - r;
      let nx = 0;
      let ny = 0;
      if (l) {
        nx = (ox / l) * Math.sign(px);
        ny = (oy / l) * Math.sign(py);
      } else if (qx > qy) {
        nx = Math.sign(px);
      } else {
        ny = Math.sign(py);
      }
      const isInside = d <= 0;
      const edge = isInside
        ? Math.pow(
            Math.max(0, 1 + d / Math.max(2, bevel * Math.min(w, h) * 0.4 * (1 - 0.2 * Math.abs(ny)))),
            2.2
          )
        : 0;
      const t = Math.min(1, Math.abs(py) / (h * 0.5));
      const smooth = t * t * (3 - 2 * t);
      const inner = isInside
        ? 0.25 * Math.exp(-Math.pow(px / (w * 0.42), 2)) * smooth * Math.sign(py)
        : 0;
      const i = (y * c.width + x) * 4;
      image.data[i] = 127.5 + 127.5 * 0.64 * edge * nx;
      image.data[i + 1] = 127.5 + 127.5 * 0.64 * (edge * ny - inner);
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return c.toDataURL();
}

export interface LiquidOptions {
  refr: number;
  bevel: number;
  dispersion: number;
  frost: number;
  shine: number;
  roundness: number;
  tint: string;
  tintOpacity: number;
}

interface GPUProps {
  source: CapturedSource | null;
  geometry: MeasuredGeometry;
  options: LiquidOptions;
  onReady: (ready: boolean) => void;
  isIOS: boolean;
}

function GPU({ source, geometry, options, onReady, isIOS }: GPUProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const current = useRef<{ source: CapturedSource | null; geometry: MeasuredGeometry; options: LiquidOptions }>({
    source,
    geometry,
    options,
  });
  const engine = useRef<{ draw: () => void; load: () => void } | null>(null);

  useEffect(() => {
    current.current = { source, geometry, options };
  }, [source, geometry, options]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });
    if (!gl) return;
    let alive = true;
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let texture: WebGLTexture | null = null;
    let shaders: WebGLShader[] = [];
    let imageLoaded = false;
    let loadId = 0;

    function release() {
      if (!gl) return;
      if (program) gl.deleteProgram(program);
      if (buffer) gl.deleteBuffer(buffer);
      if (texture) gl.deleteTexture(texture);
      shaders.forEach((s) => gl.deleteShader(s));
      program = null;
      buffer = null;
      texture = null;
      shaders = [];
    }

    function compile(type: number, src: string): WebGLShader {
      if (!gl) throw Error("WebGL unavailable");
      const sh = gl.createShader(type);
      if (!sh) throw Error("Could not create shader");
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(sh);
        gl.deleteShader(sh);
        throw Error(message || "Shader compilation failed");
      }
      shaders.push(sh);
      return sh;
    }

    function draw() {
      if (!gl || !program || !imageLoaded || gl.isContextLost()) return;
      const { source: s, geometry: g, options: o } = current.current;
      if (!s || !g.width || !g.height) return;
      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
      const w = Math.max(1, Math.round(g.width * dpr));
      const h = Math.max(1, Math.round(g.height * dpr));
      if (canvas && canvas.width !== w) canvas.width = w;
      if (canvas && canvas.height !== h) canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.useProgram(program);
      const f = (name: string, v: number) => {
        const loc = gl.getUniformLocation(program!, name);
        if (loc) gl.uniform1f(loc, v);
      };
      const boxLoc = gl.getUniformLocation(program, "box");
      if (boxLoc) gl.uniform2f(boxLoc, g.width, g.height);
      const sceneLoc = gl.getUniformLocation(program, "scene");
      if (sceneLoc) gl.uniform2f(sceneLoc, s.width, s.height);
      const origLoc = gl.getUniformLocation(program, "origin");
      if (origLoc) gl.uniform2f(origLoc, g.x, g.y);

      f("refr", o.refr);
      f("bevel", o.bevel);
      f("dispersion", o.dispersion);
      f("frost", o.frost);
      f("shine", o.shine);
      f("tintOpacity", o.tintOpacity);
      f("fastLowFrost", isIOS ? 1 : 0);
      f("radius", Math.max(2.0, Math.min(g.width, g.height) * 0.5 * o.roundness));

      const tintLoc = gl.getUniformLocation(program, "tint");
      if (tintLoc) gl.uniform3f(tintLoc, ...color3(o.tint));
      const texLoc = gl.getUniformLocation(program, "tex");
      if (texLoc) gl.uniform1i(texLoc, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function load() {
      if (!program || !current.current.source) return;
      const n = ++loadId;
      const img = new Image();
      img.onload = () => {
        if (!gl || !alive || n !== loadId || gl.isContextLost()) return;
        try {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          imageLoaded = true;
          draw();
          onReady(true);
        } catch (e) {
          console.error("Liquid effect texture:", e);
          onReady(false);
        }
      };
      img.onerror = () => {
        if (alive && n === loadId) onReady(false);
      };
      img.src = current.current.source.url;
    }

    function init() {
      onReady(false);
      try {
        release();
        imageLoaded = false;
        program = gl!.createProgram();
        if (!program) throw Error("Could not create WebGL program");
        gl!.attachShader(program, compile(gl!.VERTEX_SHADER, VS));
        gl!.attachShader(program, compile(gl!.FRAGMENT_SHADER, FS));
        gl!.linkProgram(program);
        if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) {
          throw Error(gl!.getProgramInfoLog(program) || "WebGL program link failed");
        }
        gl!.useProgram(program);
        buffer = gl!.createBuffer();
        gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer);
        gl!.bufferData(
          gl!.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          gl!.STATIC_DRAW
        );
        const a = gl!.getAttribLocation(program, "a");
        gl!.enableVertexAttribArray(a);
        gl!.vertexAttribPointer(a, 2, gl!.FLOAT, false, 0, 0);
        texture = gl!.createTexture();
        gl!.bindTexture(gl!.TEXTURE_2D, texture);
        for (const [p, v] of [
          [gl!.TEXTURE_MIN_FILTER, gl!.LINEAR],
          [gl!.TEXTURE_MAG_FILTER, gl!.LINEAR],
          [gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE],
          [gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE],
        ]) {
          gl!.texParameteri(gl!.TEXTURE_2D, p, v);
        }
        load();
      } catch (e) {
        console.error("Liquid effect:", e);
        release();
        onReady(false);
      }
    }

    const lost = (e: Event) => {
      e.preventDefault();
      imageLoaded = false;
      program = null;
      buffer = null;
      texture = null;
      shaders = [];
      onReady(false);
    };

    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", init);
    engine.current = { draw, load };
    init();

    return () => {
      alive = false;
      ++loadId;
      engine.current = null;
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", init);
      release();
    };
  }, [onReady, isIOS]);

  useEffect(() => {
    engine.current?.load();
  }, [source]);

  useEffect(() => {
    engine.current?.draw();
  }, [geometry, options]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

interface SVGProps {
  source: CapturedSource | null;
  geometry: MeasuredGeometry;
  options: LiquidOptions;
}

function SVG({ source, geometry: g, options: o }: SVGProps) {
  const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = `liquid-${generatedId}`;
  const r = Math.max(2.0, Math.min(g.width, g.height) * 0.5 * o.roundness);
  const map = useMemo(
    () => (g.width && g.height ? makeMap(g.width, g.height, r, o.bevel) : ""),
    [g.width, g.height, r, o.bevel]
  );
  if (!source || !map) return null;
  const bend = Math.min(g.width, g.height) * 0.24 * o.refr;
  const split = Math.min(g.width, g.height) * 0.015 * o.dispersion * o.refr;
  const pad = Math.ceil(bend + split + 24);

  return (
    <svg
      viewBox={`0 0 ${g.width} ${g.height}`}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect width={g.width} height={g.height} rx={r} />
        </clipPath>
        <filter
          id={`${id}-filter`}
          filterUnits="userSpaceOnUse"
          primitiveUnits="userSpaceOnUse"
          x={-pad}
          y={-pad}
          width={g.width + pad * 2}
          height={g.height + pad * 2}
          colorInterpolationFilters="sRGB"
        >
          <feImage href={map} x="0" y="0" width={g.width} height={g.height} result="map" />
          <feGaussianBlur
            in="map"
            stdDeviation="0.35"
            edgeMode="duplicate"
            x="0"
            y="0"
            width={g.width}
            height={g.height}
            result="smoothMap"
          />
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={o.frost * 0.8}
            x={-pad}
            y={-pad}
            width={g.width + pad * 2}
            height={g.height + pad * 2}
            result="soft"
          />
          {[-1, 0, 1].map((channel, i) => (
            <React.Fragment key={i}>
              <feDisplacementMap
                in="soft"
                in2="smoothMap"
                scale={(-2 * (bend + channel * split)) / 0.64}
                xChannelSelector="R"
                yChannelSelector="G"
                x="0"
                y="0"
                width={g.width}
                height={g.height}
                result={`s${i}`}
              />
              <feColorMatrix
                in={`s${i}`}
                type="matrix"
                values={
                  [
                    "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
                    "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
                    "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
                  ][i]
                }
                x="0"
                y="0"
                width={g.width}
                height={g.height}
                result={`c${i}`}
              />
            </React.Fragment>
          ))}
          <feComposite
            in="c0"
            in2="c1"
            operator="arithmetic"
            k2="1"
            k3="1"
            x="0"
            y="0"
            width={g.width}
            height={g.height}
            result="rg"
          />
          <feComposite
            in="rg"
            in2="c2"
            operator="arithmetic"
            k2="1"
            k3="1"
            x="0"
            y="0"
            width={g.width}
            height={g.height}
            result="rgbSplit"
          />
          <feComposite
            in="rgbSplit"
            in2="s1"
            operator="arithmetic"
            k2="0.30"
            k3="0.70"
            x="0"
            y="0"
            width={g.width}
            height={g.height}
          />
        </filter>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="white" stopOpacity={o.shine * 0.2} />
          <stop offset=".3" stopColor="white" stopOpacity={o.shine * 0.03} />
          <stop offset="1" stopColor="white" stopOpacity={o.shine * 0.07} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <image
          href={source.url}
          x={-g.x}
          y={-g.y}
          width={source.width}
          height={source.height}
          filter={`url(#${id}-filter)`}
        />
        <rect width={g.width} height={g.height} fill={o.tint} fillOpacity={o.tintOpacity} />
        <rect width={g.width} height={g.height} fill={`url(#${id}-light)`} />
      </g>
      <rect
        x=".5"
        y=".5"
        width={Math.max(0, g.width - 1)}
        height={Math.max(0, g.height - 1)}
        rx={r}
        fill="none"
        stroke="white"
        strokeOpacity={o.shine * 0.38}
      />
    </svg>
  );
}

export interface LiquidGlassEffectProps {
  menuRef?: React.RefObject<HTMLElement | null>;
  lensRef?: React.RefObject<HTMLElement | null>;
  activeIndex?: number;
  activeColor?: string;
  active?: boolean;
  renderer?: "webgl" | "svg";
  refraction?: number;
  bevel?: number;
  dispersion?: number;
  frost?: number;
  shine?: number;
  roundness?: number;
  tint?: string;
  tintOpacity?: number;
}

/** Render the liquid glass effect into a moving, positioned host element. */
export function LiquidGlassEffect({
  menuRef,
  lensRef,
  activeIndex = 0,
  activeColor = "#b46004",
  active = true,
  renderer = "webgl",
  refraction = 1,
  bevel = 0.6,
  dispersion = 0.25,
  frost = 0.15,
  shine = 0.6,
  roundness = 1,
  tint = "#dfeeff",
  tintOpacity = 0.08,
}: LiquidGlassEffectProps) {
  const [isIOS] = useState(
    () =>
      typeof navigator !== "undefined" &&
      (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))
  );
  const [source, setSource] = useState<CapturedSource | null>(null);
  const [geometry, setGeometry] = useState<MeasuredGeometry>({ x: 0, y: 0, width: 0, height: 0 });
  const [ready, setReady] = useState(false);

  const options = useMemo(
    () => ({
      refr: clamp(refraction, 0, 1.5),
      bevel: clamp(bevel, 0, 1),
      dispersion: clamp(dispersion, 0, 1),
      frost: clamp(frost, 0, 1),
      shine: clamp(shine, 0, 1),
      roundness: clamp(roundness, 0, 1),
      tint: /^#[0-9a-f]{6}$/i.test(tint) ? tint : "#dfeeff",
      tintOpacity: clamp(tintOpacity, 0, 0.5),
    }),
    [refraction, bevel, dispersion, frost, shine, roundness, tint, tintOpacity]
  );

  useEffect(() => {
    const menu = menuRef?.current;
    if (!menu) return;
    let alive = true;
    const update = () => {
      if (!alive) return;
      const next = capture(menu, activeIndex, activeColor);
      if (next) setSource((prev) => (prev?.url === next.url ? prev : next));
    };
    update();
    const resize = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    resize?.observe(menu);
    window.addEventListener("resize", update);
    return () => {
      alive = false;
      resize?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [menuRef, activeIndex, activeColor]);

  useEffect(() => {
    if (isIOS && !active) return;
    let raf = 0;
    let last = "";
    const tick = () => {
      const menu = menuRef?.current;
      const lens = lensRef?.current;
      if (menu && lens) {
        const g = measure(menu, lens);
        const key = [g.x, g.y, g.width, g.height].map((v) => Math.round(v * 10)).join(":");
        if (key !== last) {
          last = key;
          setGeometry(g);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [menuRef, lensRef, isIOS, active]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        overflow: "hidden",
        pointerEvents: "none",
        background: renderer === "webgl" && !ready ? "rgba(255,255,255,.05)" : "transparent",
      }}
    >
      {renderer === "svg" ? (
        <SVG source={source} geometry={geometry} options={options} />
      ) : (
        <GPU source={source} geometry={geometry} options={options} onReady={setReady} isIOS={isIOS} />
      )}
    </div>
  );
}

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  style?: React.CSSProperties;
  enableLiquidEffect?: boolean;
  menuRef?: React.RefObject<HTMLElement | null>;
  lensRef?: React.RefObject<HTMLElement | null>;
  activeIndex?: number;
  activeColor?: string;
  renderer?: "webgl" | "svg";
  refraction?: number;
  bevel?: number;
  dispersion?: number;
  frost?: number;
  shine?: number;
  roundness?: number;
  tint?: string;
  tintOpacity?: number;
}
const DEFAULT_GLASS = {
  renderer: 'webgl' as const,
  refraction: .77,
  bevel: 0.42,
  dispersion: 0.80,
  frost: 0.05,
  shine: 1.00,
  roundness: 1.0,
  tint: '#dfeeff3b',
  tintOpacity: 0.08,
};
/**
 * GlassSurface container with liquid-glass aesthetic, calm readable backdrop sheen,
 * and optional WebGL/SVG liquid lens refraction.
 */
export default function GlassSurface({
  children,
  width = "100%",
  height = "100%",
  borderRadius = 16,
  className = "",
  style = {},
  enableLiquidEffect = false,
  menuRef,
  lensRef,
  activeIndex,
  activeColor,
  renderer=DEFAULT_GLASS.renderer,
  refraction=DEFAULT_GLASS.refraction,
  bevel=DEFAULT_GLASS.bevel,
  dispersion=DEFAULT_GLASS.dispersion,
  frost=DEFAULT_GLASS.frost,
  shine=DEFAULT_GLASS.shine,
  roundness,
  tint,
  tintOpacity,
}: GlassSurfaceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col overflow-hidden rounded-2xl border-white/15 bg-black/35 backdrop-blur-[2px] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.22),inset_0_0_24px_0_rgba(255,255,255,0.02),0_16px_40px_rgba(0,0,0,0.65)] transition-all ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: `${borderRadius}px`,
        ...style,
      }}
    >
      {/* Specular liquid gloss reflection gradient */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none  to-transparent z-0"
        aria-hidden="true"
      />
      {enableLiquidEffect && (
        <LiquidGlassEffect
          menuRef={menuRef || containerRef}
          lensRef={lensRef || containerRef}
          activeIndex={activeIndex}
          activeColor={activeColor}
          renderer={renderer}
          refraction={refraction}
          bevel={bevel}
          dispersion={dispersion}
          frost={frost}
          shine={shine}
          roundness={roundness}
          tint={tint}
          tintOpacity={tintOpacity}
        />
      )}
      <div className="w-full h-full flex flex-col relative z-10">{children}</div>
    </div>
  );
}
