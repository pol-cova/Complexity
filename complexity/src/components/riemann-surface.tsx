"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useMemo } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  DoubleSide,
  Color,
  Vector3,
} from "three";
import { Text, Grid } from "@react-three/drei";
import { useControls } from "leva";
import { evaluate, parse, complex, arg } from "mathjs";

interface RiemannSurfaceProps {
  function: string;
}

// Helper function for domain coloring
const getDomainColor = (height: number, maxHeight: number) => {
  // Map height to color - one full color cycle per sheet
  const hue = (((height / maxHeight) % 1) + 1) % 1;
  return new Color().setHSL(hue, 0.85, 0.5);
};

export default function RiemannSurface({ function: fn }: RiemannSurfaceProps) {
  const { sheets, resolution, radius } = useControls({
    sheets: { value: 4, min: 1, max: 6, step: 1 },
    resolution: { value: 150, min: 50, max: 300, step: 10 },
    radius: { value: 3, min: 1, max: 5, step: 0.5 },
  });

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    // Initialize gridPoints with proper typing and empty arrays
    const gridPoints: Vector3[][] = Array.from({ length: resolution + 1 }, () =>
      Array.from({ length: resolution + 1 }, () => new Vector3())
    );

    let parsedFn;
    try {
      const normalizedFn = (fn || "z")
        .replace(/\^/g, ",")
        .replace(/([0-9a-zA-Z]),(-?\d*\.?\d+)/g, "pow($1,$2)");
      parsedFn = parse(normalizedFn);
    } catch (error) {
      console.error("Invalid function:", error);
      return geo;
    }

    // Parameters for the surface
    const rMin = 0.01; // Avoid r=0 singularity
    const rMax = radius;
    const thetaRange = 2 * Math.PI * sheets;

    const rStep = (rMax - rMin) / resolution;
    const thetaStep = thetaRange / resolution;

    // Generate surface
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const r = rMin + j * rStep;
        const theta = i * thetaStep;

        try {
          // Compute point on Riemann surface
          const z = complex({ r, phi: theta });
          const w = evaluate(parsedFn.toString(), { z });

          // Calculate position
          const x = r * Math.cos(theta);
          const z_coord = r * Math.sin(theta);

          // Use argument for height, scaled by number of sheets
          // Add vertical separation between sheets
          const sheetHeight = (arg(w) + Math.PI) / (2 * Math.PI);
          const sheetNumber = Math.floor(theta / (2 * Math.PI));
          const height = sheetHeight + sheetNumber * 1.2; // 1.2 is the vertical separation

          vertices.push(x, height, z_coord);

          // Store point for grid lines
          gridPoints[i][j].set(x, height, z_coord);

          // Color based on height within current sheet
          const color = getDomainColor(sheetHeight, 1);
          colors.push(color.r, color.g, color.b);
        } catch (_error) {
          const x = r * Math.cos(theta);
          const z_coord = r * Math.sin(theta);
          const sheetNumber = Math.floor(theta / (2 * Math.PI));
          const height = sheetNumber * 1.2;

          vertices.push(x, height, z_coord);
          gridPoints[i][j].set(x, height, z_coord);
          colors.push(0, 0, 0);
        }

        // Create faces
        if (i < resolution && j < resolution) {
          const a = i * (resolution + 1) + j;
          const b = a + 1;
          const c = a + (resolution + 1);
          const d = c + 1;

          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
    }

    // Add grid lines with safety checks
    try {
      const gridLineWidth = 0.02;
      const gridDensity = 20; // Increase for more grid lines

      // Add circular grid lines
      for (let i = 0; i <= resolution; i += resolution / gridDensity) {
        for (let j = 0; j < resolution; j++) {
          const p1 = gridPoints[i]?.[j];
          const p2 = gridPoints[i]?.[j + 1];

          if (p1 && p2) {
            const direction = new Vector3().subVectors(p2, p1).normalize();
            const perpendicular = new Vector3(
              -direction.z,
              0,
              direction.x
            ).multiplyScalar(gridLineWidth);

            const v1 = new Vector3().addVectors(p1, perpendicular);
            const v2 = new Vector3().subVectors(p1, perpendicular);
            const v3 = new Vector3().addVectors(p2, perpendicular);
            const v4 = new Vector3().subVectors(p2, perpendicular);

            vertices.push(
              v1.x,
              v1.y,
              v1.z,
              v2.x,
              v2.y,
              v2.z,
              v3.x,
              v3.y,
              v3.z,
              v4.x,
              v4.y,
              v4.z
            );

            for (let k = 0; k < 4; k++) {
              colors.push(0.2, 0.2, 0.2);
            }

            const baseIndex = vertices.length / 3 - 4;
            indices.push(
              baseIndex,
              baseIndex + 1,
              baseIndex + 2,
              baseIndex + 1,
              baseIndex + 3,
              baseIndex + 2
            );
          }
        }
      }

      // Add radial grid lines
      for (let j = 0; j <= resolution; j += resolution / gridDensity) {
        for (let i = 0; i < resolution; i++) {
          const p1 = gridPoints[i]?.[j];
          const p2 = gridPoints[i + 1]?.[j];

          if (p1 && p2) {
            const direction = new Vector3().subVectors(p2, p1).normalize();
            const perpendicular = new Vector3(
              -direction.z,
              0,
              direction.x
            ).multiplyScalar(gridLineWidth);

            const v1 = new Vector3().addVectors(p1, perpendicular);
            const v2 = new Vector3().subVectors(p1, perpendicular);
            const v3 = new Vector3().addVectors(p2, perpendicular);
            const v4 = new Vector3().subVectors(p2, perpendicular);

            vertices.push(
              v1.x,
              v1.y,
              v1.z,
              v2.x,
              v2.y,
              v2.z,
              v3.x,
              v3.y,
              v3.z,
              v4.x,
              v4.y,
              v4.z
            );

            for (let k = 0; k < 4; k++) {
              colors.push(0.2, 0.2, 0.2);
            }

            const baseIndex = vertices.length / 3 - 4;
            indices.push(
              baseIndex,
              baseIndex + 1,
              baseIndex + 2,
              baseIndex + 1,
              baseIndex + 3,
              baseIndex + 2
            );
          }
        }
      }
    } catch (error) {
      console.error("Error generating grid lines:", error);
    }

    geo.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }, [sheets, resolution, radius, fn]);

  return (
    <>
      {/* Riemann Surface */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <primitive object={geometry} />
        <meshStandardMaterial
          vertexColors
          side={DoubleSide}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Grid for reference */}
      <Grid
        position={[0, -1, 0]}
        rotation={[0, 0, 0]}
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#6f6f6f"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9d4b4b"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />

      {/* Axes Labels */}
      <Text position={[2, -1, 0]} fontSize={0.2} color="white">
        Re(w)
      </Text>
      <Text position={[0, 1, 0]} fontSize={0.2} color="white">
        arg(w)
      </Text>
      <Text position={[0, -1, 2]} fontSize={0.2} color="white">
        Im(w)
      </Text>
    </>
  );
}
