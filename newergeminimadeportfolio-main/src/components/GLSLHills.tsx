"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface GLSLHillsProps {
  cameraZ?: number;
  planeSize?: number;
  speed?: number;
  /** When true, fills its positioned parent (absolute). Default: fills viewport (fixed). */
  contained?: boolean;
}

const VERTEX_SHADER = `#define GLSLIFY 1
attribute vec3 position;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float time;
uniform float uAspect;
varying vec3 vPosition;

mat4 rotateMatrixX(float radian) {
  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, cos(radian), -sin(radian), 0.0,
    0.0, sin(radian), cos(radian), 0.0,
    0.0, 0.0, 0.0, 1.0
  );
}

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec3 P) {
  vec3 Pi0 = floor(P); vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod289(Pi0); Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz; vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0); vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x); vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z); vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x); vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z); vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000,n100,n010,n110), vec4(n001,n101,n011,n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

void main(void) {
  vec3 updatePosition = (rotateMatrixX(radians(90.0)) * vec4(position, 1.0)).xyz;
  float responsiveX = updatePosition.x / (112.0 * min(1.0, uAspect * 0.8));
  float sin1 = sin(radians(responsiveX * 90.0));
  vec3 noisePosition = updatePosition + vec3(0.0, 0.0, time * -30.0);
  float noise1 = cnoise(noisePosition * 0.08);
  float noise2 = cnoise(noisePosition * 0.06);
  float noise3 = cnoise(noisePosition * 0.4);
  vec3 lastPosition = updatePosition + vec3(
    0.0,
    noise1 * sin1 * 12.0 + noise2 * sin1 * 12.0 + noise3 * (abs(sin1) * 3.0 + 0.5) + pow(sin1, 2.0) * 45.0,
    0.0
  );
  vPosition = lastPosition;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(lastPosition, 1.0);
}`;

const FRAGMENT_SHADER = `precision highp float;
#define GLSLIFY 1
varying vec3 vPosition;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main(void) {
  float dist = length(vPosition);
  // Adjusted opacity for light theme to ensure vibrancy without being too dark
  float opacity = (112.0 - dist) / 256.0 * 1.6;
  opacity = clamp(opacity, 0.0, 1.0);
  float grain = random(vPosition.xy + vPosition.z) * 0.04;
  vec3 brandAccent = vec3(0.0, 0.75, 1.0); // Slightly more vibrant blue for light mode
  vec3 finalColor = brandAccent + grain;
  gl_FragColor = vec4(finalColor, opacity);
}`;

export function GLSLHills({ cameraZ = 125, planeSize = 256, speed = 0.5, contained = false }: GLSLHillsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getSize = () => {
      if (contained && canvas.parentElement) {
        const r = canvas.parentElement.getBoundingClientRect();
        return { w: Math.max(r.width, 1), h: Math.max(r.height, 1) };
      }
      return { w: window.innerWidth, h: window.innerHeight };
    };

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    const scene = new THREE.Scene();
    const { w: initW, h: initH } = getSize();
    const camera = new THREE.PerspectiveCamera(45, initW / initH, 1, 10000);
    const clock = new THREE.Clock();

    const uniforms = {
      time: { type: "f", value: 0 },
      uAspect: { type: "f", value: initW / initH },
    };

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(planeSize, planeSize, planeSize, planeSize),
      new THREE.RawShaderMaterial({
        uniforms,
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
      })
    );
    scene.add(mesh);

    const applySize = (w: number, h: number) => {
      const aspect = w / h;
      uniforms.uAspect.value = aspect;
      camera.aspect = aspect;
      if (aspect < 1.0) {
        camera.position.set(0, 24, cameraZ * (aspect * 0.5 + 0.5));
        camera.lookAt(new THREE.Vector3(0, 32, 0));
      } else {
        camera.position.set(0, 16, cameraZ);
        camera.lookAt(new THREE.Vector3(0, 28, 0));
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const resize = () => {
      const { w, h } = getSize();
      applySize(w, h);
    };

    renderer.setClearColor(0xffffff, 0);
    applySize(initW, initH);
    window.addEventListener("resize", resize, { passive: true });

    let rafId: number;
    const loop = () => {
      uniforms.time.value += clock.getDelta() * speed;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    };
  }, [cameraZ, planeSize, speed, contained]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: contained ? "absolute" : "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        display: "block",
      }}
    />
  );
}
