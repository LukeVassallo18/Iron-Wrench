import { Float, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

function SpinningCube() {
  return (
    <Float speed={1.8} rotationIntensity={1.5} floatIntensity={1.7}>
      <mesh castShadow>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#a78bfa" metalness={0.35} roughness={0.25} />
      </mesh>
    </Float>
  )
}

export default function WebGLScene() {
  return (
    <Canvas camera={{ position: [2.2, 1.6, 3.1], fov: 50 }} shadows>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 3, 2]} intensity={1.2} castShadow />
      <SpinningCube />
      <OrbitControls enableZoom={false} />
    </Canvas>
  )
}
