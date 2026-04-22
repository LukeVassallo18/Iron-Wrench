import { Center, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { doc, getDoc } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { db } from "../../firebase";

const metalMaterial = {
  color: "#f2f4f7",
  metalness: 0.82,
  roughness: 0.2,
  clearcoat: 0.55,
  clearcoatRoughness: 0.14,
};

function Wrench({ isOpen, horizontalSpinSpeed }) {
  const wrenchRef = useRef(null);
  const wrenchTexture = useTexture("/wrench_texture.png");

  useEffect(() => {
    wrenchTexture.colorSpace = THREE.SRGBColorSpace;
    wrenchTexture.wrapS = THREE.RepeatWrapping;
    wrenchTexture.wrapT = THREE.RepeatWrapping;
    wrenchTexture.repeat.set(1, 1);
    wrenchTexture.anisotropy = 8;
  }, [wrenchTexture]);

  const wrenchShape = useMemo(() => {
    // i used THREE.shape since it lets us define a 2D shape with holes and then cna be extruded outwards to create the 3D shape
    const shape = new THREE.Shape();

    // Outer silhouette ( wrench 2D)
    shape.moveTo(-0.085, -0.9);
    shape.lineTo(-0.085, 0.34);
    shape.lineTo(-0.22, 0.56);
    shape.lineTo(-0.12, 0.8);
    shape.lineTo(0.07, 0.66);
    shape.lineTo(0.13, 0.74);
    shape.lineTo(0.24, 0.63);
    shape.lineTo(0.12, 0.47);
    shape.lineTo(0.085, 0.34);
    shape.lineTo(0.085, -0.9);
    shape.closePath();

    // hole at bottom of the handle
    const ringHole = new THREE.Path();
    ringHole.absellipse(0, -0.78, 0.042, 0.042, 0, Math.PI * 2, false, 0);
    shape.holes.push(ringHole);

    // top cutout
    const jawGap = new THREE.Path();
    jawGap.moveTo(-0.025, 0.52);
    jawGap.lineTo(0.118, 0.63);
    jawGap.lineTo(0.018, 0.445);
    jawGap.closePath();
    shape.holes.push(jawGap);

    return shape;
  }, []);

  // extruding to set the thickness and bevel settings fo the wrench
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
  );

  // animation loop that handles the wrench drop-in and horizontal spin when menu is open, uses dampening for smooth motion
  useFrame((_, delta) => {
    if (!wrenchRef.current) return;

    // y positions where the wrench starts and ends in the animation
    const targetY = isOpen ? 0.7 : 2.0;

    // once the wrench dreps, the wrench starts spinning
    const targetRotation = isOpen ? -0.78 : 0.4;
    // confirming if the wrench has dropped by comparing its current position with the target position.
    const hasDropped = Math.abs(wrenchRef.current.position.y - targetY) < 0.03;

    wrenchRef.current.position.y = THREE.MathUtils.damp(
      wrenchRef.current.position.y,
      targetY,
      7,
      delta,
    );

    wrenchRef.current.rotation.z = THREE.MathUtils.damp(
      wrenchRef.current.rotation.z,
      targetRotation,
      7,
      delta,
    );

    if (isOpen && hasDropped) {
      // Horizontal spin after drop-in completes.
      wrenchRef.current.rotation.y += delta * horizontalSpinSpeed;
    } else {
      // Reset spin when closed/opening.
      wrenchRef.current.rotation.y = THREE.MathUtils.damp(
        wrenchRef.current.rotation.y,
        0,
        8,
        delta,
      );
    }
  });

  return (
    <group ref={wrenchRef} position={[0, 1.0, 0]} rotation={[0, 0, 0.4]}>
      {/* Main wrench body */}
      <mesh position={[0, 0, -0.04]} castShadow receiveShadow>
        <extrudeGeometry args={[wrenchShape, extrudeOptions]} />
        <meshPhysicalMaterial
          {...metalMaterial}
          map={wrenchTexture}
          // double side is used to ensure that the texture is visible on both sides of the rotating wrench
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Worm screw detail */}
      <mesh position={[0.018, 0.495, 0.055]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.1, 20]} />
        <meshStandardMaterial
          color="#d8dde5"
          metalness={0.9}
          roughness={0.18}
        />
      </mesh>

      {/* Screw knob */}
      <mesh position={[0.075, 0.495, 0.055]}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshStandardMaterial color="#cfd5de" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function MobileWrenchAnimation({ isOpen }) {
  const [horizontalSpinSpeed, setHorizontalSpinSpeed] = useState(2.2);
  const DEBUG_SPIN_SPEED = import.meta.env.DEV;

  useEffect(() => {
    let isMounted = true;

    const loadSpinSpeed = async () => {
      if (!db) return;

      try {
        // retrieving rotation speed from firestore
        const primaryRef = doc(db, "rotationData", "horizontalRotationSpeed");
        const primarySnap = await getDoc(primaryRef);

        // if the rotation speed value is not found, we set a default value so that the animation keeps working
        let speed = NaN;
        if (primarySnap.exists()) {
          speed = Number(primarySnap.data()?.Speed);
        }

        // debugging logs to verify firestore rotation speed retrieval
        if (DEBUG_SPIN_SPEED) {
          console.log(
            "[MobileWrenchAnimation] primarySnap.exists:",
            primarySnap.exists(),
          );
          console.log(
            "[MobileWrenchAnimation] primarySnap.data:",
            primarySnap.data(),
          );
          console.log("[MobileWrenchAnimation] parsed speed:", speed);
        }

        if (!isMounted) return;

        if (Number.isFinite(speed) && speed >= 0) {
          if (DEBUG_SPIN_SPEED) {
            console.log(
              "[MobileWrenchAnimation] applying Firestore speed:",
              speed,
            );
          }
          setHorizontalSpinSpeed((prev) =>
            Math.abs(prev - speed) < 0.0001 ? prev : speed,
          );
        } else if (DEBUG_SPIN_SPEED) {
          console.warn(
            "[MobileWrenchAnimation] invalid Firestore speed, using default state:",
            horizontalSpinSpeed,
          );
        }
      } catch (error) {
        console.warn(
          "Failed to load mobile wrench spin speed from Firestore:",
          error,
        );
      }
    };

    loadSpinSpeed();

    return () => {
      isMounted = false;
    };
  }, []);

  const contextLossRetryRef = useRef(0);
  const [canvasVersion, setCanvasVersion] = useState(0);

  const handleCanvasCreated = useCallback((state) => {
    const { domElement } = state.gl;

    const onContextLost = (event) => {
      event.preventDefault();

      if (contextLossRetryRef.current >= 2) return;
      contextLossRetryRef.current += 1;

      // Force a fresh WebGL context without needing user to close/reopen menu.
      window.setTimeout(() => {
        setCanvasVersion((v) => v + 1);
      }, 80);
    };

    domElement.addEventListener("webglcontextlost", onContextLost, {
      passive: false,
    });
  }, []);

  return (
    <Canvas
      key={canvasVersion}
      camera={{ position: [0, 0, 3], fov: 40 }}
      onCreated={handleCanvasCreated}
      frameloop={isOpen ? "always" : "demand"}
      flat
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      dpr={[1, 1.25]}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={1.2} />
      <hemisphereLight intensity={1} color="#ffffff" groundColor="#666" />
      <directionalLight position={[2.4, 3, 2]} intensity={1.6} />
      <pointLight position={[-1.8, 1.4, 1.8]} intensity={1} />
      <Center>
        <Wrench isOpen={isOpen} horizontalSpinSpeed={horizontalSpinSpeed} />
      </Center>
    </Canvas>
  );
}

export default MobileWrenchAnimation;
