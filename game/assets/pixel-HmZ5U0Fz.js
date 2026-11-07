import{W as L,H as le,N as V,c as Y,V as z,d as b,e as $,P as ee,f as te,O as oe,g as se,h as q,i as Q,j as ue}from"./game-DL27lLbr.js";const ae="varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",ve=`
  uniform sampler2D tColor;
  uniform sampler2D tDepth;
  uniform vec2 size;
  uniform float levels;
  uniform float dither;
  uniform float outline;
  uniform float exposure;
  uniform float saturation;
  uniform float near;
  uniform float far;
  uniform float ortho;
  varying vec2 vUv;

  vec3 rrtOdt(vec3 v) {
    vec3 a = v * (v + 0.0245786) - 0.000090537;
    vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
    return a / b;
  }
  vec3 aces(vec3 c) {
    const mat3 inM = mat3(0.59719, 0.07600, 0.02840, 0.35458, 0.90834, 0.13383, 0.04823, 0.01566, 0.83777);
    const mat3 outM = mat3(1.60475, -0.10208, -0.00327, -0.53108, 1.10813, -0.07276, -0.07367, -0.00605, 1.07602);
    c *= exposure / 0.6;
    return clamp(outM * rrtOdt(inM * c), 0.0, 1.0);
  }
  vec3 toSRGB(vec3 c) {
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
  }
  float linearDepth(vec2 uv) {
    if (ortho > 0.5) return near + texture2D(tDepth, uv).x * (far - near);
    float d = texture2D(tDepth, uv).x * 2.0 - 1.0;
    return 2.0 * near * far / (far + near - d * (far - near));
  }
  float bayer(vec2 p) {
    // 4×4 Bayer 矩陣，回傳 0～1
    int x = int(mod(p.x, 4.0));
    int y = int(mod(p.y, 4.0));
    int i = x + y * 4;
    float m[16];
    m[0] = 0.0; m[1] = 8.0; m[2] = 2.0; m[3] = 10.0;
    m[4] = 12.0; m[5] = 4.0; m[6] = 14.0; m[7] = 6.0;
    m[8] = 3.0; m[9] = 11.0; m[10] = 1.0; m[11] = 9.0;
    m[12] = 15.0; m[13] = 7.0; m[14] = 13.0; m[15] = 5.0;
    for (int k = 0; k < 16; k++) if (k == i) return m[k] / 16.0;
    return 0.0;
  }
  void main() {
    vec2 px = floor(vUv * size) + 0.5;
    vec2 uv = px / size;
    vec3 c = toSRGB(aces(texture2D(tColor, uv).rgb));
    // 像素畫的顏色通常比寫實算圖飽和，先拉高飽和度再壓色階
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = clamp(mix(vec3(l), c, saturation), 0.0, 1.0);
    // 色階：每個通道只留 levels 階，抖色讓色階交界不那麼死板
    float t = dither * (bayer(px) - 0.5);
    c = floor(c * (levels - 1.0) + 0.5 + t) / (levels - 1.0);
    // 深度描邊：與上下左右相差夠大的像素畫成深色輪廓
    float d = linearDepth(uv);
    // 只描近處的輪廓；遠處地平線與天空交界不畫線
    if (outline > 0.0 && d < 150.0) {
      vec2 o = 1.0 / size;
      float dmax = max(max(linearDepth(uv + vec2(o.x, 0.0)), linearDepth(uv - vec2(o.x, 0.0))), max(linearDepth(uv + vec2(0.0, o.y)), linearDepth(uv - vec2(0.0, o.y))));
      if (dmax - d > 0.06 * d) c *= 0.35;
    }
    gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
  }
`;function xe(t,{pixelSize:c=5,levels:s=8,dither:d=.25,saturation:p=1.3,outline:g=!0}={}){const u=new L(1,1,{minFilter:V,magFilter:V});u.depthTexture=new Y(1,1);const v=new q({vertexShader:ae,fragmentShader:ve,depthTest:!1,depthWrite:!1,uniforms:{tColor:{value:u.texture},tDepth:{value:u.depthTexture},size:{value:new b(1,1)},levels:{value:s},dither:{value:d},outline:{value:g?1:0},exposure:{value:t.toneMappingExposure},saturation:{value:p},near:{value:.1},far:{value:2e3},ortho:{value:0}}}),w=new $(new ee(2,2),v);w.frustumCulled=!1;const T=new te;T.add(w);const D=new oe(-1,1,1,-1,0,1),l={pixelSize:c,setSize(x,n){const y=Math.max(1,Math.round(x/l.pixelSize)),M=Math.max(1,Math.round(n/l.pixelSize));u.setSize(y,M),v.uniforms.size.value.set(y,M)},render(x,n){v.uniforms.near.value=n.near,v.uniforms.far.value=n.far,v.uniforms.ortho.value=n.isOrthographicCamera?1:0,v.uniforms.exposure.value=t.toneMappingExposure,t.setRenderTarget(u),t.render(x,n),t.setRenderTarget(null),t.render(T,D)},uniforms:v.uniforms,dispose(){u.depthTexture.dispose(),u.dispose(),v.dispose(),w.geometry.dispose()}};return l}const fe={ink:"#1a1618",stone0:"#3a3836",stone1:"#5d5a55",stone2:"#86817a",stone3:"#aea89c",stone4:"#d6cfbf",stone5:"#f4efe2",red0:"#3a0f14",red1:"#6b1c1e",red2:"#9a2b24",red3:"#c94a32",tile0:"#6e3426",tile1:"#9e4c33",tile2:"#c96a3f",tile3:"#e89458",gold0:"#5e4421",gold1:"#94732f",gold2:"#cba245",gold3:"#f0d68a",teal0:"#16312f",teal1:"#245a4c",teal2:"#3e8a68",teal3:"#86c296",blue0:"#1e2b55",blue1:"#3a5e9e",wood0:"#2a1711",wood1:"#4d2a1d",sky0:"#3e6db2",sky1:"#6e98cf",sky2:"#a8c5e4",sky3:"#d8e6f1",skin:"#e3ab80"},re=Object.values(fe),N=t=>t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4);function ie(t,c,s){const d=Math.cbrt(.4122214708*t+.5363325363*c+.0514459929*s),p=Math.cbrt(.2119034982*t+.6806995451*c+.1073969566*s),g=Math.cbrt(.0883024619*t+.2817188376*c+.6299787005*s);return[.2104542553*d+.793617785*p-.0040720468*g,1.9779984951*d-2.428592205*p+.4505937099*g,.0259040371*d+.7827717662*p-.808675766*g]}function ce(t=re){return t.map(c=>{const s=parseInt(c.slice(1),16),d=[s>>16,s>>8&255,s&255];return{hex:c,rgb:d,lab:ie(...d.map(p=>N(p/255)))}})}function ge(t,c,s,d,{saturation:p=1,contrast:g=1}={}){let[u,v,w]=ie(N(c/255),N(s/255),N(d/255));u=.55+(u-.55)*g,v*=p,w*=p;let T=t[0],D=1/0;for(const l of t){const x=(l.lab[0]-u)**2+(l.lab[1]-v)**2+(l.lab[2]-w)**2;x<D&&(D=x,T=l)}return T}const de=`
  uniform sampler2D tColor;
  uniform sampler2D tDepth;
  uniform sampler2D tNormal;
  uniform vec2 size;
  uniform float near;
  uniform float far;
  uniform float ortho;
  uniform float pixelWorld; // 正交：一格幾公尺；透視：每公尺深度一格幾公尺
  uniform vec2 halfView; // 正交：畫面半寬半高（公尺）；透視：tan(半視角)
  uniform float outline;
  uniform float creases;
  uniform float highlight;
  uniform vec3 lightDir; // 觀察空間的日光方向（指向光源）
  uniform float exposure;
  uniform float saturation;
  uniform float dither;
  uniform vec2 ditherOrigin;
  uniform vec3 paletteLab[PALETTE_SIZE];
  uniform vec3 paletteRGB[PALETTE_SIZE];
  varying vec2 vUv;

  float linearDepth(vec2 uv) {
    float z = texture2D(tDepth, uv).x;
    if (ortho > 0.5) return near + z * (far - near);
    z = z * 2.0 - 1.0;
    return 2.0 * near * far / (far + near - z * (far - near));
  }
  // 由深度還原觀察空間座標，用來判斷稜線是凸還是凹
  vec3 viewPos(vec2 uv, float d) {
    vec2 ndc = uv * 2.0 - 1.0;
    if (ortho > 0.5) return vec3(ndc * halfView, -d);
    return vec3(ndc * halfView * d, -d);
  }
  vec3 oklab(vec3 c) {
    vec3 lms = vec3(
      dot(c, vec3(0.4122214708, 0.5363325363, 0.0514459929)),
      dot(c, vec3(0.2119034982, 0.6806995451, 0.1073969566)),
      dot(c, vec3(0.0883024619, 0.2817188376, 0.6299787005)));
    lms = pow(max(lms, 0.0), vec3(1.0 / 3.0));
    return vec3(
      dot(lms, vec3(0.2104542553, 0.7936177850, -0.0040720468)),
      dot(lms, vec3(1.9779984951, -2.4285922050, 0.4505937099)),
      dot(lms, vec3(0.0259040371, 0.7827717662, -0.8086757660)));
  }
  // 4×4 Bayer 矩陣（由 2×2 遞迴組成），回傳 0～1
  float bayer(vec2 p) {
    vec2 a = mod(floor(p), 2.0);
    vec2 b = mod(floor(p / 2.0), 2.0);
    float m0 = 2.0 * abs(a.x - a.y) + a.y;
    float m1 = 2.0 * abs(b.x - b.y) + b.y;
    return (m0 * 4.0 + m1 + 0.5) / 16.0;
  }
  void main() {
    vec3 c = texture2D(tColor, vUv).rgb * exposure;
    vec4 ns = texture2D(tNormal, vUv);
    bool hasN = ns.a > 0.5;
    vec3 n = normalize(ns.xyz * 2.0 - 1.0);
    float d = linearDepth(vUv);
    float edge = 0.0; // 1：外輪廓（深色線）
    float crease = 0.0; // 1：凹稜或背光的凸稜（淡一點的深色線）；-1：向光的凸稜（亮線）
    if (outline > 0.5 && hasN && d < far * 0.5) {
      // 一格在這個深度涵蓋多寬
      float pix = ortho > 0.5 ? pixelWorld : pixelWorld * d;
      vec3 p = viewPos(vUv, d);
      vec2 offs[4];
      offs[0] = vec2(1.0, 0.0);
      offs[1] = vec2(-1.0, 0.0);
      offs[2] = vec2(0.0, 1.0);
      offs[3] = vec2(0.0, -1.0);
      for (int i = 0; i < 4; i++) {
        vec2 uv2 = vUv + offs[i] / size;
        float nd = linearDepth(uv2);
        // 這格所在的平面延伸到鄰格，應該是多深；斜看的地面每格深度差很大，用平面預測才不會誤判成輪廓
        vec2 ndc2 = uv2 * 2.0 - 1.0;
        vec3 origin = ortho > 0.5 ? vec3(ndc2 * halfView, 0.0) : vec3(0.0);
        vec3 dir = ortho > 0.5 ? vec3(0.0, 0.0, -1.0) : vec3(ndc2 * halfView, -1.0);
        float facing = dot(n, dir);
        float expect = abs(facing) > 1e-3 ? dot(n, p - origin) / facing : 1e9;
        float gap = max(pix * 1.5, 0.12) + 0.08 * abs(expect - d);
        // 鄰格比預測的還遠很多：這格在前景物體的邊上，畫外輪廓
        if (nd - min(expect, 1e8) > gap && nd - d > max(pix * 1.5, 0.12)) edge = 1.0;
        vec4 ns2 = texture2D(tNormal, uv2);
        if (creases < 0.5 || ns2.a < 0.5 || abs(nd - expect) > gap) continue;
        vec3 n2 = normalize(ns2.xyz * 2.0 - 1.0);
        // 法線差夠大才算稜線；只畫在其中一側（法線差偏向 (1,1,1) 的那側），線才會是一格寬
        if (dot(n, n2) > 0.82 || dot(n - n2, vec3(1.0)) <= 0.0) continue;
        vec3 q = viewPos(uv2, nd);
        bool convex = dot(n2, p - q) + dot(n, q - p) < 0.0;
        bool lit = dot(n, lightDir) > 0.15;
        if (highlight > 0.5 && convex && lit) crease = crease > 0.5 ? crease : -1.0;
        else crease = 1.0;
      }
    }
    // 外輪廓壓到接近黑但保留一點色相（落在各色組最暗的一格），稜線只壓暗一半
    if (edge > 0.5) c *= 0.08;
    else if (crease > 0.5) c *= 0.5;
    else if (crease < -0.5) c = c * 1.6 + 0.03;
    // 對應到調色盤：OKLab 距離最近的一色。抖色只在亮度上加一點有序雜訊，圖樣跟著世界走（ditherOrigin），平移時才不會爬動
    vec3 lab = oklab(c);
    lab.yz *= saturation;
    lab.x += dither * (bayer(gl_FragCoord.xy + ditherOrigin) - 0.5) * 0.08;
    float best = 1e9;
    vec3 outColor = paletteRGB[0];
    for (int i = 0; i < PALETTE_SIZE; i++) {
      vec3 e = paletteLab[i] - lab;
      float dist = dot(e, e);
      if (dist < best) {
        best = dist;
        outColor = paletteRGB[i];
      }
    }
    gl_FragColor = vec4(outColor, 1.0);
  }
`,pe=`
  uniform sampler2D tPixels;
  uniform vec2 size;
  uniform float scale;
  uniform vec2 origin;
  void main() {
    vec2 ip = floor((gl_FragCoord.xy - origin) / scale);
    gl_FragColor = texture2D(tPixels, (ip + 0.5) / size);
  }
`;function me(t){return new q({side:t.side,uniforms:{map:{value:t.map},alphaTest:{value:t.alphaTest},uvTransform:{value:t.map.matrix}},vertexShader:`uniform mat3 uvTransform; varying vec2 vUv; varying vec3 vNormal;
      void main(){ vUv = (uvTransform * vec3(uv, 1.0)).xy; vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`uniform sampler2D map; uniform float alphaTest; varying vec2 vUv; varying vec3 vNormal;
      void main(){ if (texture2D(map, vUv).a < alphaTest) discard; vec3 n = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0); gl_FragColor = vec4(n * 0.5 + 0.5, 1.0); }`})}function be(t,{height:c=270,snap:s=!0,smooth:d=!0,outline:p=!0,creases:g=!0,highlight:u=!0,dither:v=0,saturation:w=1.1,exposure:T=1,palette:D=re,light:l=null}={}){const x={minFilter:V,magFilter:V,generateMipmaps:!1},n=new L(1,1,{...x,type:le});n.depthTexture=new Y(1,1);const y=new L(1,1,x),M=new L(1,1,{...x,depthBuffer:!1}),_=ce(D),I=(a,e,i={})=>new q({vertexShader:ae,fragmentShader:a,uniforms:e,defines:i,depthTest:!1,depthWrite:!1}),C=I(de,{tColor:{value:n.texture},tDepth:{value:n.depthTexture},tNormal:{value:y.texture},size:{value:new b(1,1)},near:{value:.1},far:{value:2e3},ortho:{value:0},pixelWorld:{value:.01},halfView:{value:new b(1,1)},outline:{value:p?1:0},creases:{value:g?1:0},highlight:{value:u?1:0},lightDir:{value:new z(0,1,0)},exposure:{value:T},saturation:{value:w},dither:{value:v},ditherOrigin:{value:new b(0,0)},paletteLab:{value:_.map(a=>new z(...a.lab))},paletteRGB:{value:_.map(a=>new z(...a.rgb.map(e=>e/255)))}},{PALETTE_SIZE:_.length}),S=I(pe,{tPixels:{value:M.texture},size:{value:new b(1,1)},scale:{value:1},origin:{value:new b(0,0)}}),O=new $(new ee(2,2),C);O.frustumCulled=!1;const k=new te;k.add(O);const G=new oe(-1,1,1,-1,0,1),E=new Map,Z=a=>(E.has(a.uuid)||E.set(a.uuid,a.map&&a.alphaTest>0?me(a):new ue({side:a.side})),E.get(a.uuid)),R=[],H=new se,ne=(a,e)=>{a.traverseVisible(o=>{if(o.isPoints||o.isLine||o.isSprite){R.push([o,o.material,!0]),o.visible=!1;return}if(!o.isMesh)return;const f=o.material;R.push([o,f,!0]),!Array.isArray(f)&&(!f.depthWrite||f.transparent)?o.visible=!1:o.material=Array.isArray(f)?f.map(Z):Z(f)}),t.getClearColor(H);const i=t.getClearAlpha(),W=t.shadowMap.autoUpdate;t.shadowMap.autoUpdate=!1,t.setClearColor(0,0),t.setRenderTarget(y),t.render(a,e),t.setClearColor(H,i),t.shadowMap.autoUpdate=W;for(const[o,f,U]of R)o.material=f,o.visible=U;R.length=0},F=new b(1,1),r=new b(1,1);let m=1;const h={position:new z},j=new z,B=new z,A=new b,X=new z,P={options:{height:c,snap:s,smooth:d},uniforms:C.uniforms,targets:{color:n,normal:y,pixels:M},info:{scale:1,width:1,height:1,worldPerPixel:0},setSize(a,e){F.set(a,e),m=Math.max(1,Math.round(e/P.options.height)),r.set(Math.ceil(a/m)+2,Math.ceil(e/m)+2);for(const i of[n,y,M])i.setSize(r.x,r.y);C.uniforms.size.value.copy(r),S.uniforms.size.value.copy(r),S.uniforms.scale.value=m,Object.assign(P.info,{scale:m,width:r.x-2,height:r.y-2})},render(a,e){const i=C.uniforms;h.position.copy(e.position);const W=e.isOrthographicCamera;if(A.set(0,0),W){Object.assign(h,{left:e.left,right:e.right,top:e.top,bottom:e.bottom,zoom:e.zoom});const o=(e.top-e.bottom)/e.zoom*m/F.y;e.left=-r.x*o/2,e.right=r.x*o/2,e.top=r.y*o/2,e.bottom=-r.y*o/2,e.zoom=1,e.updateMatrixWorld(),j.setFromMatrixColumn(e.matrixWorld,0).normalize(),B.setFromMatrixColumn(e.matrixWorld,1).normalize();const f=e.position.dot(j),U=e.position.dot(B);if(P.options.snap){const K=Math.round(f/o)*o-f,J=Math.round(U/o)*o-U;e.position.addScaledVector(j,K).addScaledVector(B,J),P.options.smooth&&A.set(Math.round(K/o*m),Math.round(J/o*m))}i.ditherOrigin.value.set(Math.round(f/o)%4,Math.round(U/o)%4),i.pixelWorld.value=o,i.halfView.value.set(r.x*o/2,r.y*o/2),P.info.worldPerPixel=o}else{Object.assign(h,{fov:e.fov,aspect:e.aspect});const o=Math.tan(Q.degToRad(e.fov)/2)*r.y*m/F.y;e.fov=Q.radToDeg(2*Math.atan(o)),e.aspect=r.x/r.y,i.pixelWorld.value=2*o/r.y,i.halfView.value.set(o*e.aspect,o),i.ditherOrigin.value.set(0,0)}e.updateProjectionMatrix(),e.updateMatrixWorld(),i.near.value=e.near,i.far.value=e.far,i.ortho.value=W?1:0,l&&(l.updateMatrixWorld(),l.target.updateMatrixWorld(),X.setFromMatrixPosition(l.target.matrixWorld),i.lightDir.value.setFromMatrixPosition(l.matrixWorld).sub(X).transformDirection(e.matrixWorldInverse)),t.setRenderTarget(n),t.render(a,e),i.outline.value>.5&&ne(a,e),O.material=C,t.setRenderTarget(M),t.render(k,G),S.uniforms.origin.value.set(Math.floor((F.x-r.x*m)/2)+A.x,Math.floor((F.y-r.y*m)/2)+A.y),O.material=S,t.setRenderTarget(null),t.render(k,G),e.position.copy(h.position),W?Object.assign(e,{left:h.left,right:h.right,top:h.top,bottom:h.bottom,zoom:h.zoom}):Object.assign(e,{fov:h.fov,aspect:h.aspect}),e.updateProjectionMatrix(),e.updateMatrixWorld()},dispose(){n.depthTexture.dispose();for(const a of[n,y,M])a.dispose();C.dispose(),S.dispose(),O.geometry.dispose();for(const a of E.values())a.dispose()}};return P}export{fe as PIXELART_COLORS,re as PIXELART_PALETTE,be as createPixelArtPass,xe as createPixelPass,ie as linearToOklab,ge as nearestPaletteColor,ce as paletteTable};
