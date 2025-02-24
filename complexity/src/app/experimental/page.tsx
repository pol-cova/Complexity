"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, Eye, RefreshCw, ArrowRight } from "lucide-react";

// Dynamically import canvas components
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

interface PlotRange {
  reMin: number;
  reMax: number;
  imMin: number;
  imMax: number;
}

export default function ExperimentalPage() {
  const searchParams = useSearchParams();
  const [fn, setFn] = useState(searchParams.get("fn") || "");
  const [is2D, setIs2D] = useState(false);
  const [showRiemann, setShowRiemann] = useState(false);
  const [plotRange, setPlotRange] = useState<PlotRange>({
    reMin: -5,
    reMax: 5,
    imMin: -5,
    imMax: 5,
  });

  const handleRiemannToggle = useCallback((open: boolean) => {
    setShowRiemann(open);
  }, []);

  const handleRangeChange = (key: keyof PlotRange, value: number) => {
    setPlotRange((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setPlotRange({
      reMin: -5,
      reMax: 5,
      imMin: -5,
      imMax: 5,
    });
  };

  const handleDownload = () => {
    // Placeholder for download functionality
    console.log("Download functionality not implemented yet.");
  };

  return (
    <main className="relative min-h-screen w-full bg-black p-4">
      <div className="flex gap-4 h-[calc(100vh-2rem)]">
        {/* Controls Panel */}
        <Card className="w-96 bg-background/10 backdrop-blur-sm text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">
              Plot Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Function Input */}
            <div className="space-y-2">
              <Label htmlFor="function">Complex Function</Label>
              <div className="flex gap-2">
                <Input
                  id="function"
                  value={fn}
                  onChange={(e) => setFn(e.target.value)}
                  placeholder="e.g., z^2 + 1"
                  className="bg-background/20"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                  className="shrink-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator className="bg-primary/20" />

            {/* Real Axis Controls */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">Real Axis Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Minimum
                  </Label>
                  <Slider
                    min={-10}
                    max={plotRange.reMax - 0.5}
                    step={0.5}
                    value={[plotRange.reMin]}
                    onValueChange={([value]) =>
                      handleRangeChange("reMin", value)
                    }
                    className="py-4"
                  />
                  <div className="text-sm font-mono text-right">
                    {plotRange.reMin}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Maximum
                  </Label>
                  <Slider
                    min={plotRange.reMin + 0.5}
                    max={10}
                    step={0.5}
                    value={[plotRange.reMax]}
                    onValueChange={([value]) =>
                      handleRangeChange("reMax", value)
                    }
                    className="py-4"
                  />
                  <div className="text-sm font-mono text-right">
                    {plotRange.reMax}
                  </div>
                </div>
              </div>
            </div>

            {/* Imaginary Axis Controls */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">
                Imaginary Axis Range
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Minimum
                  </Label>
                  <Slider
                    min={-10}
                    max={plotRange.imMax - 0.5}
                    step={0.5}
                    value={[plotRange.imMin]}
                    onValueChange={([value]) =>
                      handleRangeChange("imMin", value)
                    }
                    className="py-4"
                  />
                  <div className="text-sm font-mono text-right">
                    {plotRange.imMin}i
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Maximum
                  </Label>
                  <Slider
                    min={plotRange.imMin + 0.5}
                    max={10}
                    step={0.5}
                    value={[plotRange.imMax]}
                    onValueChange={([value]) =>
                      handleRangeChange("imMax", value)
                    }
                    className="py-4"
                  />
                  <div className="text-sm font-mono text-right">
                    {plotRange.imMax}i
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-primary/20" />

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIs2D(!is2D)}
                className="h-10 w-10"
                title={is2D ? "Switch to 3D" : "Switch to 2D"}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                className="h-10 w-10"
                title="Download Plot"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                onClick={() => handleRiemannToggle(true)}
                className="col-span-3"
              >
                View Riemann Surface
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Visualization */}
        <div className="flex-1 bg-background/5 rounded-lg overflow-hidden">
          <MainVisualization function={fn} is2D={is2D} plotRange={plotRange} />
        </div>
      </div>

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
