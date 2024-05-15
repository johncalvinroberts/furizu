import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function Scene() {
  const gltf = useLoader(GLTFLoader, '/assets/.gltf');
  return <primitive object={gltf.scene} />;
}
