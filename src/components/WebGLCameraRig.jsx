import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

export default function WebGLCameraRig({
  scrollProgress,
  focusPosition,
  baseTargetY,
  zoomStart = 0.5,
  zoomEnd = 1,
}) {
  // grab the active r3f camera so we can drive it from scroll.
  const { camera } = useThree();

  useEffect(() => {
    // smooth zoom curve gives a softer camera transition than linear interpolation.
    const zoomProgress = THREE.MathUtils.smootherstep(
      scrollProgress,
      zoomStart,
      zoomEnd,
    );
    // target point gradually shifts from bike center to rim focus point.
    const target = new THREE.Vector3(
      THREE.MathUtils.lerp(0, focusPosition[0], zoomProgress),
      THREE.MathUtils.lerp(baseTargetY, focusPosition[1], zoomProgress),
      focusPosition[2],
    );

    // camera position is interpolated along x/y/z to create the cinematic zoom-in.
    camera.position.set(
      THREE.MathUtils.lerp(0, focusPosition[0], zoomProgress),
      THREE.MathUtils.lerp(1.6, focusPosition[1] + 0.1, zoomProgress),
      THREE.MathUtils.lerp(15, 5.7, zoomProgress),
    );
    // keep the lens locked on the moving target as zoom progresses.
    camera.lookAt(target);
    // projection update ensures camera parameter changes are applied immediately.
    camera.updateProjectionMatrix();
  }, [baseTargetY, camera, focusPosition, scrollProgress, zoomEnd, zoomStart]);

  // this helper component only controls camera state and renders no meshes.
  return null;
}
