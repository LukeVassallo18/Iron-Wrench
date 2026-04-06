import { useMemo } from "react";
import * as THREE from "three";

export default function FrontRim({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 3.2,
  brakeDiscOffsetX = 0,
  wheelSpin = 0,
}) {
  const spokeCount = 3;

  // --- DIMENSIONS ---
  const rimRadius = 0.36;
  const rimThickness = 0.045;

  const hubRadius = 0.1;
  const hubWidth = 0.13;

  const spokeDepth = 0.035;

  const spokeInnerRadius = hubRadius + 0.015;
  const spokeOuterRadius = rimRadius - 0.01;
  const spokeLength = spokeOuterRadius - spokeInnerRadius;
  const spokeRootWidth = 0.07;
  const spokeTipWidth = 0.045;
  const spokeCurve = 0.06;

  const brakeDiscOuterRadius = 0.22;
  const brakeDiscInnerRadius = 0.075;
  const brakeDiscThickness = 0.014;

  const tyreArgs = useMemo(() => [0.41, 0.05, 32, 160], []);
  const rimBarrelArgs = useMemo(
    () => [rimRadius, rimThickness, 32, 140],
    [rimRadius, rimThickness],
  );
  const hubArgs = useMemo(
    () => [hubRadius, hubRadius, hubWidth, 40],
    [hubRadius, hubWidth],
  );
  const spokeExtrudeSettings = useMemo(
    () => ({
      depth: spokeDepth,
      bevelEnabled: false,
      curveSegments: 24,
    }),
    [spokeDepth],
  );
  const brakeDiscExtrudeSettings = useMemo(
    () => ({
      depth: brakeDiscThickness,
      bevelEnabled: false,
      curveSegments: 48,
    }),
    [brakeDiscThickness],
  );

  // --- SPOKE ANGLES ---
  const spokes = useMemo(() => {
    return Array.from({ length: spokeCount }, (_, i) => {
      return (i / spokeCount) * Math.PI * 2;
    });
  }, [spokeCount]);

  const brakeDiscShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, brakeDiscOuterRadius, 0, Math.PI * 2, false);

    const centerHole = new THREE.Path();
    centerHole.absarc(0, 0, brakeDiscInnerRadius, 0, Math.PI * 2, true);
    shape.holes.push(centerHole);

    const holeCount = 12;
    const holeRadius = 0.014;
    const holeOrbitRadius = (brakeDiscOuterRadius + brakeDiscInnerRadius) * 0.5;

    for (let i = 0; i < holeCount; i += 1) {
      const a = (i / holeCount) * Math.PI * 2;
      const x = Math.cos(a) * holeOrbitRadius;
      const y = Math.sin(a) * holeOrbitRadius;
      const perforation = new THREE.Path();
      perforation.absarc(x, y, holeRadius, 0, Math.PI * 2, true);
      shape.holes.push(perforation);
    }

    return shape;
  }, [brakeDiscInnerRadius, brakeDiscOuterRadius]);

  const spokeShape = useMemo(() => {
    const shape = new THREE.Shape();

    shape.moveTo(-spokeRootWidth / 2, spokeInnerRadius);
    shape.bezierCurveTo(
      -spokeRootWidth / 2,
      spokeInnerRadius + spokeLength * 0.25,
      -spokeTipWidth / 2 + spokeCurve * 0.55,
      spokeInnerRadius + spokeLength * 0.75,
      -spokeTipWidth / 2 + spokeCurve,
      spokeOuterRadius,
    );
    shape.lineTo(spokeTipWidth / 2 + spokeCurve, spokeOuterRadius);
    shape.bezierCurveTo(
      spokeTipWidth / 2 + spokeCurve * 0.55,
      spokeInnerRadius + spokeLength * 0.75,
      spokeRootWidth / 2,
      spokeInnerRadius + spokeLength * 0.25,
      spokeRootWidth / 2,
      spokeInnerRadius,
    );
    shape.closePath();

    return shape;
  }, [
    spokeCurve,
    spokeInnerRadius,
    spokeLength,
    spokeOuterRadius,
    spokeRootWidth,
    spokeTipWidth,
  ]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group rotation={[0, 0, wheelSpin]}>
        {/* 🛞 TYRE */}
        <mesh castShadow receiveShadow>
          <torusGeometry args={tyreArgs} />
          <meshStandardMaterial
            color="#050505"
            roughness={1}
            metalness={0}
            envMapIntensity={0.08}
          />
        </mesh>

        {/* 🛞 RIM BARREL */}
        <mesh castShadow receiveShadow>
          <torusGeometry args={rimBarrelArgs} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.6}
            roughness={0.35}
          />
        </mesh>

        {/* ⚙️ HUB */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={hubArgs} />
          <meshStandardMaterial color="#222" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* 🧩 SPOKES (CORRECT: 3 ONLY) */}
        {spokes.map((angle, i) => (
          <group key={i} rotation={[0, 0, angle]}>
            <mesh position={[0, 0, -spokeDepth / 2]} castShadow receiveShadow>
              <extrudeGeometry args={[spokeShape, spokeExtrudeSettings]} />
              <meshStandardMaterial
                color="#0f0f0f"
                metalness={0.65}
                roughness={0.3}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* 🔩 OPTIONAL: BRAKE DISC (nice extra for marks) */}
      <mesh
        position={[brakeDiscOffsetX, 0, 0.02 - brakeDiscThickness / 2]}
        castShadow
        receiveShadow
      >
        <extrudeGeometry args={[brakeDiscShape, brakeDiscExtrudeSettings]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  );
}
