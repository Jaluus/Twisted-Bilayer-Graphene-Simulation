import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  selectBiaxialStrain,
  selectTwistAngle,
  selectUniaxialStrain,
  selectUniaxialStrainAngle,
  setBiaxialStrain,
  setTwistAngle,
  setUniaxialStrain,
  setUniaxialStrainAngle,
} from "@/app/slices/moireSlice";
import { Input } from "@/components/ui/input";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";

type ControlElementProps = {
  id: string;
  label: string;
  type: string;
  valueSetter: (value: number) => void;
  sliderDraggingSetter: (isDragging: boolean) => void;
  value: number | undefined;
  min?: number;
  max?: number;
  maxValid?: number;
  minValid?: number;
  step?: number;
  unit?: string;
};

function ControlElement({
  id,
  label,
  type,
  valueSetter,
  sliderDraggingSetter,
  value,
  min = 0,
  minValid = -Infinity,
  max = 100,
  maxValid = Infinity,
  step = 1,
  unit = "",
}: ControlElementProps) {
  const isOutOfRange =
    value != undefined && (value > maxValid || value < minValid);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label
          htmlFor={id}
          className={`text-sm font-medium transition-colors duration-300 ${
            isOutOfRange ? "text-red-500" : ""
          }`}
        >
          {label}
        </Label>
        <span
          className={`text-xs text-red-500 transition-opacity duration-300 ${
            isOutOfRange ? "opacity-100" : "opacity-0"
          }`}
        >
          Model inaccurate
        </span>
      </div>
      <div className="flex items-center space-x-4" id={id}>
        <div className="relative">
          <Input
            type={type}
            value={value}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value);
              if (!isNaN(newValue)) {
                valueSetter(newValue);
              }
            }}
            min={min}
            max={max}
            step={step}
            className={`w-[10ch] pr-6 transition-colors duration-300 ${
              isOutOfRange ? "border-red-500 focus:border-red-500" : ""
            }`}
          />
          {unit && (
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
              {unit}
            </span>
          )}
        </div>
        <Slider
          value={[value!]}
          onValueChange={(newValue) => {
            valueSetter(newValue[0]);
            sliderDraggingSetter(true);
          }}
          onValueCommit={() => sliderDraggingSetter(false)}
          min={min}
          max={max}
          step={step}
          className={`w-full transition-colors duration-300`}
          rangeClassName={
            isOutOfRange ? "transition-colors bg-red-500" : "transition-colors"
          }
          thumbClassName={
            isOutOfRange
              ? "transition-colors border-red-300 hover-red-300"
              : "transition-colors"
          }
          aria-label={label}
        />
      </div>
    </div>
  );
}

interface ControlsProps {
  onSliderDraggingChange: (isDragging: boolean) => void;
}

export function Controls({ onSliderDraggingChange }: ControlsProps) {
  const dispatch = useAppDispatch();

  const twistAngle = useAppSelector(selectTwistAngle);
  const biaxialStrain = useAppSelector(selectBiaxialStrain);
  const uniaxialStrain = useAppSelector(selectUniaxialStrain);
  const uniaxialStrainAngle = useAppSelector(selectUniaxialStrainAngle);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controls</CardTitle>
      </CardHeader>
      <CardContent style={{ marginTop: "-1rem" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <ControlElement
            id="twist-angle"
            label="Twist Angle"
            type="number"
            valueSetter={(value) => dispatch(setTwistAngle(value))}
            sliderDraggingSetter={onSliderDraggingChange}
            value={twistAngle}
            min={0}
            max={30}
            maxValid={3}
            minValid={0.7}
            step={0.01}
            unit="°"
          />

          <ControlElement
            id="biaxial-strain"
            label="Biaxial Strain"
            type="number"
            valueSetter={(value) => dispatch(setBiaxialStrain(value))}
            sliderDraggingSetter={onSliderDraggingChange}
            value={biaxialStrain}
            min={-5}
            max={5}
            maxValid={0.5}
            minValid={-0.5}
            step={0.001}
            unit="%"
          />

          <ControlElement
            id="uniaxial-strain"
            label="Uniaxial Strain"
            type="number"
            valueSetter={(value) => dispatch(setUniaxialStrain(value))}
            sliderDraggingSetter={onSliderDraggingChange}
            value={uniaxialStrain}
            min={-5}
            max={5}
            maxValid={1}
            minValid={-1}
            step={0.001}
            unit="%"
          />

          <ControlElement
            id="uniaxial-strain-angle"
            label="Uniaxial Strain Angle"
            type="number"
            valueSetter={(value) => dispatch(setUniaxialStrainAngle(value))}
            sliderDraggingSetter={onSliderDraggingChange}
            value={uniaxialStrainAngle}
            min={-60}
            max={60}
            step={0.01}
            unit="°"
          />
        </div>
      </CardContent>
    </Card>
  );
}
