import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* eslint-disable react/no-unknown-property */

const Inner = () => {
  const ref = useRef<THREE.Group>();
  const gltf = useLoader(GLTFLoader, '/logo.gltf');

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.01; // Adjust the rotation speed as needed
    }
  });
  return <primitive object={gltf.scene} ref={ref} />;
};

export function InteractiveLogo({
  size = '100px',
  className,
}: {
  size?: string;
  className?: string;
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [25, 0, 3], fov: 18 }}
      style={{ width: size, height: size }}
      className={className}
    >
      <ambientLight intensity={1} />
      <spotLight position={[0, 0, 0]} angle={0.15} penumbra={1} castShadow />
      <Inner />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
/* eslint-enable react/no-unknown-property */
