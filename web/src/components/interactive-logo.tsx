import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function Scene() {
  const gltf = useLoader(GLTFLoader, '/assets/.gltf');
  return <primitive object={gltf.scene} />;
}
