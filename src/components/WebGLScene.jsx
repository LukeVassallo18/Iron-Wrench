import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import R6ModelScene from "./R6ModelScene";

export default function WebGLScene() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafRef = useRef(0);
  const lastProgressRef = useRef(0);

  useEffect(() => {
    const computeProgress = () => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );

      return THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
    };

    const updateScrollProgress = () => {
      if (rafRef.current) return;

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = 0;
        const nextProgress = computeProgress();

        if (Math.abs(nextProgress - lastProgressRef.current) < 0.001) {
          return;
        }

        lastProgressRef.current = nextProgress;
        setScrollProgress(nextProgress);
      });
    };

    const initialProgress = computeProgress();
    lastProgressRef.current = initialProgress;
    setScrollProgress(initialProgress);
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 1.6, 15], fov: 38 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      shadows
    >
      <directionalLight
        position={[4.5, 6.5, 3.5]}
        intensity={1.55}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00008}
        shadow-normalBias={0.025}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[-3, 2.5, 1.5]} intensity={0.16} />

      <Suspense fallback={null}>
        <R6ModelScene scrollProgress={scrollProgress} />
      </Suspense>
    </Canvas>
  );
}
