"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import RiemannSurface from "./riemann-surface";

interface RiemannVisualizationProps {
  function: string;
}

export function RiemannVisualization({
  function: fn,
}: RiemannVisualizationProps) {
  return (
    <Canvas key="riemann-canvas">
      <PerspectiveCamera makeDefault position={[3, 3, 3]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <RiemannSurface function={fn} />
      <OrbitControls />
    </Canvas>
  );
}
