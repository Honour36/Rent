"use client";
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './LiquidEther.css';

interface LiquidEtherProps {
  mouseForce?: number;
  cursorSize?: number;
  isViscous?: boolean;
  viscous?: number;
  iterationsViscous?: number;
  iterationsPoisson?: number;
  dt?: number;
  BFECC?: boolean;
  resolution?: number;
  isBounce?: boolean;
  colors?: string[];
  style?: React.CSSProperties;
  className?: string;
  autoDemo?: boolean;
  autoSpeed?: number;
  autoIntensity?: number;
  takeoverDuration?: number;
  autoResumeDelay?: number;
  autoRampDuration?: number;
}

export default function LiquidEther({
  mouseForce = 20, cursorSize = 100, isViscous = false, viscous = 30,
  iterationsViscous = 32, iterationsPoisson = 32, dt = 0.014, BFECC = true,
  resolution = 0.5, isBounce = false,
  colors = ['#5227FF', '#FF9FFC', '#B497CF'],
  style = {}, className = '',
  autoDemo = true, autoSpeed = 0.5, autoIntensity = 2.2,
  takeoverDuration = 0.25, autoResumeDelay = 1000, autoRampDuration = 0.6
}: LiquidEtherProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const webglRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const rafRef = useRef<number | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const isVisibleRef = useRef(true);
  const resizeRafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    function makePaletteTexture(stops: string[]) {
      let arr: string[];
      if (Array.isArray(stops) && stops.length > 0) {
        arr = stops.length === 1 ? [stops[0], stops[0]] : stops;
      } else { arr = ['#ffffff', '#ffffff']; }
      const w = arr.length;
      const data = new Uint8Array(w * 4);
      for (let i = 0; i < w; i++) {
        const c = new THREE.Color(arr[i]);
        data[i*4+0] = Math.round(c.r*255); data[i*4+1] = Math.round(c.g*255);
        data[i*4+2] = Math.round(c.b*255); data[i*4+3] = 255;
      }
      const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
      tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping; tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = false; tex.needsUpdate = true;
      return tex;
    }

    const paletteTex = makePaletteTexture(colors);
    const bgVec4 = new THREE.Vector4(0,0,0,0);

    // --- Shaders ---
    const face_vert = `attribute vec3 position;uniform vec2 px;uniform vec2 boundarySpace;varying vec2 uv;precision highp float;void main(){vec3 pos=position;vec2 scale=1.0-boundarySpace*2.0;pos.xy=pos.xy*scale;uv=vec2(0.5)+(pos.xy)*0.5;gl_Position=vec4(pos,1.0);}`;
    const line_vert = `attribute vec3 position;uniform vec2 px;precision highp float;varying vec2 uv;void main(){vec3 pos=position;uv=0.5+pos.xy*0.5;vec2 n=sign(pos.xy);pos.xy=abs(pos.xy)-px*1.0;pos.xy*=n;gl_Position=vec4(pos,1.0);}`;
    const mouse_vert = `precision highp float;attribute vec3 position;attribute vec2 uv;uniform vec2 center;uniform vec2 scale;uniform vec2 px;varying vec2 vUv;void main(){vec2 pos=position.xy*scale*2.0*px+center;vUv=uv;gl_Position=vec4(pos,0.0,1.0);}`;
    const advection_frag = `precision highp float;uniform sampler2D velocity;uniform float dt;uniform bool isBFECC;uniform vec2 fboSize;uniform vec2 px;varying vec2 uv;void main(){vec2 ratio=max(fboSize.x,fboSize.y)/fboSize;if(isBFECC==false){vec2 vel=texture2D(velocity,uv).xy;vec2 uv2=uv-vel*dt*ratio;vec2 newVel=texture2D(velocity,uv2).xy;gl_FragColor=vec4(newVel,0.0,0.0);}else{vec2 spot_new=uv;vec2 vel_old=texture2D(velocity,uv).xy;vec2 spot_old=spot_new-vel_old*dt*ratio;vec2 vel_new1=texture2D(velocity,spot_old).xy;vec2 spot_new2=spot_old+vel_new1*dt*ratio;vec2 error=spot_new2-spot_new;vec2 spot_new3=spot_new-error/2.0;vec2 vel_2=texture2D(velocity,spot_new3).xy;vec2 spot_old2=spot_new3-vel_2*dt*ratio;vec2 newVel2=texture2D(velocity,spot_old2).xy;gl_FragColor=vec4(newVel2,0.0,0.0);}}`;
    const color_frag = `precision highp float;uniform sampler2D velocity;uniform sampler2D palette;uniform vec4 bgColor;varying vec2 uv;void main(){vec2 vel=texture2D(velocity,uv).xy;float lenv=clamp(length(vel),0.0,1.0);vec3 c=texture2D(palette,vec2(lenv,0.5)).rgb;vec3 outRGB=mix(bgColor.rgb,c,lenv);float outA=mix(bgColor.a,1.0,lenv);gl_FragColor=vec4(outRGB,outA);}`;
    const divergence_frag = `precision highp float;uniform sampler2D velocity;uniform float dt;uniform vec2 px;varying vec2 uv;void main(){float x0=texture2D(velocity,uv-vec2(px.x,0.0)).x;float x1=texture2D(velocity,uv+vec2(px.x,0.0)).x;float y0=texture2D(velocity,uv-vec2(0.0,px.y)).y;float y1=texture2D(velocity,uv+vec2(0.0,px.y)).y;float divergence=(x1-x0+y1-y0)/2.0;gl_FragColor=vec4(divergence/dt);}`;
    const externalForce_frag = `precision highp float;uniform vec2 force;uniform vec2 center;uniform vec2 scale;uniform vec2 px;varying vec2 vUv;void main(){vec2 circle=(vUv-0.5)*2.0;float d=1.0-min(length(circle),1.0);d*=d;gl_FragColor=vec4(force*d,0.0,1.0);}`;
    const poisson_frag = `precision highp float;uniform sampler2D pressure;uniform sampler2D divergence;uniform vec2 px;varying vec2 uv;void main(){float p0=texture2D(pressure,uv+vec2(px.x*2.0,0.0)).r;float p1=texture2D(pressure,uv-vec2(px.x*2.0,0.0)).r;float p2=texture2D(pressure,uv+vec2(0.0,px.y*2.0)).r;float p3=texture2D(pressure,uv-vec2(0.0,px.y*2.0)).r;float div=texture2D(divergence,uv).r;float newP=(p0+p1+p2+p3)/4.0-div;gl_FragColor=vec4(newP);}`;
    const pressure_frag = `precision highp float;uniform sampler2D pressure;uniform sampler2D velocity;uniform vec2 px;uniform float dt;varying vec2 uv;void main(){float p0=texture2D(pressure,uv+vec2(px.x,0.0)).r;float p1=texture2D(pressure,uv-vec2(px.x,0.0)).r;float p2=texture2D(pressure,uv+vec2(0.0,px.y)).r;float p3=texture2D(pressure,uv-vec2(0.0,px.y)).r;vec2 v=texture2D(velocity,uv).xy;vec2 gradP=vec2(p0-p1,p2-p3)*0.5;v=v-gradP*dt;gl_FragColor=vec4(v,0.0,1.0);}`;
    const viscous_frag = `precision highp float;uniform sampler2D velocity;uniform sampler2D velocity_new;uniform float v;uniform vec2 px;uniform float dt;varying vec2 uv;void main(){vec2 old=texture2D(velocity,uv).xy;vec2 new0=texture2D(velocity_new,uv+vec2(px.x*2.0,0.0)).xy;vec2 new1=texture2D(velocity_new,uv-vec2(px.x*2.0,0.0)).xy;vec2 new2=texture2D(velocity_new,uv+vec2(0.0,px.y*2.0)).xy;vec2 new3=texture2D(velocity_new,uv-vec2(0.0,px.y*2.0)).xy;vec2 newv=4.0*old+v*dt*(new0+new1+new2+new3);newv/=4.0*(1.0+v*dt);gl_FragColor=vec4(newv,0.0,0.0);}`;

    // --- Classes (full source from reactbits) ---
    class CommonClass {
      width=0;height=0;aspect=1;pixelRatio=1;time=0;delta=0;container:any=null;renderer:any=null;clock:any=null;fboWidth:any=null;fboHeight:any=null;
      init(container:any){this.container=container;this.pixelRatio=Math.min(window.devicePixelRatio||1,2);this.resize();this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});this.renderer.autoClear=false;this.renderer.setClearColor(new THREE.Color(0x000000),0);this.renderer.setPixelRatio(this.pixelRatio);this.renderer.setSize(this.width,this.height);this.renderer.domElement.style.width='100%';this.renderer.domElement.style.height='100%';this.renderer.domElement.style.display='block';this.clock=new THREE.Clock();this.clock.start();}
      resize(){if(!this.container)return;const rect=this.container.getBoundingClientRect();this.width=Math.max(1,Math.floor(rect.width));this.height=Math.max(1,Math.floor(rect.height));this.aspect=this.width/this.height;if(this.renderer)this.renderer.setSize(this.width,this.height,false);}
      update(){this.delta=this.clock.getDelta();this.time+=this.delta;}
    }
    const Common=new CommonClass();

    class MouseClass {
      mouseMoved=false;coords=new THREE.Vector2();coords_old=new THREE.Vector2();diff=new THREE.Vector2();timer:any=null;container:any=null;docTarget:any=null;listenerTarget:any=null;isHoverInside=false;hasUserControl=false;isAutoActive=false;autoIntensity=2.0;takeoverActive=false;takeoverStartTime=0;takeoverDuration=0.25;takeoverFrom=new THREE.Vector2();takeoverTo=new THREE.Vector2();onInteract:any=null;
      _onMouseMove=(e:any)=>this.onDocumentMouseMove(e);_onTouchStart=(e:any)=>this.onDocumentTouchStart(e);_onTouchMove=(e:any)=>this.onDocumentTouchMove(e);_onTouchEnd=()=>{this.isHoverInside=false;};_onDocumentLeave=()=>{this.isHoverInside=false;};
      init(container:any){this.container=container;const dv=(container.ownerDocument||document).defaultView||window;this.listenerTarget=dv;this.docTarget=container.ownerDocument||document;dv.addEventListener('mousemove',this._onMouseMove);dv.addEventListener('touchstart',this._onTouchStart,{passive:true});dv.addEventListener('touchmove',this._onTouchMove,{passive:true});dv.addEventListener('touchend',this._onTouchEnd);this.docTarget.addEventListener('mouseleave',this._onDocumentLeave);}
      dispose(){if(this.listenerTarget){this.listenerTarget.removeEventListener('mousemove',this._onMouseMove);this.listenerTarget.removeEventListener('touchstart',this._onTouchStart);this.listenerTarget.removeEventListener('touchmove',this._onTouchMove);this.listenerTarget.removeEventListener('touchend',this._onTouchEnd);}if(this.docTarget)this.docTarget.removeEventListener('mouseleave',this._onDocumentLeave);}
      isPointInside(x:number,y:number){if(!this.container)return false;const r=this.container.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;}
      setCoords(x:number,y:number){if(!this.container)return;if(this.timer)clearTimeout(this.timer);const r=this.container.getBoundingClientRect();if(!r.width||!r.height)return;const nx=(x-r.left)/r.width,ny=(y-r.top)/r.height;this.coords.set(nx*2-1,-(ny*2-1));this.mouseMoved=true;this.timer=setTimeout(()=>{this.mouseMoved=false;},100);}
      setNormalized(nx:number,ny:number){this.coords.set(nx,ny);this.mouseMoved=true;}
      onDocumentMouseMove(e:any){if(!this.isPointInside(e.clientX,e.clientY))return;if(this.onInteract)this.onInteract();if(this.isAutoActive&&!this.hasUserControl&&!this.takeoverActive){const r=this.container?.getBoundingClientRect();if(!r?.width)return;const nx=(e.clientX-r.left)/r.width,ny=(e.clientY-r.top)/r.height;this.takeoverFrom.copy(this.coords);this.takeoverTo.set(nx*2-1,-(ny*2-1));this.takeoverStartTime=performance.now();this.takeoverActive=true;this.hasUserControl=true;this.isAutoActive=false;return;}this.setCoords(e.clientX,e.clientY);this.hasUserControl=true;}
      onDocumentTouchStart(e:any){if(e.touches.length!==1)return;const t=e.touches[0];if(!this.isPointInside(t.clientX,t.clientY))return;if(this.onInteract)this.onInteract();this.setCoords(t.clientX,t.clientY);this.hasUserControl=true;}
      onDocumentTouchMove(e:any){if(e.touches.length!==1)return;const t=e.touches[0];if(!this.isPointInside(t.clientX,t.clientY))return;this.setCoords(t.clientX,t.clientY);}
      update(){if(this.takeoverActive){const t=(performance.now()-this.takeoverStartTime)/(this.takeoverDuration*1000);if(t>=1){this.takeoverActive=false;this.coords.copy(this.takeoverTo);this.coords_old.copy(this.coords);this.diff.set(0,0);}else{const k=t*t*(3-2*t);this.coords.copy(this.takeoverFrom).lerp(this.takeoverTo,k);}}this.diff.subVectors(this.coords,this.coords_old);this.coords_old.copy(this.coords);if(!this.coords_old.x&&!this.coords_old.y)this.diff.set(0,0);if(this.isAutoActive&&!this.takeoverActive)this.diff.multiplyScalar(this.autoIntensity);}
    }
    const Mouse=new MouseClass();

    class AutoDriver {
      mouse:any;manager:any;enabled:boolean;speed:number;resumeDelay:number;rampDurationMs:number;active=false;current=new THREE.Vector2(0,0);target=new THREE.Vector2();lastTime=performance.now();activationTime=0;margin=0.2;_tmpDir=new THREE.Vector2();
      constructor(mouse:any,manager:any,opts:any){this.mouse=mouse;this.manager=manager;this.enabled=opts.enabled;this.speed=opts.speed;this.resumeDelay=opts.resumeDelay||3000;this.rampDurationMs=(opts.rampDuration||0)*1000;this.pickNewTarget();}
      pickNewTarget(){const r=Math.random;this.target.set((r()*2-1)*(1-this.margin),(r()*2-1)*(1-this.margin));}
      forceStop(){this.active=false;this.mouse.isAutoActive=false;}
      update(){if(!this.enabled)return;const now=performance.now(),idle=now-this.manager.lastUserInteraction;if(idle<this.resumeDelay){if(this.active)this.forceStop();return;}if(this.mouse.isHoverInside){if(this.active)this.forceStop();return;}if(!this.active){this.active=true;this.current.copy(this.mouse.coords);this.lastTime=now;this.activationTime=now;}this.mouse.isAutoActive=true;let dtSec=(now-this.lastTime)/1000;this.lastTime=now;if(dtSec>0.2)dtSec=0.016;const dir=this._tmpDir.subVectors(this.target,this.current);const dist=dir.length();if(dist<0.01){this.pickNewTarget();return;}dir.normalize();let ramp=1;if(this.rampDurationMs>0){const t=Math.min(1,(now-this.activationTime)/this.rampDurationMs);ramp=t*t*(3-2*t);}this.current.addScaledVector(dir,Math.min(this.speed*dtSec*ramp,dist));this.mouse.setNormalized(this.current.x,this.current.y);}
    }

    class ShaderPass {
      props:any;uniforms:any;scene:any;camera:any;material:any;geometry:any;plane:any;
      constructor(props:any){this.props=props||{};this.uniforms=props?.material?.uniforms;}
      init(){this.scene=new THREE.Scene();this.camera=new THREE.Camera();if(this.uniforms){this.material=new THREE.RawShaderMaterial(this.props.material);this.geometry=new THREE.PlaneGeometry(2,2);this.plane=new THREE.Mesh(this.geometry,this.material);this.scene.add(this.plane);}}
      update(){Common.renderer.setRenderTarget(this.props.output||null);Common.renderer.render(this.scene,this.camera);Common.renderer.setRenderTarget(null);}
    }

    class Advection extends ShaderPass {
      line:any;
      constructor(p:any){super({material:{vertexShader:face_vert,fragmentShader:advection_frag,uniforms:{boundarySpace:{value:p.cellScale},px:{value:p.cellScale},fboSize:{value:p.fboSize},velocity:{value:p.src.texture},dt:{value:p.dt},isBFECC:{value:true}}},output:p.dst});this.uniforms=this.props.material.uniforms;this.init();}
      init(){super.init();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,-1,0,-1,1,0,-1,1,0,1,1,0,1,1,0,1,-1,0,1,-1,0,-1,-1,0]),3));this.line=new THREE.LineSegments(g,new THREE.RawShaderMaterial({vertexShader:line_vert,fragmentShader:advection_frag,uniforms:this.uniforms}));this.scene.add(this.line);}
      update({dt,isBounce,BFECC}:any){this.uniforms.dt.value=dt;this.line.visible=isBounce;this.uniforms.isBFECC.value=BFECC;super.update();}
    }
    class ExternalForce extends ShaderPass {
      mouse:any;
      constructor(p:any){super({output:p.dst});this.init(p);}
      init(p:any){super.init();const m=new THREE.RawShaderMaterial({vertexShader:mouse_vert,fragmentShader:externalForce_frag,blending:THREE.AdditiveBlending,depthWrite:false,uniforms:{px:{value:p.cellScale},force:{value:new THREE.Vector2()},center:{value:new THREE.Vector2()},scale:{value:new THREE.Vector2(p.cursor_size,p.cursor_size)}}});this.mouse=new THREE.Mesh(new THREE.PlaneGeometry(1,1),m);this.scene.add(this.mouse);}
      update(p:any){const u=this.mouse.material.uniforms;u.force.value.set((Mouse.diff.x/2)*p.mouse_force,(Mouse.diff.y/2)*p.mouse_force);const cx=p.cursor_size*p.cellScale.x,cy=p.cursor_size*p.cellScale.y;u.center.value.set(Math.min(Math.max(Mouse.coords.x,-1+cx+p.cellScale.x*2),1-cx-p.cellScale.x*2),Math.min(Math.max(Mouse.coords.y,-1+cy+p.cellScale.y*2),1-cy-p.cellScale.y*2));u.scale.value.set(p.cursor_size,p.cursor_size);super.update();}
    }
    class Viscous extends ShaderPass {
      constructor(p:any){super({material:{vertexShader:face_vert,fragmentShader:viscous_frag,uniforms:{boundarySpace:{value:p.boundarySpace},velocity:{value:p.src.texture},velocity_new:{value:p.dst_.texture},v:{value:p.viscous},px:{value:p.cellScale},dt:{value:p.dt}}},output:p.dst,output0:p.dst_,output1:p.dst});this.init();}
      update({viscous:v,iterations:it,dt}:any){this.uniforms.v.value=v;let fi,fo;for(let i=0;i<it;i++){if(i%2===0){fi=this.props.output0;fo=this.props.output1;}else{fi=this.props.output1;fo=this.props.output0;}this.uniforms.velocity_new.value=fi.texture;this.props.output=fo;this.uniforms.dt.value=dt;super.update();}return fo;}
    }
    class Divergence extends ShaderPass {
      constructor(p:any){super({material:{vertexShader:face_vert,fragmentShader:divergence_frag,uniforms:{boundarySpace:{value:p.boundarySpace},velocity:{value:p.src.texture},px:{value:p.cellScale},dt:{value:p.dt}}},output:p.dst});this.init();}
      update({vel}:any){this.uniforms.velocity.value=vel.texture;super.update();}
    }
    class Poisson extends ShaderPass {
      constructor(p:any){super({material:{vertexShader:face_vert,fragmentShader:poisson_frag,uniforms:{boundarySpace:{value:p.boundarySpace},pressure:{value:p.dst_.texture},divergence:{value:p.src.texture},px:{value:p.cellScale}}},output:p.dst,output0:p.dst_,output1:p.dst});this.init();}
      update({iterations:it}:any){let pi,po;for(let i=0;i<it;i++){if(i%2===0){pi=this.props.output0;po=this.props.output1;}else{pi=this.props.output1;po=this.props.output0;}this.uniforms.pressure.value=pi.texture;this.props.output=po;super.update();}return po;}
    }
    class Pressure extends ShaderPass {
      constructor(p:any){super({material:{vertexShader:face_vert,fragmentShader:pressure_frag,uniforms:{boundarySpace:{value:p.boundarySpace},pressure:{value:p.src_p.texture},velocity:{value:p.src_v.texture},px:{value:p.cellScale},dt:{value:p.dt}}},output:p.dst});this.init();}
      update({vel,pressure}:any){this.uniforms.velocity.value=vel.texture;this.uniforms.pressure.value=pressure.texture;super.update();}
    }

    class Simulation {
      options:any;fbos:any;fboSize=new THREE.Vector2();cellScale=new THREE.Vector2();boundarySpace=new THREE.Vector2();
      advection:any;externalForce:any;viscous:any;divergence:any;poisson:any;pressure:any;
      constructor(opts:any){this.options={iterations_poisson:32,iterations_viscous:32,mouse_force:20,resolution:0.5,cursor_size:100,viscous:30,isBounce:false,dt:0.014,isViscous:false,BFECC:true,...opts};this.fbos={};this.init();}
      init(){this.calcSize();this.createAllFBO();this.createShaderPass();}
      getFloatType(){return/(iPad|iPhone|iPod)/i.test(navigator.userAgent)?THREE.HalfFloatType:THREE.FloatType;}
      createAllFBO(){const t=this.getFloatType(),opts={type:t,depthBuffer:false,stencilBuffer:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,wrapS:THREE.ClampToEdgeWrapping,wrapT:THREE.ClampToEdgeWrapping};['vel_0','vel_1','vel_viscous0','vel_viscous1','div','pressure_0','pressure_1'].forEach(k=>{this.fbos[k]=new THREE.WebGLRenderTarget(this.fboSize.x,this.fboSize.y,opts);});}
      createShaderPass(){const f=this.fbos,c=this.cellScale,b=this.boundarySpace,o=this.options;this.advection=new Advection({cellScale:c,fboSize:this.fboSize,dt:o.dt,src:f.vel_0,dst:f.vel_1});this.externalForce=new ExternalForce({cellScale:c,cursor_size:o.cursor_size,dst:f.vel_1});this.viscous=new Viscous({cellScale:c,boundarySpace:b,viscous:o.viscous,src:f.vel_1,dst:f.vel_viscous1,dst_:f.vel_viscous0,dt:o.dt});this.divergence=new Divergence({cellScale:c,boundarySpace:b,src:f.vel_viscous0,dst:f.div,dt:o.dt});this.poisson=new Poisson({cellScale:c,boundarySpace:b,src:f.div,dst:f.pressure_1,dst_:f.pressure_0});this.pressure=new Pressure({cellScale:c,boundarySpace:b,src_p:f.pressure_0,src_v:f.vel_viscous0,dst:f.vel_0,dt:o.dt});}
      calcSize(){const w=Math.max(1,Math.round(this.options.resolution*Common.width)),h=Math.max(1,Math.round(this.options.resolution*Common.height));this.cellScale.set(1/w,1/h);this.fboSize.set(w,h);}
      resize(){this.calcSize();Object.values(this.fbos).forEach((f:any)=>f.setSize(this.fboSize.x,this.fboSize.y));}
      update(){const o=this.options;o.isBounce?this.boundarySpace.set(0,0):this.boundarySpace.copy(this.cellScale);this.advection.update({dt:o.dt,isBounce:o.isBounce,BFECC:o.BFECC});this.externalForce.update({cursor_size:o.cursor_size,mouse_force:o.mouse_force,cellScale:this.cellScale});let vel=this.fbos.vel_1;if(o.isViscous)vel=this.viscous.update({viscous:o.viscous,iterations:o.iterations_viscous,dt:o.dt});this.divergence.update({vel});const pressure=this.poisson.update({iterations:o.iterations_poisson});this.pressure.update({vel,pressure});}
    }

    class Output {
      simulation:any;scene:any;camera:any;output:any;
      constructor(){this.scene=new THREE.Scene();this.camera=new THREE.Camera();this.simulation=new Simulation({iterations_poisson:iterationsPoisson,iterations_viscous:iterationsViscous,mouse_force:mouseForce,resolution,cursor_size:cursorSize,viscous,isBounce,dt,isViscous,BFECC});this.output=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.RawShaderMaterial({vertexShader:face_vert,fragmentShader:color_frag,transparent:true,depthWrite:false,uniforms:{velocity:{value:this.simulation.fbos.vel_0.texture},boundarySpace:{value:new THREE.Vector2()},palette:{value:paletteTex},bgColor:{value:bgVec4}}}));this.scene.add(this.output);}
      resize(){this.simulation.resize();}
      render(){Common.renderer.setRenderTarget(null);Common.renderer.render(this.scene,this.camera);}
      update(){this.simulation.update();this.render();}
    }

    class WebGLManager {
      props:any;output:any;autoDriver:any;lastUserInteraction=performance.now();running=false;_loop:any;_resize:any;_onVisibility:any;
      constructor(p:any){this.props=p;Common.init(p.$wrapper);Mouse.init(p.$wrapper);Mouse.autoIntensity=p.autoIntensity;Mouse.takeoverDuration=p.takeoverDuration;Mouse.onInteract=()=>{this.lastUserInteraction=performance.now();if(this.autoDriver)this.autoDriver.forceStop();};this.autoDriver=new AutoDriver(Mouse,this,{enabled:p.autoDemo,speed:p.autoSpeed,resumeDelay:p.autoResumeDelay,rampDuration:p.autoRampDuration});this.init();this._loop=this.loop.bind(this);this._resize=this.resize.bind(this);window.addEventListener('resize',this._resize);this._onVisibility=()=>{if(document.hidden)this.pause();else if(isVisibleRef.current)this.start();};document.addEventListener('visibilitychange',this._onVisibility);}
      init(){this.props.$wrapper.prepend(Common.renderer.domElement);this.output=new Output();}
      resize(){Common.resize();this.output.resize();}
      render(){if(this.autoDriver)this.autoDriver.update();Mouse.update();Common.update();this.output.update();}
      loop(){if(!this.running)return;this.render();rafRef.current=requestAnimationFrame(this._loop);}
      start(){if(this.running)return;this.running=true;this._loop();}
      pause(){this.running=false;if(rafRef.current){cancelAnimationFrame(rafRef.current);rafRef.current=null;}}
      dispose(){try{window.removeEventListener('resize',this._resize);document.removeEventListener('visibilitychange',this._onVisibility);Mouse.dispose();if(Common.renderer){const c=Common.renderer.domElement;if(c?.parentNode)c.parentNode.removeChild(c);Common.renderer.dispose();Common.renderer.forceContextLoss();}}catch(e){}}
    }

    const container = mountRef.current!;
    container.style.position = container.style.position || 'relative';
    container.style.overflow = container.style.overflow || 'hidden';

    const webgl = new WebGLManager({$wrapper:container,autoDemo,autoSpeed,autoIntensity,takeoverDuration,autoResumeDelay,autoRampDuration});
    webglRef.current = webgl;
    webgl.start();

    const io = new IntersectionObserver(entries=>{const v=entries[0].isIntersecting;isVisibleRef.current=v;if(!webglRef.current)return;v&&!document.hidden?webglRef.current.start():webglRef.current.pause();},{threshold:[0,0.01,0.1]});
    io.observe(container);
    intersectionObserverRef.current=io;

    const ro = new ResizeObserver(()=>{if(!webglRef.current)return;if(resizeRafRef.current)cancelAnimationFrame(resizeRafRef.current);resizeRafRef.current=requestAnimationFrame(()=>{webglRef.current?.resize();});});
    ro.observe(container);
    resizeObserverRef.current=ro;

    return ()=>{
      if(rafRef.current)cancelAnimationFrame(rafRef.current);
      try{resizeObserverRef.current?.disconnect();}catch(e){}
      try{intersectionObserverRef.current?.disconnect();}catch(e){}
      webglRef.current?.dispose();
      webglRef.current=null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mountRef} className={`liquid-ether-container ${className}`} style={style} />;
}
