type Rec = Record<string, unknown>;
type Item = {
  k: string;
  v: number | number[] | boolean;
  min?: number;
  max?: number;
  st?: number;
  t?: "f" | "i" | "c" | "b" | "s";
  tgt?: "r" | "u";
  opts?: number[];
  on?: (v: number) => void;
};

const MAX_DROPS = 12;
const uName = (k: string) => "u" + k[0].toUpperCase() + k.slice(1);

const GROUPS: { name: string; items: Item[] }[] = [
  {
    name: "Simulation",
    items: [
      { k: "resolution", v: 256, t: "s", opts: [128, 256, 512], on: (v) => rebuildSim(+v) },
      { k: "propagation", v: 0.245, min: 0, max: 0.249, st: 0.001, tgt: "u" },
      { k: "damping", v: 0.996, min: 0.9, max: 1, st: 0.0005, tgt: "u" },
      { k: "edgeWidth", v: 0.045, min: 0, max: 0.2, st: 0.001, tgt: "u" },
      { k: "edgeDamp", v: 0.9, min: 0.5, max: 1, st: 0.005, tgt: "u" },
      { k: "clampH", v: 1.6, min: 0.2, max: 4, st: 0.05, tgt: "u" },
      { k: "simRate", v: 60, min: 20, max: 120, st: 1 },
      { k: "maxSub", v: 4, min: 1, max: 8, st: 1 },
      { k: "paused", v: false, t: "b" },
    ],
  },
  {
    name: "Interaction",
    items: [
      { k: "brushRadius", v: 0.032, min: 0.005, max: 0.15, st: 0.001 },
      { k: "brushBase", v: 0.012, min: 0, max: 0.1, st: 0.001 },
      { k: "brushGain", v: 0.9, min: 0, max: 3, st: 0.01 },
      { k: "brushMax", v: 0.09, min: 0.01, max: 0.4, st: 0.005 },
      { k: "clickStrength", v: 0.22, min: 0, max: 1, st: 0.01 },
      { k: "clickRadius", v: 0.05, min: 0.005, max: 0.2, st: 0.001 },
    ],
  },
  {
    name: "Ambient",
    items: [
      { k: "ambient", v: true, t: "b" },
      { k: "ambientCount", v: 4, min: 0, max: 10, st: 1, on: (v) => initSources(+v) },
      { k: "ambientStrength", v: 0.018, min: 0, max: 0.1, st: 0.001 },
      { k: "ambientRate", v: 1, min: 0.2, max: 3, st: 0.05 },
      { k: "idle", v: 2.2, min: 0, max: 10, st: 0.1 },
      { k: "drivenMult", v: 0.45, min: 0, max: 1, st: 0.01 },
    ],
  },
  {
    name: "Attract",
    items: [
      { k: "ghost", v: true, t: "b" },
      { k: "ghostReturn", v: 10, min: 0, max: 30, st: 0.5 },
      { k: "ghostFade", v: 1.5, min: 0.1, max: 5, st: 0.1 },
      { k: "ghostSpeed", v: 4, min: 0.1, max: 5, st: 0.05 },
      { k: "ghostGain", v: 2, min: 0, max: 5, st: 0.05 },
    ],
  },
  {
    name: "Caustics",
    items: [
      { k: "causticA", v: 9, min: 0, max: 30, st: 0.1, tgt: "r" },
      { k: "detFloor", v: 0.06, min: 0.005, max: 0.5, st: 0.005, tgt: "r" },
      { k: "clamp1", v: 6, min: 1, max: 20, st: 0.1, tgt: "r" },
      { k: "contrast", v: 1.22, min: 0.5, max: 3, st: 0.01, tgt: "r" },
      { k: "clamp2", v: 8, min: 1, max: 20, st: 0.1, tgt: "r" },
      { k: "floorBase", v: 0.34, min: 0, max: 1.5, st: 0.01, tgt: "r" },
      { k: "causticGain", v: 0.3, min: 0, max: 1.5, st: 0.01, tgt: "r" },
      { k: "veinThresh", v: 1, min: 0, max: 4, st: 0.01, tgt: "r" },
      { k: "veinGain", v: 0.1, min: 0, max: 1, st: 0.01, tgt: "r" },
      { k: "veinColor", v: [140, 204, 217], t: "c", tgt: "r" },
    ],
  },
  {
    name: "Water",
    items: [
      { k: "baseDepth", v: 1.05, min: 0, max: 3, st: 0.01, tgt: "r" },
      { k: "depthScale", v: 1.4, min: 0, max: 5, st: 0.01, tgt: "r" },
      { k: "depthNoise", v: 2, min: 0, max: 8, st: 0.05, tgt: "r" },
      { k: "depthNoiseAmp", v: 0.25, min: 0, max: 1, st: 0.01, tgt: "r" },
      { k: "absorb", v: [107, 33, 20], t: "c", tgt: "r" },
      { k: "absorbScale", v: 1.7, min: 0, max: 5, st: 0.01, tgt: "r" },
      { k: "deepColor", v: [5, 26, 37], t: "c", tgt: "r" },
      { k: "deepGain", v: 0.3, min: 0, max: 2, st: 0.01, tgt: "r" },
    ],
  },
  {
    name: "Refraction",
    items: [
      { k: "parallax", v: 2.4, min: 0, max: 8, st: 0.05, tgt: "r" },
      { k: "nScale", v: 8.5, min: 0, max: 30, st: 0.1, tgt: "r" },
    ],
  },
  {
    name: "Sun",
    items: [
      { k: "sun1x", v: 0.3, min: -1, max: 1, st: 0.01, tgt: "r" },
      { k: "sun1y", v: 0.45, min: -1, max: 1, st: 0.01, tgt: "r" },
      { k: "sun1z", v: 0.82, min: 0, max: 1.5, st: 0.01, tgt: "r" },
      { k: "sun2x", v: -0.5, min: -1, max: 1, st: 0.01, tgt: "r" },
      { k: "sun2y", v: 0.15, min: -1, max: 1, st: 0.01, tgt: "r" },
      { k: "sun2z", v: 0.78, min: 0, max: 1.5, st: 0.01, tgt: "r" },
      { k: "spec1", v: 150, min: 1, max: 400, st: 1, tgt: "r" },
      { k: "spec2", v: 70, min: 1, max: 300, st: 1, tgt: "r" },
      { k: "spec2Gain", v: 0.35, min: 0, max: 2, st: 0.01, tgt: "r" },
      { k: "glintGain", v: 0.85, min: 0, max: 3, st: 0.01, tgt: "r" },
      { k: "glintColor", v: [255, 247, 224], t: "c", tgt: "r" },
    ],
  },
  {
    name: "Fresnel",
    items: [
      { k: "fresnelPow", v: 4, min: 0.5, max: 10, st: 0.1, tgt: "r" },
      { k: "fresnelGain", v: 0.22, min: 0, max: 1, st: 0.01, tgt: "r" },
      { k: "skyColor", v: [41, 77, 102], t: "c", tgt: "r" },
    ],
  },
  {
    name: "Sand",
    items: [
      { k: "sandHi", v: [219, 179, 120], t: "c", tgt: "r" },
      { k: "sandLo", v: [158, 117, 77], t: "c", tgt: "r" },
      { k: "rippleScale", v: 6.5, min: 0, max: 20, st: 0.1, tgt: "r" },
      { k: "warpScale", v: 3, min: 0, max: 10, st: 0.1, tgt: "r" },
      { k: "warp", v: 0.6, min: 0, max: 3, st: 0.01, tgt: "r" },
      { k: "bandFreq", v: 9, min: 0, max: 30, st: 0.1, tgt: "r" },
      { k: "bandSkew", v: 4, min: 0, max: 15, st: 0.1, tgt: "r" },
      { k: "bandGain", v: 0.06, min: 0, max: 0.5, st: 0.005, tgt: "r" },
      { k: "grainScale", v: 240, min: 10, max: 600, st: 1, tgt: "r" },
      { k: "grainAmp", v: 0.045, min: 0, max: 0.3, st: 0.005, tgt: "r" },
    ],
  },
  {
    name: "Noise",
    items: [
      { k: "octaves", v: 4, min: 1, max: 8, st: 1, t: "i", tgt: "r" },
      { k: "lacunarity", v: 2.03, min: 1.2, max: 3.5, st: 0.01, tgt: "r" },
      { k: "gain", v: 0.5, min: 0.2, max: 0.9, st: 0.01, tgt: "r" },
    ],
  },
  {
    name: "Post",
    items: [
      { k: "exposure", v: 1.55, min: 0.2, max: 4, st: 0.01, tgt: "r" },
      { k: "grain", v: 0.022, min: 0, max: 0.15, st: 0.001, tgt: "r" },
      { k: "gamma", v: 0.4545, min: 0.2, max: 1.2, st: 0.005, tgt: "r" },
      { k: "vigOuter", v: 1.28, min: 0.5, max: 2.5, st: 0.01, tgt: "r" },
      { k: "vigInner", v: 0.32, min: 0, max: 1.5, st: 0.01, tgt: "r" },
      { k: "vigDark", v: 0.6, min: 0, max: 1.5, st: 0.01, tgt: "r" },
      { k: "vigBright", v: 1.05, min: 0.5, max: 2, st: 0.01, tgt: "r" },
    ],
  },
];

