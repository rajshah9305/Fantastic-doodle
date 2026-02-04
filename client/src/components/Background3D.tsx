import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

function FloatingShape({ position, color, speed, rotationSpeed }: { position: [number, number, number], color: string, speed: number, rotationSpeed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * rotationSpeed;
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
      </mesh>
    </Float>
  );
}

export default function Background3D() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={0.5} />

        {/* Orange Shapes */}
        <FloatingShape position={[-3, 2, 0]} color="#ea580c" speed={1.5} rotationSpeed={0.2} />
        <FloatingShape position={[3, -2, -2]} color="#ea580c" speed={2} rotationSpeed={0.3} />

        {/* Red Shapes */}
        <FloatingShape position={[2, 3, -1]} color="#dc2626" speed={1.2} rotationSpeed={0.15} />
        <FloatingShape position={[-2, -3, 0]} color="#dc2626" speed={1.8} rotationSpeed={0.25} />

        {/* Subtle Background Elements */}
        <FloatingShape position={[0, 0, -5]} color="#444" speed={0.5} rotationSpeed={0.1} />
        <FloatingShape position={[5, 5, -8]} color="#333" speed={0.8} rotationSpeed={0.1} />
        <FloatingShape position={[-5, -5, -8]} color="#333" speed={0.8} rotationSpeed={0.1} />
      </Canvas>
    </div>
  );
}
