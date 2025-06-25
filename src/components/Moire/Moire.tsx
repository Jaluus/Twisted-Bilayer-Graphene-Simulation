"use client";
import { useAppSelector, useSyncRef, useSyncRefWithState } from "@/lib/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Application, Graphics, Container, Matrix, Text } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import {
  selectBiaxialStrain,
  selectSpacing,
  selectTwistAngle,
  selectUniaxialStrain,
  selectUniaxialStrainAngle,
} from "@/app/slices/moireSlice";

const drawHexagon = (
  twistAngle: number,
  spacing: number,
  dotRadius: number,
  hexagonRadius: number,
  containerRef: React.RefObject<Container | null>
) => {
  if (!containerRef.current) return [];

  const vector1 = {
    x: spacing * Math.cos(twistAngle * (Math.PI / 180)),
    y: spacing * Math.sin(twistAngle * (Math.PI / 180)),
  };
  const vector2 = {
    x: spacing * Math.cos((twistAngle + 60) * (Math.PI / 180)),
    y: spacing * Math.sin((twistAngle + 60) * (Math.PI / 180)),
  };
  const vector3 = {
    x: spacing * Math.cos((twistAngle - 60) * (Math.PI / 180)),
    y: spacing * Math.sin((twistAngle - 60) * (Math.PI / 180)),
  };

  for (let i = 0; i < hexagonRadius * 2 - 1; i++) {
    const rootX = (i - hexagonRadius + 1) * vector1.x;
    const rootY = (i - hexagonRadius + 1) * vector1.y;
    const currentHexagonRadius =
      i < hexagonRadius ? hexagonRadius : hexagonRadius * 2 - i - 1;

    if (i % 3 !== 0) {
      const graphics = new Graphics().circle(0, 0, dotRadius).fill(0xffffff);
      graphics.x = rootX;
      graphics.y = rootY;
      containerRef.current.addChild(graphics);
    }

    for (let j = 1; j < currentHexagonRadius; j++) {
      if ((j * 2 + i) % 3 !== 0) {
        const graphics = new Graphics().circle(0, 0, dotRadius).fill(0xffffff);
        graphics.x = j * vector2.x + rootX;
        graphics.y = j * vector2.y + rootY;
        containerRef.current.addChild(graphics);
      }
    }
    for (let j = 1; j < currentHexagonRadius; j++) {
      if ((j * 2 + i) % 3 !== 0) {
        const graphics = new Graphics().circle(0, 0, dotRadius).fill(0xffffff);
        graphics.x = j * vector3.x + rootX;
        graphics.y = j * vector3.y + rootY;
        containerRef.current.addChild(graphics);
      }
    }
  }
};

const drawScalebar = (
  app: Application,
  scalebarLengthInNm: number,
  latticeConstant: number,
  atomSpacing: number,
  screenSpacing: number,
  scalebarContainerRef: React.RefObject<Container | null>,
  scalebarLabelContainerRef: React.RefObject<Container | null>
) => {
  if (
    !app ||
    !scalebarContainerRef.current ||
    !scalebarLabelContainerRef.current
  )
    return;

  const scalebarLengthinPixels =
    (scalebarLengthInNm / latticeConstant) * atomSpacing * screenSpacing;
  const scalebar = new Graphics()
    .rect(-scalebarLengthinPixels / 2, -2.5, scalebarLengthinPixels, 5)
    .fill(0xffffff);
  scalebar.x = app.renderer.width - scalebarLengthinPixels / 2 - 5;
  scalebar.y = app.renderer.height - 20;
  scalebarContainerRef.current.addChild(scalebar);

  const scalebarLabel = new Text({
    text: `${scalebarLengthInNm} nm`,
    style: {
      fontFamily: "Arial",
      fontSize: 16,
      fill: 0xffffff,
      align: "left",
    },
  });
  scalebarLabel.x = app.renderer.width - 50;
  scalebarLabel.y = app.renderer.height - 40;
  scalebarLabelContainerRef.current.addChild(scalebarLabel);
};

