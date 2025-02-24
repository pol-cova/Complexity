"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MatrixRain from "@/components/matrix-rain";
import { motion } from "framer-motion";
import { Beaker } from "lucide-react";

export default function Home() {
  const [function3d, setFunction3d] = useState("");
  const router = useRouter();

  const handleVisualize = (mode: "normal" | "experimental") => {
    if (function3d) {
      const path = mode === "normal" ? "/visualization" : "/experimental";
      router.push(`${path}?fn=${encodeURIComponent(function3d)}`);
    }
  };

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <MatrixRain />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8 text-6xl font-bold tracking-tighter text-primary"
        >
          Complexity
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-md space-y-4 p-4"
        >
          <Input
            type="text"
            placeholder="Enter complex function (e.g., z^2 + 1)"
            value={function3d}
            onChange={(e) => setFunction3d(e.target.value)}
            className="h-12 bg-background/10 text-lg backdrop-blur-sm"
          />
          <div className="flex gap-4">
            <Button
              onClick={() => handleVisualize("normal")}
              className="flex-1 h-12 text-lg font-semibold"
              disabled={!function3d}
            >
              Open Visualization
            </Button>
            <Button
              onClick={() => handleVisualize("experimental")}
              className="flex-1 h-12 text-lg font-semibold"
              variant="secondary"
              disabled={!function3d}
            >
              <Beaker className="mr-2 h-5 w-5" />
              Experimental Mode
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
