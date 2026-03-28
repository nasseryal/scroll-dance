import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// ── Palette de couleurs ──────────────────────────────────────────────────────
const SKINS = [
  { label: "Hero", body: "#2563eb", skin: "#fcd5a0", hair: "#1a1a2e", eye: "#60a5fa" },
  { label: "Villain", body: "#7c3aed", skin: "#f9c784", hair: "#dc2626", eye: "#a78bfa" },
  { label: "Ghost", body: "#e2e8f0", skin: "#c8d6e5", hair: "#64748b", eye: "#38bdf8" },
  { label: "Lava", body: "#ea580c", skin: "#fbbf24", hair: "#78350f", eye: "#fb923c" },
];

// ── Matériaux helpers ─────────────────────────────────────────────────────────
function mat(color, roughness = 0.4, metalness = 0.1) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />;
}

// ── Personnage POP ────────────────────────────────────────────────────────────
function PopCharacter({ palette, bobbing, spinning }) {
  const groupRef = useRef();
  const headRef = useRef();
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (groupRef.current) {
      if (spinning) groupRef.current.rotation.y += delta * 1.2;
      if (bobbing) groupRef.current.position.y = Math.sin(t.current * 2) * 0.08;
    }
    if (headRef.current && bobbing) {
      headRef.current.rotation.z = Math.sin(t.current * 1.5) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>

      {/* ── SOCLE ── */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.6, 0.12, 32]} />
        {mat("#1e293b", 0.6, 0.2)}
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.48, 0.55, 0.04, 32]} />
        {mat("#334155", 0.5, 0.3)}
      </mesh>

      {/* ── JAMBES ── */}
      <mesh position={[-0.13, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.28, 8, 16]} />
        {mat(palette.body)}
      </mesh>
      <mesh position={[0.13, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.28, 8, 16]} />
        {mat(palette.body)}
      </mesh>

      {/* Chaussures */}
      <mesh position={[-0.14, 0.16, 0.06]} castShadow>
        <sphereGeometry args={[0.13, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        {mat("#1e293b", 0.7)}
      </mesh>
      <mesh position={[0.14, 0.16, 0.06]} castShadow>
        <sphereGeometry args={[0.13, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        {mat("#1e293b", 0.7)}
      </mesh>

      {/* ── CORPS ── */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.28, 8, 16]} />
        {mat(palette.body)}
      </mesh>

      {/* Boutons déco */}
      {[-0.05, 0.05, 0.15].map((y, i) => (
        <mesh key={i} position={[0, 0.68 + y * 0.8, 0.22]} castShadow>
          <sphereGeometry args={[0.025, 8, 8]} />
          {mat("#fff", 0.3, 0.5)}
        </mesh>
      ))}

      {/* ── BRAS ── */}
      {/* Bras gauche */}
      <group position={[-0.3, 0.82, 0]} rotation={[0, 0, 0.5]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.08, 0.22, 8, 12]} />
          {mat(palette.body)}
        </mesh>
        {/* Main */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <sphereGeometry args={[0.1, 12, 12]} />
          {mat(palette.skin)}
        </mesh>
      </group>

      {/* Bras droit */}
      <group position={[0.3, 0.82, 0]} rotation={[0, 0, -0.5]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.08, 0.22, 8, 12]} />
          {mat(palette.body)}
        </mesh>
        <mesh position={[0, -0.2, 0]} castShadow>
          <sphereGeometry args={[0.1, 12, 12]} />
          {mat(palette.skin)}
        </mesh>
      </group>

      {/* ── COU ── */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.1, 16]} />
        {mat(palette.skin)}
      </mesh>

      {/* ── TÊTE (surdimensionnée) ── */}
      <group ref={headRef} position={[0, 1.46, 0]}>

        {/* Crâne principal */}
        <mesh castShadow>
          <sphereGeometry args={[0.52, 32, 32]} />
          {mat(palette.skin, 0.5, 0.05)}
        </mesh>

        {/* Joues */}
        <mesh position={[-0.3, -0.1, 0.38]} castShadow>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#f9a8d4" roughness={0.8} transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.3, -0.1, 0.38]} castShadow>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#f9a8d4" roughness={0.8} transparent opacity={0.5} />
        </mesh>

        {/* Yeux (blancs) */}
        <mesh position={[-0.18, 0.08, 0.46]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          {mat("#fff", 0.2)}
        </mesh>
        <mesh position={[0.18, 0.08, 0.46]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          {mat("#fff", 0.2)}
        </mesh>

        {/* Iris */}
        <mesh position={[-0.18, 0.08, 0.56]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          {mat(palette.eye, 0.1, 0.2)}
        </mesh>
        <mesh position={[0.18, 0.08, 0.56]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          {mat(palette.eye, 0.1, 0.2)}
        </mesh>

        {/* Pupilles */}
        <mesh position={[-0.18, 0.08, 0.62]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          {mat("#0f172a", 0.1)}
        </mesh>
        <mesh position={[0.18, 0.08, 0.62]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          {mat("#0f172a", 0.1)}
        </mesh>

        {/* Reflet yeux */}
        <mesh position={[-0.16, 0.11, 0.64]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          {mat("#fff", 0.0)}
        </mesh>
        <mesh position={[0.2, 0.11, 0.64]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          {mat("#fff", 0.0)}
        </mesh>

        {/* Nez */}
        <mesh position={[0, -0.04, 0.5]} rotation={[0.3, 0, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          {mat(palette.skin, 0.7)}
        </mesh>

        {/* Bouche (sourire) */}
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = (i / 6) * Math.PI + Math.PI * 0.1;
          const rx = Math.cos(angle) * 0.14;
          const ry = Math.sin(angle) * 0.07 - 0.2;
          return (
            <mesh key={i} position={[rx, ry, 0.5]}>
              <sphereGeometry args={[0.022, 8, 8]} />
              {mat("#7c2d12", 0.8)}
            </mesh>
          );
        })}

        {/* Cheveux */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <sphereGeometry args={[0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
          {mat(palette.hair, 0.8)}
        </mesh>
        {/* Mèche avant */}
        <mesh position={[0.15, 0.46, 0.3]} rotation={[0.6, -0.3, 0.2]} castShadow>
          <capsuleGeometry args={[0.06, 0.2, 8, 8]} />
          {mat(palette.hair, 0.8)}
        </mesh>
        <mesh position={[-0.1, 0.48, 0.34]} rotation={[0.5, 0.2, -0.1]} castShadow>
          <capsuleGeometry args={[0.05, 0.15, 8, 8]} />
          {mat(palette.hair, 0.8)}
        </mesh>

        {/* Oreilles */}
        <mesh position={[-0.5, 0.05, 0]} castShadow>
          <sphereGeometry args={[0.1, 12, 12]} />
          {mat(palette.skin, 0.6)}
        </mesh>
        <mesh position={[0.5, 0.05, 0]} castShadow>
          <sphereGeometry args={[0.1, 12, 12]} />
          {mat(palette.skin, 0.6)}
        </mesh>
      </group>
    </group>
  );
}

// ── UI Button ─────────────────────────────────────────────────────────────────
function Btn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 8,
        border: "2px solid",
        borderColor: active ? "#60a5fa" : "#334155",
        background: active ? "#1e40af" : "#0f172a",
        color: active ? "#fff" : "#94a3b8",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 600,
        transition: "all .15s",
      }}
    >
      {children}
    </button>
  );
}

// ── App principale ────────────────────────────────────────────────────────────
export default function App() {
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [bobbing, setBobbing] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const palette = SKINS[paletteIdx];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "radial-gradient(ellipse at 60% 40%, #1e293b 0%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', sans-serif",
        color: "#e2e8f0",
      }}
    >
      {/* Titre */}
      <div style={{ marginBottom: 12, textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: 1, color: "#f1f5f9" }}>
          🎮 POP Character
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
          Personnage 3D style Funko — intégrable dans ton jeu React
        </p>
      </div>

      {/* Canvas 3D */}
      <div
        style={{
          width: 380,
          height: 420,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
          border: "1px solid #1e293b",
        }}
      >
        <Canvas camera={{ position: [0, 1.2, 3.5], fov: 42 }} shadows>
          <ambientLight intensity={0.4} />
          <directionalLight position={[3, 5, 3]} intensity={1.2} castShadow />
          <pointLight position={[-3, 2, -2]} intensity={0.5} color="#60a5fa" />
          <pointLight position={[3, 0, 3]} intensity={0.3} color="#f472b6" />

          <PopCharacter palette={palette} bobbing={bobbing} spinning={spinning} />

          <ContactShadows position={[0, -1.4, 0]} opacity={0.6} scale={4} blur={2} />
          <Environment preset="city" />
          <OrbitControls
            enablePan={false}
            minDistance={2}
            maxDistance={6}
            target={[0, 0.5, 0]}
          />
        </Canvas>
      </div>

      {/* Contrôles */}
      <div
        style={{
          marginTop: 18,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "center",
        }}
      >
        {/* Skin */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#64748b", marginRight: 4 }}>Skin :</span>
          {SKINS.map((s, i) => (
            <button
              key={i}
              onClick={() => setPaletteIdx(i)}
              title={s.label}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: paletteIdx === i ? "3px solid #60a5fa" : "2px solid #334155",
                background: s.body,
                cursor: "pointer",
                transition: "all .15s",
              }}
            />
          ))}
        </div>

        {/* Animations */}
        <div style={{ display: "flex", gap: 8 }}>
          <Btn active={bobbing} onClick={() => setBobbing((v) => !v)}>
            🎵 Bob
          </Btn>
          <Btn active={spinning} onClick={() => setSpinning((v) => !v)}>
            🔄 Spin
          </Btn>
        </div>

        <p style={{ margin: 0, fontSize: 11, color: "#475569" }}>
          🖱️ Clic + glisser pour orbiter • Molette pour zoomer
        </p>
      </div>
    </div>
  );
}
