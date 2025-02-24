"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useMemo } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  DoubleSide,
  Color,
} from "three";
// import { useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { evaluate, parse, complex, abs, arg } from "mathjs";

interface PlotRange {
  reMin: number;
  reMax: number;
  imMin: number;
  imMax: number;
}

interface ComplexPlotProps {
  is2D: boolean;
  function?: string;
  plotRange?: PlotRange;
}

const defaultPlotRange: PlotRange = {
  reMin: -2,
  reMax: 2,
  imMin: -2,
  imMax: 2,
};

// Helper function to normalize value with dynamic range
const normalizeValue = (value: number, maxValue: number) => {
  const logValue = Math.log1p(Math.abs(value));
  const logMax = Math.log1p(maxValue);
  return (logValue / logMax) * Math.sign(value);
};

// Helper function to get domain coloring
const getDomainColor = (w: any, maxModulus: number) => {
  try {
    const modulus = abs(w);
    const argument = arg(w);

    // Map argument to [0, 1] for hue
    const hue = (argument + Math.PI) / (2 * Math.PI);

    // Normalize modulus using log scale with dynamic range
    const normalizedMod = Math.log1p(modulus) / Math.log1p(maxModulus);

    // Adjust these values for better color visualization
    const saturation = 0.85;
    const lightness = 0.4 + 0.3 * normalizedMod;

    return new Color().setHSL(hue, saturation, lightness);
  } catch (_error) {
    return new Color(0, 0, 0);
  }
};

export default function ComplexPlot({
  is2D,
  function: fnProp,
  plotRange = defaultPlotRange,
}: ComplexPlotProps) {
  // const { scene, gl } = useThree();

  const { resolution } = useControls({
    resolution: { value: 150, min: 50, max: 300, step: 10 },
  });

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const reRange = plotRange.reMax - plotRange.reMin;
    const imRange = plotRange.imMax - plotRange.imMin;
    const reStep = reRange / resolution;
    const imStep = imRange / resolution;

    let parsedFn;
    try {
      // Replace 'z^2' with 'pow(z,2)' for mathjs compatibility
      const normalizedFn = (fnProp || "z")
        .replace(/\^/g, ",")
        .replace(/([0-9a-zA-Z]),(-?\d*\.?\d+)/g, "pow($1,$2)");
      parsedFn = parse(normalizedFn);
    } catch (_error) {
      console.error("Invalid function:");
      return geo;
    }

    // First pass to find maximum modulus for normalization
    let maxModulus = 0;
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = plotRange.reMin + i * reStep;
        const y = plotRange.imMin + j * imStep;
        const z = complex(x, y);

        try {
          const w = evaluate(parsedFn.toString(), { z });
          const modulus = abs(w);
          maxModulus = Math.max(maxModulus, modulus);
        } catch (_error) {
          // Skip error points
        }
      }
    }

    // Scale factor for height in 3D mode
    const heightScale = 1.5;

    // Second pass to generate geometry
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = plotRange.reMin + i * reStep;
        const y = plotRange.imMin + j * imStep;
        const z = complex(x, y);

        try {
          const w = evaluate(parsedFn.toString(), { z });
          const modulus = abs(w);

          // Normalize height for 3D visualization
          const height = is2D
            ? 0
            : normalizeValue(modulus, maxModulus) * heightScale;
          vertices.push(x, y, height);

          // Apply domain coloring
          const color = getDomainColor(w, maxModulus);
          colors.push(color.r, color.g, color.b);
        } catch (_error) {
          // Handle singularities by interpolating neighboring points
          vertices.push(x, y, 0);
          colors.push(0, 0, 0);
        }

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

    geo.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }, [is2D, plotRange, resolution, fnProp]);

  return (
    <mesh>
      <primitive object={geometry} />
      <meshStandardMaterial
        vertexColors
        side={DoubleSide}
        metalness={0.2}
        roughness={0.8}
      />
    </mesh>
  );
}
