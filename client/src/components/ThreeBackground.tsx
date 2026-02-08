import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial } from "@react-three/drei";

function ParticleField({ count = 2000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <Points ref={pointsRef} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ea580c"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

function FloatingShape() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2;
      meshRef.current.rotation.y = Math.cos(state.clock.getElapsedTime() * 0.2) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere args={[1, 64, 64]} ref={meshRef}>
        <MeshDistortMaterial
          color="#ea580c"
          speed={3}
          distort={0.4}
          radius={1}
          wireframe
          transparent
          opacity={0.15}
        />
      </Sphere>
      <Sphere args={[0.9, 32, 32]}>
        <meshBasicMaterial color="#ea580c" wireframe transparent opacity={0.05} />
      </Sphere>
    </Float>
  );
}

function Scene() {
  const { mouse } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.1, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.1, 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ea580c" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f97316" />

      <group scale={1.5}>
        <FloatingShape />
      </group>

      {/* Multiple floating shapes for depth */}
      <Float speed={1.5} rotationIntensity={2} floatIntensity={2} position={[3, 2, -2]}>
        <Sphere args={[0.5, 16, 16]}>
          <meshBasicMaterial color="#ea580c" wireframe transparent opacity={0.1} />
        </Sphere>
      </Float>

      <Float speed={1} rotationIntensity={1.5} floatIntensity={1.5} position={[-4, -2, -1]}>
        <Sphere args={[0.7, 16, 16]}>
          <meshBasicMaterial color="#ea580c" wireframe transparent opacity={0.05} />
        </Sphere>
      </Float>

      <ParticleField count={1500} />
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-100/10 to-transparent dark:via-zinc-900/10 z-[1]" />
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 2]} // Optimize for high DPI screens
      >
        <Scene />
      </Canvas>
    </div>
  );
}
