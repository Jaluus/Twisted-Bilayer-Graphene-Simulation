export type MoireType = {
  uniaxial_strain?: number;
  biaxial_strain?: number;
  uniaxial_strain_angle?: number;
  twist_angle?: number;
  spacing?: number;
};

export type BandDataPoint = {
  x: number;
  B1: number;
  B2: number;
  B3: number;
  B4: number;
  B5: number;
  B6: number;
};
