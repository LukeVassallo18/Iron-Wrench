import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import R6ModelScene from "./R6ModelScene";

export default function WebGLScene() {
  // normalized scroll value (0..1) that drives camera and rim animations.
  const [scrollProgress, setScrollProgress] = useState(0);
  // compact viewport flag is used to reduce WebGL cost on smaller screens.
  const [isCompactViewport, setIsCompactViewport] = useState(
    () => window.innerWidth <= 880,
  );
  // raf id prevents scheduling multiple scroll updates in the same frame.
  const rafRef = useRef(0);
  // store previous progress so tiny scroll jitter does not trigger state updates.
  const lastProgressRef = useRef(0);

  useEffect(() => {
    // compute page scroll progress in a safe way even on short pages.
    const computeProgress = () => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );

      return THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
    };

    // throttle scroll handler to requestAnimationFrame for smoother updates.
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

    // re-evaluate compact mode whenever viewport width changes.
    const updateViewportClass = () => {
      setIsCompactViewport(window.innerWidth <= 880);
    };

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);
    window.addEventListener("resize", updateViewportClass);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
      window.removeEventListener("resize", updateViewportClass);
    };
  }, []);

  // lower dpr and shadows on compact mode to keep frame times stable.
  const canvasDpr = isCompactViewport ? [1, 1.2] : [1, 2];
  const shadowMapSize = isCompactViewport ? 1024 : 2048;

  return (
    // root canvas for the hero bike scene.
    <Canvas
      camera={{ position: [0, 1.6, 15], fov: 38 }}
      gl={{
        alpha: true,
        antialias: !isCompactViewport,
        powerPreference: isCompactViewport ? "low-power" : "high-performance",
      }}
      dpr={canvasDpr}
      shadows
    >
      {/* key light with shadows to define bike shape and depth. */}
      <directionalLight
        position={[4.5, 6.5, 3.5]}
        intensity={1.55}
        castShadow
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-bias={-0.00008}
        shadow-normalBias={0.025}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      {/* subtle fill light to soften dark areas on the opposite side. */}
      <directionalLight position={[-3, 2.5, 1.5]} intensity={0.16} />

      {/* lazy-load heavy scene assets so initial app render stays responsive. */}
      <Suspense fallback={null}>
        <R6ModelScene scrollProgress={scrollProgress} />
      </Suspense>
    </Canvas>
  );
}
