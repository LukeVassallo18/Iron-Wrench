import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import FrontRim from "./FrontRim";
import WebGLCameraRig from "./WebGLCameraRig";

export default function R6ModelScene({ scrollProgress }) {
  const { scene } = useGLTF("/R6.glb");
  const modelScale = 1.2;
  const [layout, setLayout] = useState({
    planeWidth: 20,
    planeDepth: 50,
    planeY: -0.01,
  });
  const planeThickness = 50;
  const additionalDrop = 0.22;
  const sceneFrameYOffset = -1.1;
  const frontRimScale = 2;
  const frontRimEndPosition = [2.34, 1, -0.04];
  const frontRimRotation = [0, 0, Math.PI / 2];
  const rimLightTarget = useMemo(() => new THREE.Object3D(), []);
  const zoomStart = 0.34;
  const zoomEnd = 0.72;

  useEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [scene]);

  const modelBounds = useMemo(() => {
    scene.updateWorldMatrix(true, true);

    const inverseRootMatrix = new THREE.Matrix4().copy(scene.matrixWorld).invert();
    const localBounds = new THREE.Box3();
    const meshBounds = new THREE.Box3();
    const relativeMatrix = new THREE.Matrix4();

    scene.traverse((object) => {
      if (!object.isMesh || !object.geometry) return;

      if (!object.geometry.boundingBox) {
        object.geometry.computeBoundingBox();
      }

      meshBounds.copy(object.geometry.boundingBox);
      relativeMatrix.multiplyMatrices(inverseRootMatrix, object.matrixWorld);
      meshBounds.applyMatrix4(relativeMatrix);
      localBounds.union(meshBounds);
    });

    return {
      center: localBounds.getCenter(new THREE.Vector3()),
      size: localBounds.getSize(new THREE.Vector3()),
    };
  }, [scene]);

  useEffect(() => {
    const size = modelBounds.size;
    const nextPlaneWidth = size.x * modelScale * 3;
    const nextPlaneDepth = Math.max(
      size.z * modelScale * 5,
      size.x * modelScale * 1.05,
    );
    const nextPlaneY = -(size.y * modelScale) / 2 - 0.01;

    setLayout((prev) => {
      if (
        Math.abs(prev.planeWidth - nextPlaneWidth) < 0.0001 &&
        Math.abs(prev.planeDepth - nextPlaneDepth) < 0.0001 &&
        Math.abs(prev.planeY - nextPlaneY) < 0.0001
      ) {
        return prev;
      }
      return {
        planeWidth: nextPlaneWidth,
        planeDepth: nextPlaneDepth,
        planeY: nextPlaneY,
      };
    });
  }, [modelBounds, modelScale]);

  const bikeYOffset =
    layout.planeY -
    (modelBounds.center.y - modelBounds.size.y / 2) * modelScale -
    additionalDrop;

  const rimTravelProgress = THREE.MathUtils.smootherstep(
    THREE.MathUtils.clamp(scrollProgress / 0.5, 0, 1),
    0,
    1,
  );
  const rimZoomProgress = THREE.MathUtils.smootherstep(
    scrollProgress,
    0.5,
    zoomEnd,
  );
  const frontRimStartX = frontRimEndPosition[0] + modelBounds.size.x * 1.35;
  const frontRimPosition = [
    THREE.MathUtils.lerp(frontRimStartX, frontRimEndPosition[0], rimTravelProgress),
    frontRimEndPosition[1],
    frontRimEndPosition[2],
  ];
  const rimHighlightIntensity = THREE.MathUtils.lerp(0.12, 2, rimZoomProgress);
  const rimLightDistance = 3;
  const rimLightPosition = [
    frontRimPosition[0],
    frontRimPosition[1],
    frontRimPosition[2] + rimLightDistance,
  ];
  const frontRimFocusPosition = [
    frontRimEndPosition[0],
    sceneFrameYOffset + bikeYOffset + frontRimEndPosition[1],
    frontRimEndPosition[2],
  ];
  const bikeTargetY = sceneFrameYOffset + bikeYOffset + 0.7;

  const frontRimSpin = rimTravelProgress * Math.PI * 6;

  const brakeDiscIntroStart = zoomEnd + 0.06;
  const brakeDiscIntroProgress = THREE.MathUtils.smootherstep(
    scrollProgress,
    brakeDiscIntroStart,
    1,
  );
  const brakeDiscOffsetX = THREE.MathUtils.lerp(2.4, 0, brakeDiscIntroProgress);

  return (
    <group position={[0, sceneFrameYOffset, 0]}>
      <WebGLCameraRig
        scrollProgress={scrollProgress}
        focusPosition={frontRimFocusPosition}
        baseTargetY={bikeTargetY}
        zoomStart={zoomStart}
        zoomEnd={zoomEnd}
      />

      <mesh position={[0, layout.planeY - planeThickness / 2, 0]} receiveShadow>
        <boxGeometry
          args={[layout.planeWidth, planeThickness, layout.planeDepth]}
        />
        <meshStandardMaterial color="#ffffff" roughness={0.95} metalness={0} />
      </mesh>

      <group position={[0, bikeYOffset, 0]}>
        <primitive object={rimLightTarget} position={frontRimPosition} />
        <directionalLight
          position={rimLightPosition}
          target={rimLightTarget}
          color="#f5f9ff"
          intensity={rimHighlightIntensity}
        />

        <primitive object={scene} scale={modelScale} />
        <FrontRim
          position={frontRimPosition}
          rotation={frontRimRotation}
          scale={frontRimScale}
          brakeDiscOffsetX={brakeDiscOffsetX}
          wheelSpin={frontRimSpin}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/R6.glb");
