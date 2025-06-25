import { Button } from "@/components/ui/button";
import { Github, GraduationCap } from "lucide-react";
import { AboutDialog } from "../AboutDialog/AboutDialog";

export function Header() {
  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-auto sm:h-16 flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between px-4 py-4 sm:py-0 gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <img src="/TBGSim_White.svg" alt="TBG Sim Logo" className="h-8 w-8" />
          <h1 className="text-xl font-bold">Twisted Bilayer Simulation</h1>
        </div>
        <div className="flex items-center justify-between sm:justify-start flex-wrap gap-2 sm:gap-2 w-full sm:w-auto">
          <AboutDialog />
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1 sm:flex-none"
          >
            <a
              href="https://github.com/Jaluus/Twisted-Bilayer-Graphene-Simulation"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1 sm:flex-none"
          >
            <a
              href="https://www.pnas.org/doi/10.1073/pnas.2307151120"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              Model Paper
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
