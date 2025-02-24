"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import ComplexPlot from "./complex-plot";

interface PlotRange {
  reMin: number;
  reMax: number;
  imMin: number;
  imMax: number;
}

interface MainVisualizationProps {
  function: string;
  is2D: boolean;
  plotRange?: PlotRange;
}

export function MainVisualization({
  function: fn,
  is2D,
  plotRange = { reMin: -5, reMax: 5, imMin: -5, imMax: 5 },
}: MainVisualizationProps) {
  return (
    <Canvas key="main-canvas">
      <PerspectiveCamera makeDefault position={[8, 8, 8]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <ComplexPlot function={fn} is2D={is2D} plotRange={plotRange} />
      <OrbitControls />
    </Canvas>
  );
}
