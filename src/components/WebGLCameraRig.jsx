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
  const { camera } = useThree();

  useEffect(() => {
    const zoomProgress = THREE.MathUtils.smootherstep(
      scrollProgress,
      zoomStart,
      zoomEnd,
    );
    const target = new THREE.Vector3(
      THREE.MathUtils.lerp(0, focusPosition[0], zoomProgress),
      THREE.MathUtils.lerp(baseTargetY, focusPosition[1], zoomProgress),
      focusPosition[2],
    );

    camera.position.set(
      THREE.MathUtils.lerp(0, focusPosition[0], zoomProgress),
      THREE.MathUtils.lerp(1.6, focusPosition[1] + 0.1, zoomProgress),
      THREE.MathUtils.lerp(15, 5.7, zoomProgress),
    );
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  }, [baseTargetY, camera, focusPosition, scrollProgress, zoomEnd, zoomStart]);

  return null;
}
