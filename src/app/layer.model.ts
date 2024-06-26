// src/app/layer.model.ts
export interface Sublayer {
  name: string;
  type: 'point' | 'line' | 'polygon';
  color?: string;
  shape?: string;
  style?: string;
  width?: number;
}

export interface LayerTheme {
  name: string;
  sublayers: Sublayer[];
}
