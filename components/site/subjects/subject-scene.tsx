"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Float, Text3D } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import type { SubjectKey } from "@/lib/subjects";

const GOLD = "#c9993a";
const GOLD_LIGHT = "#e8c060";
const NAVY = "#0b1f3a";
const NAVY_SOFT = "#2b5591";

const gold = () => (
  <meshPhysicalMaterial color={GOLD} metalness={0.55} roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} />
);

/* ─────────────── Objects ─────────────── */

function MathObject() {
  const outer = useRef<THREE.Group>(null);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.25, 0)), []);
  const satellites = useMemo(
    () => Array.from({ length: 6 }, (_, i) => ({ angle: (i / 6) * Math.PI * 2, y: Math.sin(i * 1.7) * 0.6 })),
    [],
  );
  useFrame((_, dt) => {
    if (outer.current) outer.current.rotation.y += dt * 0.35;
  });
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[1.05, 0]} />
        {gold()}
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={NAVY} transparent opacity={0.55} />
      </lineSegments>
      <group ref={outer}>
        {satellites.map((s, i) => (
          <mesh key={i} position={[Math.cos(s.angle) * 2, s.y, Math.sin(s.angle) * 2]} rotation={[s.angle, s.angle, 0]}>
            <tetrahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color={i % 2 ? NAVY_SOFT : GOLD_LIGHT} metalness={0.4} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function EnglishObject() {
  const letters = useRef<THREE.Group>(null);
  const floating = useMemo(
    () =>
      ["B", "C", "E", "R", "W", "Z"].map((ch, i) => ({
        ch,
        angle: (i / 6) * Math.PI * 2,
        y: ((i % 3) - 1) * 0.7,
      })),
    [],
  );
  useFrame((_, dt) => {
    if (letters.current) letters.current.rotation.y -= dt * 0.3;
  });
  return (
    <group>
      <Center>
        <Text3D font="/fonts/helvetiker_bold.typeface.json" size={1.3} height={0.35} bevelEnabled bevelSize={0.03} bevelThickness={0.04} curveSegments={8}>
          Aa
          {gold()}
        </Text3D>
      </Center>
      <group ref={letters}>
        {floating.map((l) => (
          <group key={l.ch} position={[Math.cos(l.angle) * 2.3, l.y, Math.sin(l.angle) * 2.3]}>
            <Center>
              <Text3D font="/fonts/helvetiker_bold.typeface.json" size={0.32} height={0.08} curveSegments={4}>
                {l.ch}
                <meshStandardMaterial color={NAVY} metalness={0.2} roughness={0.4} />
              </Text3D>
            </Center>
          </group>
        ))}
      </group>
    </group>
  );
}

function Orbit({ tilt, speed, phase }: { tilt: [number, number, number]; speed: number; phase: number }) {
  const electron = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + phase;
    electron.current?.position.set(Math.cos(t) * 1.9, Math.sin(t) * 1.9, 0);
  });
  return (
    <group rotation={tilt}>
      <mesh>
        <torusGeometry args={[1.9, 0.012, 8, 120]} />
        <meshBasicMaterial color={NAVY} transparent opacity={0.45} />
      </mesh>
      <mesh ref={electron}>
        <sphereGeometry args={[0.11, 24, 24]} />
        <meshStandardMaterial color={GOLD_LIGHT} emissive={GOLD} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function PhysicsObject() {
  const nucleus = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / 9);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        return [Math.cos(theta) * Math.sin(phi) * 0.32, Math.sin(theta) * Math.sin(phi) * 0.32, Math.cos(phi) * 0.32] as [number, number, number];
      }),
    [],
  );
  return (
    <group>
      {nucleus.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.26, 32, 32]} />
          {i % 2 ? gold() : <meshPhysicalMaterial color={NAVY_SOFT} metalness={0.3} roughness={0.3} clearcoat={1} />}
        </mesh>
      ))}
      <Orbit tilt={[Math.PI / 2, 0, 0]} speed={1.4} phase={0} />
      <Orbit tilt={[Math.PI / 6, Math.PI / 3, 0]} speed={1.1} phase={2} />
      <Orbit tilt={[-Math.PI / 6, -Math.PI / 3, 0]} speed={1.7} phase={4} />
    </group>
  );
}

