import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayerManagerService {
  private layers: { name: string, subLayers: string[] }[] = [];
  constructor() { }

  getLayers() {
    return this.layers;
  }
  addMainLayer(layerName: string) {
    this.layers.push({ name: layerName, subLayers: [] });
  }

  deleteMainLayer(layerName: string) {
    this.layers = this.layers.filter(layer => layer.name !== layerName);
  }
  addSubLayer(mainLayerName: string, subLayerName: string) {
    const layer = this.layers.find(layer => layer.name === mainLayerName);
    if (layer && !layer.subLayers.includes(subLayerName)) {
      layer.subLayers.push(subLayerName);
    }
  }

  deleteSubLayer(mainLayerName: string, subLayerName: string) {
    const layer = this.layers.find(layer => layer.name === mainLayerName);
    if (layer) {
      layer.subLayers = layer.subLayers.filter(subLayer => subLayer !== subLayerName);
    }
  }
}
