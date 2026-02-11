import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei'; // Import baru untuk mode Low

// --- SUB-COMPONENTS (High Quality) ---
const MechBone = ({ start, end, isPalm = false }) => {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const orientation = new THREE.Matrix4();
  orientation.lookAt(start, end, new THREE.Object3D().up);
  orientation.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(orientation);

  const width = isPalm ? 0.5 : 0.15;
  const depth = isPalm ? 0.1 : 0.15;

  return (
    <group position={midpoint} quaternion={quaternion}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, length * 0.9, depth]} />
        <meshStandardMaterial color="#fff" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, depth / 2 + 0.005]}>
        <planeGeometry args={[width * 0.5, length * 0.8]} />
        <meshBasicMaterial color="#000" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const MechJoint = ({ position, size = 0.3, isTip = false }) => {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[isTip ? size * 0.6 : size * 0.5, 1]} />
        <meshStandardMaterial
          color={isTip ? "#06b6d4" : "#94a3b8"}
          emissive={isTip ? "#06b6d4" : "#000000"}
          emissiveIntensity={isTip ? 2 : 0}
          metalness={0.9} roughness={0.1}
        />
      </mesh>
    </group>
  );
};

// --- SUB-COMPONENT (Medium Quality) ---
const SimpleBone = ({ start, end }) => {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[0.12, 0.12, length, 8]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.5} />
    </mesh>
  );
};

// --- MAIN COMPONENT ---
export const Hand3D = ({ landmarks, quality = 'HIGH' }) => {
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20], [5, 9], [9, 13], [13, 17], [0, 17], [0, 5]
  ];

  if (!landmarks || landmarks.length === 0) return null;

  const prevPoints = useRef(null);
  const targetPoints = useMemo(() => landmarks.map(lm => {
    return new THREE.Vector3((lm.x - 0.5) * -10, (lm.y - 0.5) * -10, lm.z * -5);
  }), [landmarks]);

  if (!prevPoints.current) prevPoints.current = targetPoints;

  const points = targetPoints.map((target, i) => {
    const current = prevPoints.current[i];
    // Interpolasi lebih cepat di low mode
    current.lerp(target, quality === 'LOW' ? 0.5 : 0.25);
    return current.clone();
  });

  prevPoints.current = points;
  const fingerTips = [4, 8, 12, 16, 20];

  // --- RENDER MODE: LOW (Performance) ---
  if (quality === 'LOW') {
    // Menggunakan Line sederhana dari Drei untuk performa maksimal
    const linePoints = connections.map(([start, end]) => [points[start], points[end]]);
    return (
      <group position={[0, 0, 0]} rotation={[-0.2, 0, 0]}>
        {connections.map(([start, end], i) => (
          <Line
            key={i}
            points={[points[start], points[end]]}
            color="#06b6d4"
            lineWidth={2}
          />
        ))}
        {fingerTips.map((idx) => (
          <mesh key={idx} position={points[idx]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshBasicMaterial color="cyan" />
          </mesh>
        ))}
      </group>
    );
  }

  // --- RENDER MODE: MEDIUM (Balanced) ---
  if (quality === 'MEDIUM') {
    return (
      <group position={[0, 0, 0]} rotation={[-0.2, 0, 0]}>
        {connections.map(([start, end], i) => (
          <SimpleBone key={`bone-${i}`} start={points[start]} end={points[end]} />
        ))}
        {points.map((pos, index) => (
          <mesh key={`joint-${index}`} position={pos}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={fingerTips.includes(index) ? "#06b6d4" : "#94a3b8"} />
          </mesh>
        ))}
      </group>
    );
  }

  // --- RENDER MODE: HIGH (Visuals) ---
  return (
    <group position={[0, 0, 0]} rotation={[-0.2, 0, 0]}>
      {connections.map(([start, end], i) => {
        const isPalm = i >= 20;
        return <MechBone key={`bone-${i}`} start={points[start]} end={points[end]} isPalm={isPalm} />;
      })}
      {points.map((pos, index) => {
        const isTip = fingerTips.includes(index);
        const isWrist = index === 0;
        const size = isWrist ? 0.4 : (isTip ? 0.2 : 0.18);
        return <MechJoint key={`joint-${index}`} position={pos} size={size} isTip={isTip} />;
      })}
    </group>
  );
};