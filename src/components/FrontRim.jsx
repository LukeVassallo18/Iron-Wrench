import { useMemo } from "react";
import * as THREE from "three";

export default function FrontRim({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 3.2,
  brakeDiscOffsetX = 0,
  wheelSpin = 0,
}) {
  // number of spokes for this stylized rim design.
  const spokeCount = 3;

  // core dimensions that control overall rim proportions.
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
  // this shifts the spoke tip sideways a bit so the spoke looks swept, not straight.
  const spokeCurve = 0.06;

  const brakeDiscOuterRadius = 0.22;
  const brakeDiscInnerRadius = 0.075;
  const brakeDiscThickness = 0.014;

  // memoized geometry args prevent recreating arrays on every render.
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
      // final thickness of each spoke after extruding the 2D spoke shape.
      depth: spokeDepth,
      // bevel is off so spokes keep sharp, machined edges.
      bevelEnabled: false,
      // more segments = smoother curves along rounded spoke edges.
      curveSegments: 24,
    }),
    [spokeDepth],
  );
  const brakeDiscExtrudeSettings = useMemo(
    () => ({
      // final thickness of the brake disc plate.
      depth: brakeDiscThickness,
      // bevel is off so disc holes stay crisp and technical.
      bevelEnabled: false,
      // high segment count keeps circular cutouts smooth.
      curveSegments: 48,
    }),
    [brakeDiscThickness],
  );

  // precompute spoke angles evenly around the wheel.
  const spokes = useMemo(() => {
    return Array.from({ length: spokeCount }, (_, i) => {
      return (i / spokeCount) * Math.PI * 2;
    });
  }, [spokeCount]);

  // this builds the 2D brake disc profile first, then we extrude it into 3D.
  const brakeDiscShape = useMemo(() => {
    const shape = new THREE.Shape();
    // outer circle of the disc.
    shape.absarc(0, 0, brakeDiscOuterRadius, 0, Math.PI * 2, false);

    // center cutout where the disc would mount around the hub area.
    const centerHole = new THREE.Path();
    centerHole.absarc(0, 0, brakeDiscInnerRadius, 0, Math.PI * 2, true);
    shape.holes.push(centerHole);

    // number of small ventilation holes around the disc ring.
    const holeCount = 12;
    // radius of each small ventilation hole.
    const holeRadius = 0.014;
    // distance of those holes from center (middle of inner and outer radii).
    const holeOrbitRadius = (brakeDiscOuterRadius + brakeDiscInnerRadius) * 0.5;

    // loop around 360° and place one hole per step for even spacing.
    for (let i = 0; i < holeCount; i += 1) {
      // angle for this hole based on its index.
      const a = (i / holeCount) * Math.PI * 2;
      // convert polar position to x/y so holes form a circular ring.
      const x = Math.cos(a) * holeOrbitRadius;
      const y = Math.sin(a) * holeOrbitRadius;
      const perforation = new THREE.Path();
      // each perforation is added as a hole cut into the disc shape.
      perforation.absarc(x, y, holeRadius, 0, Math.PI * 2, true);
      shape.holes.push(perforation);
    }

    return shape;
  }, [brakeDiscInnerRadius, brakeDiscOuterRadius]);

  // this draws one spoke as a 2D outline; extrusion turns it into a 3D spoke.
  const spokeShape = useMemo(() => {
    const shape = new THREE.Shape();

    // start at lower-left root of spoke near hub.
    shape.moveTo(-spokeRootWidth / 2, spokeInnerRadius);
    // first bezier makes left side taper from wide root to narrow curved tip.
    shape.bezierCurveTo(
      -spokeRootWidth / 2,
      spokeInnerRadius + spokeLength * 0.25,
      -spokeTipWidth / 2 + spokeCurve * 0.55,
      spokeInnerRadius + spokeLength * 0.75,
      -spokeTipWidth / 2 + spokeCurve,
      spokeOuterRadius,
    );
    // top edge across the tip from left side to right side.
    shape.lineTo(spokeTipWidth / 2 + spokeCurve, spokeOuterRadius);
    // second bezier returns back to the root to complete the right edge.
    shape.bezierCurveTo(
      spokeTipWidth / 2 + spokeCurve * 0.55,
      spokeInnerRadius + spokeLength * 0.75,
      spokeRootWidth / 2,
      spokeInnerRadius + spokeLength * 0.25,
      spokeRootWidth / 2,
      spokeInnerRadius,
    );
    // close the outline so extrusion creates a solid mesh.
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
    // top-level transform lets parent scene place and animate the whole rim.
    <group position={position} rotation={rotation} scale={scale}>
      {/* wheelSpin rotates tyre/rim/hub/spokes together as a single unit. */}
      <group rotation={[0, 0, wheelSpin]}>
        {/* tyre mesh is intentionally dark with very low reflectance. */}
        <mesh castShadow receiveShadow>
          <torusGeometry args={tyreArgs} />
          <meshStandardMaterial
            color="#050505"
            roughness={1}
            metalness={0}
            envMapIntensity={0.08}
          />
        </mesh>

        {/* rim barrel provides the metallic ring between tyre and hub. */}
        <mesh castShadow receiveShadow>
          <torusGeometry args={rimBarrelArgs} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.6}
            roughness={0.35}
          />
        </mesh>

        {/* central hub cylinder anchors spokes visually. */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={hubArgs} />
          <meshStandardMaterial color="#222" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* render each spoke by rotating one shared spoke profile around center. */}
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

      {/* separate brake disc can slide on x axis during intro animation. */}
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
