import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoIcon } from "lucide-react";

export function AboutDialog() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1 sm:flex-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <InfoIcon className="h-4 w-4" />
              About
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About the Project</DialogTitle>
            <DialogDescription>
              A small project about the bandstructure of Twisted Bilayer
              Graphene.
            </DialogDescription>
          </DialogHeader>
          <p>
            Welcome to the Twisted Bilayer Graphene Simulation! This is a
            passion project that brings the fascinating world of condensed
            matter physics to your browser. Check out the GitHub repository for
            the source code and more details on how it works.
          </p>
          <p>
            The simulation uses a modified Bistritzer-MacDonald Hamiltonian from
            the paper{" "}
            <a
              href="https://www.pnas.org/doi/10.1073/pnas.2307151120"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Unusual magnetotransport in twisted bilayer graphene from
              strain-induced open Fermi surfaces
            </a>{" "}
            and lets you visualize real-time moiré patterns and band structures
            as you adjust twist angles and strain conditions.
          </p>
          <p>
            The code for setting up the Hamiltonian and calculating the
            eigenvalues is based on work by the authors of the paper.
          </p>

          <p className="text-sm text-muted-foreground">
            Built with{" "}
            <a
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              React 19
            </a>
            ,{" "}
            <a
              href="https://pixijs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              PixiJS
            </a>
            ,{" "}
            <a
              href="https://aws.amazon.com/lambda"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              AWS Lambda
            </a>
            , and lots of coffee by{" "}
            <a
              href="https://uslu.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Jan-Lucas Uslu
            </a>
          </p>
        </DialogContent>
      </form>
    </Dialog>
  );
}