function Bond({ from, to, color = "#9fb0c8" }: { from: THREE.Vector3; to: THREE.Vector3; color?: string }) {
  const mid = from.clone().add(to).multiplyScalar(0.5);
  const dir = to.clone().sub(from);
  const len = dir.length();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.06, 0.06, len, 16]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

function ChemistryObject() {
  // A benzene-like ring: six carbons, six hydrogens.
  const { carbons, hydrogens } = useMemo(() => {
    const c = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0);
    });
    const h = c.map((v) => v.clone().multiplyScalar(1.75));
    return { carbons: c, hydrogens: h };
  }, []);
  return (
    <group rotation={[0.5, 0, 0]}>
      {carbons.map((c, i) => (
        <group key={i}>
          <mesh position={c}>
            <sphereGeometry args={[0.32, 32, 32]} />
            {gold()}
          </mesh>
          <mesh position={hydrogens[i]}>
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.25} clearcoat={1} />
          </mesh>
          <Bond from={c} to={carbons[(i + 1) % 6]} />
          <Bond from={c} to={hydrogens[i]} color="#c9d3e0" />
        </group>
      ))}
    </group>
  );
}

function InformaticsObject() {
  const { nodes, lines } = useMemo(() => {
    const n = 26;
    const pts = Array.from({ length: n }, (_, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      return new THREE.Vector3(Math.cos(theta) * Math.sin(phi), Math.sin(theta) * Math.sin(phi), Math.cos(phi)).multiplyScalar(1.7);
    });
    const segs: number[] = [];
    pts.forEach((p, i) => {
      pts
        .map((q, j) => ({ j, d: p.distanceTo(q) }))
        .filter((x) => x.j > i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
        .forEach(({ j }) => segs.push(p.x, p.y, p.z, pts[j].x, pts[j].y, pts[j].z));
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
    return { nodes: pts, lines: geo };
  }, []);
  return (
    <group>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color={NAVY} transparent opacity={0.45} />
      </lineSegments>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
          {i % 4 === 0 ? (
            <meshStandardMaterial color={GOLD_LIGHT} emissive={GOLD} emissiveIntensity={0.6} />
          ) : (
            <meshStandardMaterial color={NAVY_SOFT} metalness={0.3} roughness={0.35} />
          )}
        </mesh>
      ))}
      <mesh>
        <octahedronGeometry args={[0.45, 0]} />
        {gold()}
      </mesh>
    </group>
  );
}

const OBJECTS: Record<SubjectKey, () => React.JSX.Element> = {
  math: MathObject,
  english: EnglishObject,
  physics: PhysicsObject,
  chemistry: ChemistryObject,
  informatics: InformaticsObject,
};

/* ─────────────── Stage ─────────────── */

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function Slot({ index, count, progress, children }: { index: number; count: number; progress: MotionValue<number>; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    let pos = progress.get() * count - (index + 0.5); // 0 when this subject is centred
    // The first and last objects stay put at the very start and end of the stage.
    if (index === 0 && pos < 0) pos = 0;
    if (index === count - 1 && pos > 0) pos = 0;
    const presence = 1 - smoothstep(0.32, 0.62, Math.abs(pos));
    const s = THREE.MathUtils.lerp(g.scale.x, presence, Math.min(1, dt * 8));
    g.scale.setScalar(Math.max(0.0001, s));
    g.visible = s > 0.01;
    // Spin through the hand-off so one object "turns into" the next.
    g.rotation.y += dt * 0.25;
    g.rotation.z = pos * 0.9;
    g.position.y = -pos * 1.2;
    // Gentle pointer parallax
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, state.pointer.y * 0.3, 0.05);
  });
  return (
    <group ref={ref} scale={index === 0 ? 1 : 0.0001}>
      <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.6}>
        {children}
      </Float>
    </group>
  );
}

export default function SubjectScene({ progress, keys }: { progress: MotionValue<number>; keys: SubjectKey[] }) {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 40 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} color="#fff6e0" />
      <directionalLight position={[-5, -2, -3]} intensity={0.8} color="#bcd0ff" />
      <pointLight position={[0, 0, 4]} intensity={8} color={GOLD_LIGHT} distance={12} />
      {keys.map((key, i) => {
        const Obj = OBJECTS[key];
        return (
          <Slot key={key} index={i} count={keys.length} progress={progress}>
            <Obj />
          </Slot>
        );
      })}
    </Canvas>
  );
}
