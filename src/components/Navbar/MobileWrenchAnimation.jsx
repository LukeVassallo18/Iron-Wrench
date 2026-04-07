import { Center, ContactShadows, Environment } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const metalProps = {
  color: '#f2f4f7',
  metalness: 0.82,
  roughness: 0.2,
  clearcoat: 0.55,
  clearcoatRoughness: 0.14,
}

function Wrench({ isOpen }) {
  const wrenchRef = useRef(null)
  const wrenchShape = useMemo(() => {
    const shape = new THREE.Shape()

    // Outer silhouette (adjustable wrench side profile)
    shape.moveTo(-0.085, -0.9)
    shape.lineTo(-0.085, 0.34)
    shape.lineTo(-0.22, 0.56)
    shape.lineTo(-0.12, 0.8)
    shape.lineTo(0.07, 0.66)
    shape.lineTo(0.13, 0.74)
    shape.lineTo(0.24, 0.63)
    shape.lineTo(0.12, 0.47)
    shape.lineTo(0.085, 0.34)
    shape.lineTo(0.085, -0.9)
    shape.closePath()

    // Ring hole at the handle end
    const ringHole = new THREE.Path()
    ringHole.absellipse(0, -0.78, 0.042, 0.042, 0, Math.PI * 2, false, 0)
    shape.holes.push(ringHole)

    // Jaw opening cutout
    const jawGap = new THREE.Path()
    jawGap.moveTo(-0.025, 0.52)
    jawGap.lineTo(0.118, 0.63)
    jawGap.lineTo(0.018, 0.445)
    jawGap.closePath()
    shape.holes.push(jawGap)

    return shape
  }, [])

  const extrudeOptions = useMemo(
    () => ({
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.009,
      bevelSegments: 3,
      curveSegments: 24,
    }),
    [],
  )

  useFrame((_, delta) => {
    if (!wrenchRef.current) return

    const targetY = isOpen ? 0.7 : 2.0
    const targetRotation = isOpen ? -0.78 : 0.4
    const hasDropped = Math.abs(wrenchRef.current.position.y - targetY) < 0.03;

    wrenchRef.current.position.y = THREE.MathUtils.damp(
      wrenchRef.current.position.y,
      targetY,
      7,
      delta,
    )

    wrenchRef.current.rotation.z = THREE.MathUtils.damp(
      wrenchRef.current.rotation.z,
      targetRotation,
      7,
      delta,
    )

    if (isOpen && hasDropped) {
      // Horizontal spin after drop-in completes.
      wrenchRef.current.rotation.y += delta * 2.2;
    } else {
      // Reset spin when closed/opening.
      wrenchRef.current.rotation.y = THREE.MathUtils.damp(
        wrenchRef.current.rotation.y,
        0,
        8,
        delta,
      );
    }
  })

  return (
    <group ref={wrenchRef} position={[0, 1.0, 0]} rotation={[0, 0, 0.4]}>
      {/* Main wrench body */}
      <mesh position={[0, 0, -0.04]} castShadow receiveShadow>
        <extrudeGeometry args={[wrenchShape, extrudeOptions]} />
        <meshPhysicalMaterial {...metalProps} />
      </mesh>

      {/* Worm screw detail */}
      <mesh position={[0.018, 0.495, 0.055]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.1, 20]} />
        <meshStandardMaterial color="#d8dde5" metalness={0.9} roughness={0.18} />
      </mesh>

      {/* Screw knob */}
      <mesh position={[0.075, 0.495, 0.055]}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshStandardMaterial color="#cfd5de" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  )
}

function MobileWrenchAnimation({ isOpen }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 40 }}
      flat
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={1.2} />
      <hemisphereLight intensity={1} color="#ffffff" groundColor="#666" />
      <directionalLight position={[2.4, 3, 2]} intensity={1.6} />
      <pointLight position={[-1.8, 1.4, 1.8]} intensity={1} />
      <Environment preset="city" />
      <Center>
        <Wrench isOpen={isOpen} />
      </Center>
      <ContactShadows
        position={[0, -1.25, 0]}
        opacity={0.35}
        blur={1.2}
        scale={2.2}
        far={2.5}
      />
    </Canvas>
  )
}

export default MobileWrenchAnimation
