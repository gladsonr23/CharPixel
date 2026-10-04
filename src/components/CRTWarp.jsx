import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './CRTWarp.css';

const vertexShader = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.);}`;
const fragmentShader = `precision highp float; varying vec2 vUv; uniform float t; uniform vec3 color,bg; float n(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);} void main(){vec2 p=vUv-.5;p*=1.+dot(p,p)*.32;float wave=sin(p.y*165.+t*4.)*.08+sin((p.x+p.y)*16.-t)*.09;float s=smoothstep(.22,.82,.5+.5*sin(p.x*8.+p.y*5.+wave*12.+t));float l=.72+.28*sin(vUv.y*510.);float grain=(n(gl_FragCoord.xy+t)-.5)*.045;vec3 phosphor=color*(.18+s*.38)*l+grain;gl_FragColor=vec4(mix(bg,phosphor,.58),1.);}`;

export default function CRTWarp({ color='#c7a4ff', backgroundColor='#0d0d0f', speed=.35, dpr=1, fps=24, className='' }) {
  const root=useRef(null);
  useEffect(()=>{const el=root.current;if(!el)return undefined;const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'low-power'});const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);const material=new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms:{t:{value:0},color:{value:new THREE.Color(color)},bg:{value:new THREE.Color(backgroundColor)}}});const geometry=new THREE.PlaneGeometry(2,2);scene.add(new THREE.Mesh(geometry,material));el.appendChild(renderer.domElement);const resize=()=>{renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,dpr));renderer.setSize(Math.max(el.clientWidth,1),Math.max(el.clientHeight,1),false);};const observer=new ResizeObserver(resize);observer.observe(el);resize();let frame,last=0;const start=performance.now();const draw=now=>{frame=requestAnimationFrame(draw);if(document.hidden||now-last<1000/fps)return;last=now;material.uniforms.t.value=(now-start)/1000*speed;renderer.render(scene,camera);};draw(0);return()=>{cancelAnimationFrame(frame);observer.disconnect();geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove();};},[backgroundColor,color,dpr,fps,speed]);
  return <div aria-hidden="true" ref={root} className={`crt-warp-container ${className}`} />;
}
