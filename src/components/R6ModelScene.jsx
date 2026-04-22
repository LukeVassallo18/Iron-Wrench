import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import FrontRim from "./FrontRim";
import WebGLCameraRig from "./WebGLCameraRig";

export default function R6ModelScene({ scrollProgress }) {
  // Load the motorcycle model once and reuse it.
  const { scene } = useGLTF("/R6.glb");

  // Base visual tuning values for model and scene composition.
  const modelScale = 1.2;
  const [layout, setLayout] = useState({
    planeWidth: 20,
    planeDepth: 50,
    planeY: -0.01,
  });
  const planeThickness = 50;
  const additionalDrop = 0.22;
  const sceneFrameYOffset = -1.1;

  // Front wheel presentation settings.
  const frontRimScale = 2;
  const frontRimEndPosition = [2.34, 1, -0.04];
  const frontRimRotation = [0, 0, Math.PI / 2];

  // Invisible target object used by the rim spotlight for stable aiming.
  const rimLightTarget = useMemo(() => new THREE.Object3D(), []);

  // Scroll range where camera zoom behavior starts/ends.
  const zoomStart = 0.34;
  const zoomEnd = 0.72;

  useEffect(() => {
    // Ensure all meshes interact with lighting and shadows.
    scene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [scene]);

  // model bounds are used to keep ground sizing and offsets consistent for any model scale.
  // useMemo keeps this expensive bounding box work from rerunning unnecessarily.
  const modelBounds = useMemo(() => {
    // Compute model bounds in local/root space so layout math is predictable.
    scene.updateWorldMatrix(true, true);

    const inverseRootMatrix = new THREE.Matrix4()
      .copy(scene.matrixWorld)
      .invert();
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
      // Keep center + size for positioning the bike and building the floor.
      center: localBounds.getCenter(new THREE.Vector3()),
      size: localBounds.getSize(new THREE.Vector3()),
    };
  }, [scene]);

  useEffect(() => {
    // Resize floor plane based on model size so the bike is always grounded.
    const size = modelBounds.size;
    const nextPlaneWidth = size.x * modelScale * 3;
    const nextPlaneDepth = Math.max(
      size.z * modelScale * 5,
      size.x * modelScale * 1.05,
    );
    const nextPlaneY = -(size.y * modelScale) / 2 - 0.01;

    setLayout((prev) => {
      // Skip state updates when values are effectively unchanged.
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

  // Vertical offset that places the bike tires correctly on the floor.
  const bikeYOffset =
    layout.planeY -
    (modelBounds.center.y - modelBounds.size.y / 2) * modelScale -
    additionalDrop;

  // Rim enters from the side during early scroll.
  const rimTravelProgress = THREE.MathUtils.smootherstep(
    THREE.MathUtils.clamp(scrollProgress / 0.5, 0, 1),
    0,
    1,
  );
  // Rim highlight ramps up as camera zooms in.
  const rimZoomProgress = THREE.MathUtils.smootherstep(
    scrollProgress,
    0.5,
    zoomEnd,
  );
  // starting x sits off-screen and lerps into final x as scroll progresses.
  const frontRimStartX = frontRimEndPosition[0] + modelBounds.size.x * 1.35;
  const frontRimPosition = [
    THREE.MathUtils.lerp(
      frontRimStartX,
      frontRimEndPosition[0],
      rimTravelProgress,
    ),
    frontRimEndPosition[1],
    frontRimEndPosition[2],
  ];

  // Directional light that tracks the rim to emphasize details.
  const rimHighlightIntensity = THREE.MathUtils.lerp(0.12, 2, rimZoomProgress);
  const rimLightDistance = 3;
  const rimLightPosition = [
    frontRimPosition[0],
    frontRimPosition[1],
    frontRimPosition[2] + rimLightDistance,
  ];
  // this is the point the camera rig should focus on during close-up.
  const frontRimFocusPosition = [
    frontRimEndPosition[0],
    sceneFrameYOffset + bikeYOffset + frontRimEndPosition[1],
    frontRimEndPosition[2],
  ];
  // base camera target keeps framing centered before zoom takes over.
  const bikeTargetY = sceneFrameYOffset + bikeYOffset + 0.7;

  // Wheel spin while it travels into view.
  const frontRimSpin = rimTravelProgress * Math.PI * 6;

  // Late-scroll animation: brake disc slides into place.
  const brakeDiscIntroStart = zoomEnd + 0.06;
  const brakeDiscIntroProgress = THREE.MathUtils.smootherstep(
    scrollProgress,
    brakeDiscIntroStart,
    1,
  );
  // brake disc starts offset and slides into final alignment near end of scroll.
  const brakeDiscOffsetX = THREE.MathUtils.lerp(2.4, 0, brakeDiscIntroProgress);

  return (
    // Scene frame offset keeps all objects composed correctly in camera view.
    <group position={[0, sceneFrameYOffset, 0]}>
      <WebGLCameraRig
        scrollProgress={scrollProgress}
        focusPosition={frontRimFocusPosition}
        baseTargetY={bikeTargetY}
        zoomStart={zoomStart}
        zoomEnd={zoomEnd}
      />

      {/* Large white box acts as a floor/background stage under the bike. */}
      <mesh position={[0, layout.planeY - planeThickness / 2, 0]} receiveShadow>
        <boxGeometry
          args={[layout.planeWidth, planeThickness, layout.planeDepth]}
        />
        <meshStandardMaterial color="#ffffff" roughness={0.95} metalness={0} />
      </mesh>

      {/* Bike and animated rim live in one translated group for easy alignment. */}
      <group position={[0, bikeYOffset, 0]}>
        <primitive object={rimLightTarget} position={frontRimPosition} />
        <directionalLight
          position={rimLightPosition}
          target={rimLightTarget}
          color="#f5f9ff"
          intensity={rimHighlightIntensity}
        />

        {/* Main motorcycle model. */}
        <primitive object={scene} scale={modelScale} />
        {/* Separate front rim component with travel, spin, and brake-disc animation. */}
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
