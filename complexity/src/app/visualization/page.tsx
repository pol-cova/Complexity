"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye, RotateCcw } from "lucide-react";
import Link from "next/link";
// Dynamically import canvas components to prevent context sharing
const MainVisualization = dynamic(
  () =>
    import("@/components/main-visualization").then(
      (mod) => mod.MainVisualization
    ),
  { ssr: false }
);

const RiemannVisualization = dynamic(
  () =>
    import("@/components/riemann-visualization").then(
      (mod) => mod.RiemannVisualization
    ),
  { ssr: false }
);

export default function VisualizationPage() {
  const searchParams = useSearchParams();
  const fn = searchParams.get("fn") || "";
  const [is2D, setIs2D] = useState(false);
  const [showRiemann, setShowRiemann] = useState(false);

  const handleDownload = () => {
    // Implement download functionality
    console.log("Downloading visualization...");
  };

  const handleRiemannToggle = useCallback((open: boolean) => {
    setShowRiemann(open);
  }, []);

  return (
    <main className="relative h-screen w-full bg-black">
      {/* Main 3D Visualization */}
      <div className="h-full w-full">
        <MainVisualization function={fn} is2D={is2D} />
      </div>

      {/* Controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIs2D(!is2D)}
          className="h-10 w-10"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleDownload}
          className="h-10 w-10"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Link
          href="/"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <RotateCcw className="h-4 w-4" />
        </Link>
      </div>

      {/* Riemann Surface Button */}
      <Button
        className="absolute bottom-4 right-4"
        onClick={() => handleRiemannToggle(true)}
      >
        View Riemann Surface
      </Button>

      {/* Riemann Surface Modal */}
      <Dialog open={showRiemann} onOpenChange={handleRiemannToggle}>
        <DialogContent className="h-[80vh] w-[80vw] max-w-none">
          <DialogTitle className="sr-only">
            Riemann Surface Visualization
          </DialogTitle>
          {showRiemann && (
            <div className="h-full w-full">
              <RiemannVisualization function={fn} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