function MoireCanvas() {
  const twistAngle = useAppSelector(selectTwistAngle);
  const uniaxialStrain = useAppSelector(selectUniaxialStrain);
  const biaxialStrain = useAppSelector(selectBiaxialStrain);
  const uniaxialStrainAngle = useAppSelector(selectUniaxialStrainAngle);
  const spacing = useAppSelector(selectSpacing);

  const twistAngleRef = useSyncRef(twistAngle);
  const uniaxialStrainRef = useSyncRef(uniaxialStrain);
  const uniaxialStrainAngleRef = useSyncRef(uniaxialStrainAngle);
  const biaxialStrainRef = useSyncRef(biaxialStrain);
  const spacingRef = useSyncRef(spacing);

  const atomRadius = 1;
  const atomSpacing = 3;
  const latticeConstant = 0.142; // nm, typical for graphene
  const maxScalebarLengthInPx = 150;
  const minScalebarLengthInPx = 75;
  const scalebarLengthInNm = useRef(4); // Default scalebar length in nm
  const [hexagonRadius, setHexagonRadius] = useState(75);

  // App Rendering Refs and State
  const [appRef, app, setApp] = useSyncRefWithState<Application | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const topLayerContainerRef = useRef<Container | null>(null);
  const bottomLayerContainerRef = useRef<Container | null>(null);
  const scalebarContainerRef = useRef<Container | null>(null);
  const scalebarLabelContainerRef = useRef<Container | null>(null);
  const requestID = useRef<number | null>(null);

  // Initialize the renderer
  useEffect(() => {
    const initApp = async () => {
      let app = new Application();
      await app.init({
        width: canvasRef.current!.clientWidth,
        height: canvasRef.current!.clientHeight,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
        backgroundAlpha: 0,
        powerPreference: "high-performance",
      });
      canvasRef.current!.appendChild(app.canvas);

      // Disable interactivity on the canvas
      app.renderer.events.domElement.style.touchAction = "pan-y";

      topLayerContainerRef.current = new Container({
        interactiveChildren: false,
      });
      bottomLayerContainerRef.current = new Container({
        interactiveChildren: false,
      });
      scalebarContainerRef.current = new Container({
        interactiveChildren: false,
      });
      scalebarLabelContainerRef.current = new Container({
        interactiveChildren: false,
      });

      app.stage.addChild(topLayerContainerRef.current);
      app.stage.addChild(bottomLayerContainerRef.current);
      app.stage.addChild(scalebarContainerRef.current);
      app.stage.addChild(scalebarLabelContainerRef.current);

      setHexagonRadius(Math.min(app.renderer.width / atomSpacing / 2, 100));

      setApp(app);
      appRef.current = app;
    };
    initApp();

    return () => {
      if (app) {
        app.destroy(true, { children: true });
        setApp(null);
      }
    };
  }, []);

  window.onresize = () => {
    if (
      !appRef.current ||
      !canvasRef.current ||
      !bottomLayerContainerRef.current
    )
      return;
    appRef.current?.renderer.resize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight
    );
    setHexagonRadius(
      Math.min(appRef.current.renderer.width / atomSpacing / 2, 100)
    );
    bottomLayerContainerRef.current.x = appRef.current!.renderer.width / 2;
    bottomLayerContainerRef.current.y = appRef.current!.renderer.height / 2;
  };

  // The initial drawing of the hexagons
  useEffect(() => {
    if (
      !app ||
      topLayerContainerRef.current == undefined ||
      bottomLayerContainerRef.current == undefined ||
      scalebarContainerRef.current == undefined ||
      scalebarLabelContainerRef.current == undefined ||
      spacingRef.current == undefined ||
      twistAngleRef.current == undefined
    )
      return;

    topLayerContainerRef.current
      .removeChildren()
      .forEach((child) => child.destroy());
    bottomLayerContainerRef.current
      .removeChildren()
      .forEach((child) => child.destroy());

    drawHexagon(
      0,
      atomSpacing,
      atomRadius,
      hexagonRadius,
      bottomLayerContainerRef
    );
    drawHexagon(
      0,
      atomSpacing,
      atomRadius,
      hexagonRadius,
      topLayerContainerRef
    );

    bottomLayerContainerRef.current.x = app.renderer.width / 2;
    bottomLayerContainerRef.current.y = app.renderer.height / 2;
    topLayerContainerRef.current.x = app.renderer.width / 2;
    topLayerContainerRef.current.y = app.renderer.height / 2;

    // draw the scalebar
    drawScalebar(
      app,
      scalebarLengthInNm.current,
      latticeConstant,
      atomSpacing,
      spacingRef.current,
      scalebarContainerRef,
      scalebarLabelContainerRef
    );
  }, [app, topLayerContainerRef, bottomLayerContainerRef, hexagonRadius]);

  // The update loop
  const update = () => {
    if (appRef.current) {
      appRef.current.render();
      if (
        topLayerContainerRef.current != undefined &&
        bottomLayerContainerRef.current != undefined &&
        scalebarContainerRef.current != undefined &&
        scalebarLabelContainerRef.current != undefined &&
        twistAngleRef.current != undefined &&
        uniaxialStrainRef.current != undefined &&
        uniaxialStrainAngleRef.current != undefined &&
        spacingRef.current != undefined &&
        biaxialStrainRef.current != undefined
      ) {
        topLayerContainerRef.current.setFromMatrix(
          new Matrix()
            .rotate((uniaxialStrainAngleRef.current * Math.PI) / 180)
            .scale(1 + uniaxialStrainRef.current / 100, 1)
            .rotate(-(uniaxialStrainAngleRef.current * Math.PI) / 180)
            .scale(
              (1 + biaxialStrainRef.current / 100) * spacingRef.current,
              (1 + biaxialStrainRef.current / 100) * spacingRef.current
            )
            .rotate((twistAngleRef.current * Math.PI) / 180)
            .translate(
              appRef.current.renderer.width / 2,
              appRef.current.renderer.height / 2
            )
        );
        bottomLayerContainerRef.current.setFromMatrix(
          new Matrix()
            .scale(spacingRef.current, spacingRef.current)
            .translate(
              appRef.current.renderer.width / 2,
              appRef.current.renderer.height / 2
            )
        );

        // Uncomment the following lines if you want to scale the children of the containers
        // topLayerContainerRef.current.children.forEach((child) =>
        //   child.scale.set(1 / spacingRef.current!, 1 / spacingRef.current!)
        // );
        // bottomLayerContainerRef.current.children.forEach((child) =>
        //   child.scale.set(1 / spacingRef.current!, 1 / spacingRef.current!)
        // );

        const scalebarLengthinPixels =
          (scalebarLengthInNm.current / latticeConstant) *
          atomSpacing *
          spacingRef.current;
        if (scalebarLengthinPixels > maxScalebarLengthInPx) {
          scalebarLengthInNm.current = scalebarLengthInNm.current / 2;
        } else if (scalebarLengthinPixels < minScalebarLengthInPx) {
          scalebarLengthInNm.current = scalebarLengthInNm.current * 2;
        }

        scalebarContainerRef.current
          .removeChildren()
          .forEach((child) => child.destroy());
        scalebarLabelContainerRef.current
          .removeChildren()
          .forEach((child) => child.destroy());
        drawScalebar(
          appRef.current,
          scalebarLengthInNm.current,
          latticeConstant,
          atomSpacing,
          spacingRef.current,
          scalebarContainerRef,
          scalebarLabelContainerRef
        );
      }
    }
    requestID.current = requestAnimationFrame(update);
  };

  // start the update loop
  useEffect(() => {
    requestID.current = requestAnimationFrame(update);
    return () => {
      if (requestID.current) cancelAnimationFrame(requestID.current);
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      id="canvas"
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        overflow: "hidden",
        userSelect: "none",
      }}
    />
  );
}

export function Moire() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moire Visualiser</CardTitle>
        <CardDescription>Twisted Bilayer Graphene</CardDescription>
      </CardHeader>
      <CardContent>
        <MoireCanvas />
      </CardContent>
    </Card>
  );
}
