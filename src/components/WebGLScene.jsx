import { Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";

function R6Model() {
  const modelRef = useRef(null);
  const { scene } = useGLTF("/R6.glb");
  const modelScale = 1.2;
  const [layout, setLayout] = useState({ planeRadius: 3.2, planeY: -0.01 });

  // Fine-tune in centimeters (small, predictable adjustments).
  // +X right, +Y up, +Z toward camera.
  const fineTuneCm = { x: 0, y: 0, z: 0 };
  const fineTune = {
    x: fineTuneCm.x / 100,
    y: fineTuneCm.y / 100,
    z: fineTuneCm.z / 100,
  };

  useEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (!modelRef.current) return;
    modelRef.current.rotation.y -= delta * 0.2;
  });

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, layout.planeY, 0]}
        receiveShadow
      >
        <circleGeometry args={[layout.planeRadius, 64]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} metalness={0} />
      </mesh>

      <group
        ref={modelRef}
        rotation={[0, Math.PI * 0.15, 0]}
        position={[fineTune.x, fineTune.y, fineTune.z]}
      >
        <Center
          onCentered={({ width, height, depth }) => {
            const nextPlaneRadius = Math.max(width, depth) * 0.68;
            const nextPlaneY = -(height / 2) - 0.01;

            setLayout((prev) => {
              if (
                Math.abs(prev.planeRadius - nextPlaneRadius) < 0.0001 &&
                Math.abs(prev.planeY - nextPlaneY) < 0.0001
              ) {
                return prev;
              }

              return { planeRadius: nextPlaneRadius, planeY: nextPlaneY };
            });
          }}
        >
          <primitive object={scene} scale={modelScale} />
        </Center>
      </group>
    </group>
  );
}

export default function WebGLScene() {
  return (
    <Canvas camera={{ position: [1.4, 2.1, 30], fov: 42 }} shadows>
      <color attach="background" args={["#0d0d0d"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3.5, 4.5, 2]} intensity={1.3} castShadow />

      <Suspense fallback={null}>
        <R6Model />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI * 0.58}
        minPolarAngle={Math.PI * 0.33}
      />
    </Canvas>
  );
}

useGLTF.preload("/R6.glb");