export function initFooterCaustics(root: HTMLElement) {
  if (root.dataset.causticsReady) return;
  root.dataset.causticsReady = "1";

  const canvas = root.querySelector("canvas");
  const failEl = root.querySelector<HTMLElement>("[data-caustics-fail]");
  const fail = (m?: string) => {
    if (failEl) {
      failEl.hidden = false;
      if (m) failEl.textContent = m;
    }
  };

  if (!canvas) return;

  const items = GROUPS.flatMap((g) => g.items);
  const rItems = items.filter((i) => i.tgt === "r");
  const uItems = items.filter((i) => i.tgt === "u");
  const DEF: Rec = {};
  const P: Rec = {};
  items.forEach((i) => {
    DEF[i.k] = Array.isArray(i.v) ? i.v.slice() : i.v;
    P[i.k] = Array.isArray(i.v) ? (i.v as number[]).slice() : i.v;
  });

  const gl = canvas.getContext("webgl2", {
    antialias: false,
    alpha: false,
    depth: false,
    powerPreference: "high-performance",
  });
  if (!gl) {
    fail("This piece needs WebGL2.");
    return;
  }
  if (
    !gl.getExtension("EXT_color_buffer_float") &&
    !gl.getExtension("EXT_color_buffer_half_float")
  ) {
    fail("This piece needs float render targets.");
    return;
  }
  gl.getExtension("OES_texture_half_float_linear");

  const glslType = (t?: string) => (t === "c" ? "vec3" : t === "i" ? "int" : "float");
  const decl = (its: Item[]) =>
    its.map((i) => `uniform ${glslType(i.t)} ${uName(i.k)};`).join("\n");

  const VERT = `#version 300 es
out vec2 vUv;
void main(){ vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2)); vUv=p; gl_Position=vec4(p*2.0-1.0,0.0,1.0); }`;

  const UPDATE = `#version 300 es
precision highp float;
uniform sampler2D uState; uniform vec2 uTexel; uniform float uAspect;
uniform int uDropCount; uniform vec4 uDrops[${MAX_DROPS}];
${decl(uItems)}
in vec2 vUv; out vec4 o;
void main(){
  vec2 uv=vUv; float c=texture(uState,uv).r, p=texture(uState,uv).g;
  float l=texture(uState,uv-vec2(uTexel.x,0.0)).r, r=texture(uState,uv+vec2(uTexel.x,0.0)).r;
  float u=texture(uState,uv+vec2(0.0,uTexel.y)).r, d=texture(uState,uv-vec2(0.0,uTexel.y)).r;
  float nv=(2.0*c-p)+(l+r+u+d-4.0*c)*uPropagation; nv*=uDamping;
  for(int i=0;i<${MAX_DROPS};i++){ if(i>=uDropCount)break;
    vec2 dp=uv-uDrops[i].xy; dp.x*=uAspect; float rr=uDrops[i].w;
    nv+=uDrops[i].z*exp(-dot(dp,dp)/(rr*rr)); }
  vec2 e=min(uv,1.0-uv);
  nv*=mix(uEdgeDamp,1.0,smoothstep(0.0,uEdgeWidth,min(e.x,e.y)));
  o=vec4(clamp(nv,-uClampH,uClampH),c,0.0,1.0);
}`;

  const RENDER = `#version 300 es
precision highp float;
uniform sampler2D uState; uniform vec2 uTexel; uniform vec2 uResolution; uniform float uTime; uniform float uAspect;
${decl(rItems)}
in vec2 vUv; out vec4 frag;
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
  float a=hash(i),b=hash(i+vec2(1.0,0.0)),c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }
float fbm(vec2 p){ float s=0.0,a=0.5; for(int i=0;i<8;i++){ if(i>=uOctaves)break; s+=a*vnoise(p); p*=uLacunarity; a*=uGain; } return s; }
vec3 sand(vec2 uv){ vec2 p=uv*vec2(uAspect,1.0);
  float rip=fbm(p*uRippleScale+fbm(p*uWarpScale)*uWarp);
  float band=0.5+0.5*sin(rip*uBandFreq+p.x*uBandSkew);
  vec3 b=mix(uSandHi,uSandLo,rip); b=mix(b,b*(1.0+uBandGain),band);
  return b+(vnoise(p*uGrainScale)-0.5)*uGrainAmp; }
void main(){
  vec2 uv=vUv,t=uTexel;
  float hc=texture(uState,uv).r;
  float hl=texture(uState,uv-vec2(t.x,0.0)).r, hr=texture(uState,uv+vec2(t.x,0.0)).r;
  float hu=texture(uState,uv+vec2(0.0,t.y)).r, hd=texture(uState,uv-vec2(0.0,t.y)).r;
  float hpp=texture(uState,uv+t).r, hmm=texture(uState,uv-t).r;
  float hpm=texture(uState,uv+vec2(t.x,-t.y)).r, hmp=texture(uState,uv+vec2(-t.x,t.y)).r;
  float hx=(hr-hl)*0.5, hy=(hu-hd)*0.5;
  float hxx=hr-2.0*hc+hl, hyy=hu-2.0*hc+hd, hxy=(hpp-hpm-hmp+hmm)*0.25;
  float jxx=1.0-uCausticA*hxx, jyy=1.0-uCausticA*hyy, jxy=-uCausticA*hxy;
  float det=jxx*jyy-jxy*jxy;
  float ca=clamp(1.0/max(abs(det),uDetFloor),0.0,uClamp1);
  ca=clamp(pow(ca,uContrast),0.0,uClamp2);
  vec2 land=uv+vec2(hx,hy)*uParallax;
  vec3 col=sand(land)*(uFloorBase+ca*uCausticGain);
  col+=uVeinColor*max(ca-uVeinThresh,0.0)*uVeinGain;
  float depth=clamp(uBaseDepth-hc*uDepthScale+fbm(land*uDepthNoise)*uDepthNoiseAmp,0.2,3.0);
  col*=exp(-uAbsorb*depth*uAbsorbScale);
  col+=uDeepColor*depth*uDeepGain;
  vec3 N=normalize(vec3(-hx*uNScale,-hy*uNScale,1.0)), V=vec3(0.0,0.0,1.0);
  vec3 s1=normalize(vec3(uSun1x,uSun1y,uSun1z)+vec3(0.0,0.0,1e-4));
  vec3 s2=normalize(vec3(uSun2x,uSun2y,uSun2z)+vec3(0.0,0.0,1e-4));
  float sp=pow(max(dot(N,normalize(s1+V)),0.0),uSpec1)+pow(max(dot(N,normalize(s2+V)),0.0),uSpec2)*uSpec2Gain;
  col+=sp*uGlintColor*uGlintGain;
  col=mix(col,uSkyColor,pow(1.0-N.z,uFresnelPow)*uFresnelGain);
  col*=mix(uVigDark,uVigBright,smoothstep(uVigOuter,uVigInner,length((uv-0.5)*vec2(uAspect,1.0))));
  col=vec3(1.0)-exp(-col*uExposure);
  col+=(hash(uv*uResolution+fract(uTime))-0.5)*uGrain;
  frag=vec4(pow(max(col,vec3(0.0)),vec3(uGamma)),1.0);
}`;

  function sh(type: number, src: string) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || "shader");
    }
    return s;
  }
  function prog(vs: string, fs: string) {
    const p = gl.createProgram()!;
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p) || "link");
    }
    return p;
  }

  let updateP: WebGLProgram;
  let renderP: WebGLProgram;
  try {
    updateP = prog(VERT, UPDATE);
    renderP = prog(VERT, RENDER);
  } catch (e) {
    fail(e instanceof Error ? e.message : "Shader failed.");
    return;
  }

  function locs(p: WebGLProgram, its: Item[], fixed: string[]) {
    const o: Rec = {};
    its.forEach((i) => {
      o[i.k] = gl.getUniformLocation(p, uName(i.k));
    });
    fixed.forEach((n) => {
      o[n] = gl.getUniformLocation(p, n);
    });
    return o;
  }
  const uL = locs(updateP, uItems, ["uState", "uTexel", "uAspect", "uDropCount", "uDrops"]);
  const rL = locs(renderP, rItems, ["uState", "uTexel", "uResolution", "uTime", "uAspect"]);

  function setUniforms(loc: Rec, its: Item[]) {
    for (const i of its) {
      const l = loc[i.k] as WebGLUniformLocation | null;
      const v = P[i.k];
      if (i.t === "c" && Array.isArray(v)) {
        gl.uniform3f(l, v[0] / 255, v[1] / 255, v[2] / 255);
      } else if (i.t === "i") gl.uniform1i(l, (v as number) | 0);
      else gl.uniform1f(l, v as number);
    }
  }

  type Tgt = { tex: WebGLTexture; fbo: WebGLFramebuffer };
  let sim = P.resolution as number;
  function makeTarget(s: number): Tgt {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, s, s, 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { tex, fbo };
  }
  let targets = [makeTarget(sim), makeTarget(sim)];
  let read = 0;
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    fail("Float render targets unavailable.");
    return;
  }
  function clearTargets() {
    for (const t of targets) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
      gl.viewport(0, 0, sim, sim);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  clearTargets();
  function rebuildSim(n: number) {
    if (n === sim) return;
    for (const t of targets) {
      gl.deleteFramebuffer(t.fbo);
      gl.deleteTexture(t.tex);
    }
    sim = n;
    targets = [makeTarget(sim), makeTarget(sim)];
    read = 0;
    clearTargets();
  }
  const vao = gl.createVertexArray();

  let vw = 1;
  let vh = 1;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = root.getBoundingClientRect();
    vw = Math.max(rect.width, 1);
    vh = Math.max(rect.height, 1);
    canvas.width = Math.floor(vw * dpr);
    canvas.height = Math.floor(vh * dpr);
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
  }
  resize();
  const ro = new ResizeObserver(() => resize());
  ro.observe(root);

  const dropData = new Float32Array(MAX_DROPS * 4);
  let pending: number[][] = [];
  const queueDrop = (x: number, y: number, s: number, r: number) => {
    if (pending.length < MAX_DROPS) pending.push([x, y, s, r]);
  };
  function uploadDrops() {
    const n = Math.min(pending.length, MAX_DROPS);
    for (let k = 0; k < n; k++) dropData.set(pending[k], k * 4);
    pending = [];
    return n;
  }

  type Src = {
    px: number;
    py: number;
    ax: number;
    ay: number;
    sx: number;
    sy: number;
    phx: number;
    phy: number;
    next: number;
    period: number;
  };
  let sources: Src[] = [];
  function initSources(n: number) {
    sources = [];
    for (let k = 0; k < n; k++) {
      sources.push({
        px: 0.2 + 0.6 * Math.random(),
        py: 0.2 + 0.6 * Math.random(),
        ax: 0.1 + 0.1 * Math.random(),
        ay: 0.1 + 0.1 * Math.random(),
        sx: 0.05 + 0.08 * Math.random(),
        sy: 0.05 + 0.08 * Math.random(),
        phx: Math.random() * 6.28,
        phy: Math.random() * 6.28,
        next: Math.random() * 1.2,
        period: 0.7 + Math.random() * 1.1,
      });
    }
  }
  initSources(P.ambientCount as number);

  const t0 = performance.now();
  const now = () => (performance.now() - t0) / 1000;

  let px = 0.5;
  let py = 0.5;
  let has = false;
  let lastI = -1e9;
  const toUv = (clientX: number, clientY: number): [number, number] => {
    const r = canvas.getBoundingClientRect();
    const x = (clientX - r.left) / r.width;
    const y = 1 - (clientY - r.top) / r.height;
    return [Math.min(Math.max(x, 0), 1), Math.min(Math.max(y, 0), 1)];
  };

  const onMove = (e: PointerEvent) => {
    const [x, y] = toUv(e.clientX, e.clientY);
    if (has) {
      queueDrop(
        x,
        y,
        Math.min(
          (P.brushBase as number) + Math.hypot(x - px, y - py) * (P.brushGain as number),
          P.brushMax as number,
        ),
        P.brushRadius as number,
      );
    }
    px = x;
    py = y;
    has = true;
    lastI = now();
  };
  const onDown = (e: PointerEvent) => {
    const [x, y] = toUv(e.clientX, e.clientY);
    queueDrop(x, y, P.clickStrength as number, P.clickRadius as number);
    px = x;
    py = y;
    has = true;
    lastI = now();
  };
  const onLeave = () => {
    has = false;
  };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerleave", onLeave);

  function collectAmbient(t: number, step: number) {
    if (!P.ambient) return;
    const idle = t - lastI > (P.idle as number);
    for (const s of sources) {
      s.next -= step;
      if (s.next <= 0) {
        s.next =
          (s.period / Math.max(P.ambientRate as number, 0.05)) * (0.7 + Math.random() * 0.6);
        const x = Math.min(Math.max(s.px + s.ax * Math.sin(t * s.sx * 6.28 + s.phx), 0.06), 0.94);
        const y = Math.min(Math.max(s.py + s.ay * Math.cos(t * s.sy * 6.28 + s.phy), 0.06), 0.94);
        queueDrop(
          x,
          y,
          (P.ambientStrength as number) * (idle ? 1 : (P.drivenMult as number)),
          0.03 + Math.random() * 0.02,
        );
      }
    }
  }

  let genv = 0;
  let gpx = 0.5;
  let gpy = 0.5;
  let ginit = false;
  const TAU = 6.283185307;
  function ghostPos(t: number): [number, number] {
    const s = P.ghostSpeed as number;
    const x =
      0.5 +
      0.3 * Math.sin(t * 0.037 * TAU * s) +
      0.12 * Math.sin(t * 0.011 * TAU * s + 1.7);
    const y =
      0.5 +
      0.28 * Math.cos(t * 0.043 * TAU * s) +
      0.13 * Math.cos(t * 0.017 * TAU * s + 4.1);
    return [Math.min(Math.max(x, 0.06), 0.94), Math.min(Math.max(y, 0.06), 0.94)];
  }
  function collectGhost(t: number, step: number) {
    const engaged = P.ghost && t - lastI > (P.ghostReturn as number);
    const rate = step / Math.max(P.ghostFade as number, 0.05);
    genv += Math.max(-rate, Math.min(rate, (engaged ? 1 : 0) - genv));
    const [gx, gy] = ghostPos(t);
    if (!ginit) {
      gpx = gx;
      gpy = gy;
      ginit = true;
    }
    if (genv > 0.001) {
      const dist = Math.hypot(gx - gpx, gy - gpy);
      const mag =
        Math.min(
          (P.brushBase as number) + dist * (P.brushGain as number),
          P.brushMax as number,
        ) *
        genv *
        (P.ghostGain as number);
      if (mag > 1e-4) queueDrop(gx, gy, mag, P.brushRadius as number);
    }
    gpx = gx;
    gpy = gy;
  }

  function simStep(step: number) {
    collectAmbient(now(), step);
    collectGhost(now(), step);
    const cnt = uploadDrops();
    const src = targets[read];
    const dst = targets[read ^ 1];
    gl.useProgram(updateP);
    gl.bindVertexArray(vao);
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
    gl.viewport(0, 0, sim, sim);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, src.tex);
    gl.uniform1i(uL.uState as WebGLUniformLocation, 0);
    gl.uniform2f(uL.uTexel as WebGLUniformLocation, 1 / sim, 1 / sim);
    gl.uniform1f(uL.uAspect as WebGLUniformLocation, vw / vh);
    gl.uniform1i(uL.uDropCount as WebGLUniformLocation, cnt);
    gl.uniform4fv(uL.uDrops as WebGLUniformLocation, dropData);
    setUniforms(uL, uItems);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    read ^= 1;
  }
  function render() {
    gl.useProgram(renderP);
    gl.bindVertexArray(vao);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, targets[read].tex);
    gl.uniform1i(rL.uState as WebGLUniformLocation, 0);
    gl.uniform2f(rL.uTexel as WebGLUniformLocation, 1 / sim, 1 / sim);
    gl.uniform2f(rL.uResolution as WebGLUniformLocation, canvas.width, canvas.height);
    gl.uniform1f(rL.uTime as WebGLUniformLocation, now());
    gl.uniform1f(rL.uAspect as WebGLUniformLocation, vw / vh);
    setUniforms(rL, rItems);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  let raf = 0;
  let last = performance.now();
  let accum = 0;
  function frame(t: number) {
    let dt = (t - last) / 1000;
    if (dt > 0.25) dt = 0.25;
    last = t;
    const step = 1 / Math.max(P.simRate as number, 1);
    if (!P.paused) {
      accum += dt;
      let n = 0;
      while (accum >= step && n < (P.maxSub as number)) {
        simStep(step);
        accum -= step;
        n++;
      }
      if (n === 0) {
        simStep(step);
        accum = 0;
      }
    }
    render();
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  const io = new IntersectionObserver(
    (entries) => {
      P.paused = !entries[0]?.isIntersecting;
    },
    { threshold: 0.05 },
  );
  io.observe(root);
}
