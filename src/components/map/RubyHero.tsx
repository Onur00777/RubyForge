"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Mesh } from "three";

function GemMesh() {
  const outer = useRef<Mesh>(null);
  const inner = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (outer.current) {
      outer.current.rotation.y += delta * 0.14;
      outer.current.rotation.x = 0.28 + Math.sin(performance.now() * 0.00028) * 0.06;
    }
    if (inner.current) {
      inner.current.rotation.y -= delta * 0.18;
    }
  });

  return (
    <group>
      <mesh ref={outer}>
        <octahedronGeometry args={[1.15, 0]} />
        <meshPhysicalMaterial
          color="#E0115F"
          roughness={0.16}
          metalness={0.18}
          transmission={0.42}
          thickness={1.1}
          ior={2.2}
          transparent
          opacity={0.96}
        />
      </mesh>
      <mesh ref={inner} scale={0.46}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#FF1E56" emissive="#590D22" emissiveIntensity={0.7} roughness={0.28} />
      </mesh>
    </group>
  );
}

export function RubyHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: "120px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="h-[220px] w-full">
      <Canvas
        dpr={[1, 1.25]}
        camera={{ position: [0, 0.15, 4.2], fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        frameloop={visible ? "always" : "never"}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.42} />
        <directionalLight position={[3.2, 4.4, 5]} intensity={1.25} color="#ffe0ea" />
        <pointLight position={[-2.6, -1.4, 2]} intensity={0.7} color="#FF1E56" />
        <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.28}>
          <GemMesh />
        </Float>
      </Canvas>
    </div>
  );
}
