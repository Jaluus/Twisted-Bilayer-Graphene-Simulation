import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { MoireType } from "@/lib/types";

const initialState: MoireType = {
  twist_angle: 1.1,
  uniaxial_strain: 0.0,
  biaxial_strain: 0.0,
  uniaxial_strain_angle: 0.0,
  spacing: 1.0,
};

export const moireSlice = createSlice({
  name: "Moire",
  initialState,
  reducers: {
    setTwistAngle: (state, action: PayloadAction<number>) => {
      state.twist_angle = action.payload;
    },
    setUniaxialStrain: (state, action: PayloadAction<number>) => {
      state.uniaxial_strain = action.payload;
    },
    setBiaxialStrain: (state, action: PayloadAction<number>) => {
      state.biaxial_strain = action.payload;
    },
    setUniaxialStrainAngle: (state, action: PayloadAction<number>) => {
      state.uniaxial_strain_angle = action.payload;
    },
    setSpacing: (state, action: PayloadAction<number>) => {
      state.spacing = action.payload;
    },
  },
});

export const {
  setTwistAngle,
  setUniaxialStrain,
  setBiaxialStrain,
  setUniaxialStrainAngle,
  setSpacing,
} = moireSlice.actions;

export default moireSlice.reducer;

export const selectTwistAngle = (state: { moire: MoireType }) =>
  state.moire.twist_angle;
export const selectUniaxialStrain = (state: { moire: MoireType }) =>
  state.moire.uniaxial_strain;
export const selectBiaxialStrain = (state: { moire: MoireType }) =>
  state.moire.biaxial_strain;
export const selectUniaxialStrainAngle = (state: { moire: MoireType }) =>
  state.moire.uniaxial_strain_angle;
export const selectSpacing = (state: { moire: MoireType }) =>
  state.moire.spacing;
