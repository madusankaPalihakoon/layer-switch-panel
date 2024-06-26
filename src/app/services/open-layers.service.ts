import { Injectable } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Draw, Interaction, Select, Translate, Snap } from 'ol/interaction';
import Feature from 'ol/Feature';
import { Geometry, LineString, Polygon } from 'ol/geom';
import { click } from 'ol/events/condition';
// import '../proj4.ts';
import { get as getProjection, transform } from 'ol/proj.js';
import MousePosition from 'ol/control/MousePosition.js';
import { createStringXY } from 'ol/coordinate.js';
import { register } from 'ol/proj/proj4';
import { CutPolygonService } from './cut-polygon.service';
import { Fill, Circle, Stroke, Style } from 'ol/style.js';
type LayersDictionary = { [key: string]: VectorLayer<Feature<Geometry>> }; // in this canse you have defined a new type
@Injectable({
  providedIn: 'root',
})
export class OpenLayersService {
  //?Define the parameters for the OpenLayerService
  private map!: Map;
  private vectorSource = new VectorSource(); // this initalization is critical
  private drawInteraction: Draw | null = null;
  private currentDrawType: 'Point' | 'LineString' | 'Polygon' | null = null;
  private selectionInteraction!: Select | null;
  private selectedFeature: Feature<Geometry> | null = null;
  private snapInteraction: Snap | null = null;
  // public pointerPosition: [number, number] = [0, 0];

  private layers: LayersDictionary = {};
  // private vectorStyle = new Style({
  //   image: new Circle({
  //     radius: 5,
  //     fill: new Fill({
  //       color: 'red',
  //     }),
  //     stroke: new Stroke({
  //       color: 'black',
  //       width: 2,
  //     }),
  //   }),
  //   stroke: new Stroke({
  //     color: 'blue',
  //     width: 2,
  //   }),
  //   fill: new Fill({
  //     color: 'rgba(0, 0, 255, 0.1)',
  //   }),
  // });

  // private vectorLayer = new VectorLayer({
  //   source: this.vectorSource,
  //   style: this.vectorStyle,
  // });
  private splitPloy!: Polygon | null;
  private splitLine!: LineString | null;
  // private snapInteraction!: Snap | null;

  //? initiating the external service and openlayer components
  constructor(private cutpolyService: CutPolygonService) {
    // this.registerProjections();
  }

  // private registerProjections() {
  //   proj4.defs(
  //     'EPSG:27700',
  //     '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
  //       '+x_0=400000 +y_0=-100000 +ellps=airy ' +
  //       '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
  //       '+units=m +no_defs'
  //   );

  //   proj4.defs(
  //     'EPSG:23032',
  //     '+proj=utm +zone=32 +ellps=intl ' +
  //       '+towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs'
  //   );

  //   proj4.defs(
  //     'EPSG:5235',
  //     '+proj=tmerc +lat_0=7.00047152777778 +lon_0=80.7717130833333 + k=0.9999238418 +x_0=500000 +y_0=500000 +a=6377276.3450 +b=6356075.4131 +towgs84=-0.2933,766.9499,87.7131,0.0000009488,0.00000821792,3.4730161,0.000000039338 +units=m +no_defs +type=crs'
  //   );

  //   register(proj4);

  //   const proj27700 = getProjection('EPSG:27700');
  //   if (proj27700) {
  //     proj27700.setExtent([-650000, -150000, 1350000, 1450000]);
  //   } else {
  //     console.error(' Projection EPSG:2700 is not available');
  //   }

  //   const proj23032 = getProjection('EPSG:23032');
  //   if (proj23032) {
  //     proj23032.setExtent([-1206118.71, 4021309.92, 1295389.0, 8051813.28]);
  //   } else {
  //     console.error(' Projection EPSG:23032 is not available');
  //   }

  //   const proj5235 = getProjection('EPSG:5235');
  //   if (proj5235) {
  //     // proj5235.setExtent([ 818630.19, 373847.32, 374653.87, 630460.79]);
  //   } else {
  //     console.error(' Projection EPSG:5235 is not available');
  //   }
  // }

  //? initialize the  map

  initializeMap(mapElement: HTMLElement): void {
    this.map = new Map({
      target: mapElement,

      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],

      view: new View({
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 2,
      }),
    });
  }
  //? defining the  requred functions for the openlayer service
  //$ function addLater
  public addLayers(name: string, subLayers: string[]): void {
    subLayers.forEach((subLayer) => {
      const key = `${name}:${subLayer}`;
      const vectorSource = new VectorSource();
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: this.getStyleForLayer(subLayer),
      });
      this.map.addLayer(vectorLayer);
      this.layers[key] = vectorLayer;
    });
  }
  //$ fucntion: assign styles for layers
  getStyleForLayer(layer: string): Style {
    switch (layer) {
      case 'subLayer1':
        return new Style({
          image: new Circle({
            radius: 5,
            fill: new Fill({ color: 'red' }),
            stroke: new Stroke({ color: 'black', width: 2 }),
          }),
        });
      case 'subLayer2':
        return new Style({
          stroke: new Stroke({ color: 'blue', width: 2 }),
        });
      default:
        return new Style({
          stroke: new Stroke({ color: 'green', width: 2 }),
          fill: new Fill({ color: 'rgba(0, 255, 0, 0.5)' }),
        });
    }
  }

  //$ fucntion: for toggling the snap
  public toggleSnapInteraction(enable?: boolean): void {
    if (!enable == undefined) {
      // if the toggleSnapInteraction is defeined
      if (enable == true) {
        if (!this.snapInteraction) {
          this.snapInteraction = new Snap({
            source: this.vectorSource,
            pixelTolerance: 10,
          });
          this.map.addInteraction(this.snapInteraction);
        }
      } else if (enable == false) {
        if (this.snapInteraction) {
          this.map.removeInteraction(this.snapInteraction);
          this.snapInteraction = null;
        }
      }
    } else if (enable == undefined) {
      // if the toggleSnapInteraction is undefedeined
      if (this.snapInteraction) {
        this.map.removeInteraction(this.snapInteraction);
        this.snapInteraction = null;
      } else if (!this.snapInteraction) {
        this.snapInteraction = new Snap({
          source: this.vectorSource,
          pixelTolerance: 10,
        });
        this.map.addInteraction(this.snapInteraction);
      }
    }
  }

  //$ Function: AddSelection Interaction
  public addselectionInteraction(): void {
    this.setCursorForMode('select');
    this.selectionInteraction = new Select({
      condition: click,
    });

    this.map.addInteraction(this.selectionInteraction);
    this.selectionInteraction.on('select', (e) => {
      if (e.selected.length > 0) {
        this.selectedFeature = e.selected[0]; // Initiate the splitting process
      } else {
        this.selectedFeature = null;
      }
    });
  }

  //$ Fucntion: methode to add drawing interaction

  public addDrawingInteraction(
    drawType: 'Point' | 'LineString' | 'Polygon',
    onDrawEnd: (feature: Feature) => void
  ): void {
    // to check whether there is a drawing interaction active and if the same type

    if (this.drawInteraction) {
      this.map.removeInteraction(this.drawInteraction);
      this.drawInteraction = null;
      this.currentDrawType = null;
    }

    this.setCursorForMode('draw');

    this.drawInteraction = new Draw({
      source: this.vectorSource,
      type: drawType,
    });

    // add the interaction into the map
    this.map.addInteraction(this.drawInteraction);

    // add the snap interaction
    // this.toggleSnapInteraction(true);

    //set the current drawtype to newly requested event
    this.currentDrawType = drawType;

    //handdle the drawned event
    this.drawInteraction.on('drawend', (event) => {
      const drawnFeature = event.feature;
      console.log('Drawn feature:', drawnFeature); // Debug log
      // this.vectorSource.addFeature(drawnFeature); // Ensure the feature is added to the source
      onDrawEnd(drawnFeature); //

      // this.map.removeInteraction(this.drawInteraction!);
      // this.drawInteraction = null;
      // this.currentDrawType = null;
    });
  }

  //$ Assign feature to layers
  assignFeatureToLayer(feature: Feature<Geometry>, layerKey: string): void {
    const vectorLayer = this.layers[layerKey];
    if (vectorLayer) {
      vectorLayer.getSource()?.addFeature(feature);
    } else {
      console.error('Layer not found:', layerKey);
    }
  }

  //$ Fucntion: methode to use translate interaciton

  public addTranslateInteraction(): void {
    const translateInteraction = new Translate({});
    this.map.addInteraction(translateInteraction);
  }

  //$ Function remove all the interactions

  public removeAllInteractions(): void {
    this.map.getInteractions().forEach((interation) => {
      this.map.removeInteraction(interation);
    });
  }

  //$ Function: delete Fetures
  public deleteSelectedFeatures(): void {
    // access the features before removing them
    this.addselectionInteraction();
    if (this.selectionInteraction) {
      const features = this.selectionInteraction.getFeatures().getArray();

      // remove all the interactions
      features.forEach((feature) => {
        this.vectorSource.removeFeature(feature);
      });
    }
  }

  //$ Function creating the projections
  public viewProjectionChange(projectionID: string): void {
    const newProj = getProjection(projectionID);
    if (!newProj) {
      console.error('Projection Not Found', projectionID);
      return;
    }
    const currentView = this.map.getView();
    const currentCenter = currentView.getCenter();
    const currentZoom = currentView.getZoom();
    if (currentCenter) {
      const newCenter = transform(
        currentCenter,
        currentView.getProjection().getCode(),
        newProj.getCode()
      );

      const newProjectExrent = newProj.getExtent();
      const newView = new View({
        projection: newProj,
        center: newCenter,
        zoom: 0,
        extent: newProjectExrent || undefined,
      });
      this.map.setView(newView);
    } else {
      console.error('No center found');
    }
  }

  //$ Function: display the map cooridinates:
  createMousePositionControl(): void {
    const currentView = this.map.getView();
    const proj = currentView.getProjection();
    //ensure the projection is availale
    // const proj5235 = getProjection('EPSG:5235');
    if (proj) {
      const mousePositionControl = new MousePosition({
        coordinateFormat: createStringXY(4),
        projection: proj,
      });
      this.map.addControl(mousePositionControl);
    } else {
      console.error('Projection EPSG:5235 is not available');
    }
  }

  //$ Function: Split polygon Function
  splitPolygon(selectedLayer: string | null): void {
    this.setCursorForMode('defalt');
    if (this.selectedFeature && selectedLayer) {
      const vectorLayer = this.layers[selectedLayer];

      if (!vectorLayer) {
        console.error('Selected layer not found:', selectedLayer);
        return;
      }
      const geometry = this.selectedFeature.getGeometry() as Polygon;
      if (geometry instanceof Polygon) {
        this.splitPloy = geometry;
        console.log('please draw a line');
        this.toggleSnapInteraction(true);
        this.addDrawingInteraction('LineString', (drawnfeature) => {
          const lineGeometry = drawnfeature.getGeometry() as LineString;
          if (lineGeometry instanceof LineString) {
            this.splitLine = lineGeometry;
            const cutPolygons = this.cutpolyService.splitOperation(
              this.splitLine as LineString,
              this.splitPloy as Polygon
            );
            const features = [];

            const poly_01 = cutPolygons.poly_01;
            const poly_02 = cutPolygons.poly_02;

            const Poly_01Geometry = new Polygon([poly_01]);
            const Poly_02Geometry = new Polygon([poly_02]);

            if (Poly_01Geometry) {
              const feature1 = new Feature({
                geometry: Poly_01Geometry,
                name: 'Polygon 1',
              });
              vectorLayer.getSource()?.addFeature(feature1);
            }

            if (Poly_02Geometry) {
              const feature2 = new Feature({
                geometry: Poly_02Geometry,
                name: 'Polygon 2',
              });
              vectorLayer.getSource()?.addFeature(feature2);
            }
          } else {
            console.log('please draw a line');
            return;
          }
        });
      } else {
        console.log('please select a polygon');
        return;
      }
    } else {
      console.log('please select a polygon');
      return;
    }
  }

  //$ Function: Deactivation the selection:
  public deactivateSelection(): void {
    this.map.getInteractions().forEach((interaction) => {
      if (interaction instanceof Select) {
        interaction.setActive(false); // Disable the select interaction
      }
    });

    // Change the cursor style back to default
    const mapElement = this.map.getTargetElement();
    mapElement.style.cursor = 'auto';

    // Optionally clear selection instructions or UI hints
    console.log('Selection completed.');
  }
  //$ Function: Set the cursor style
  setCursorForMode(mode: string): void {
    const mapElement = this.map.getTargetElement();

    switch (mode) {
      case 'select':
        mapElement.style.cursor = 'pointer'; // Hand pointer for selection mode
        break;
      case 'draw':
        mapElement.style.cursor = 'pointer'; // Crosshair for drawing mode
        break;
      case 'move':
        mapElement.style.cursor = 'move'; // Move cursor for dragging mode
        break;
      default:
        mapElement.style.cursor = 'default'; // Default arrow cursor for normal mode
        break;
    }
  }

  //$ Fucntion: Display Polygons
  // displayPolygons(features: Feature[]) {
  //   if (!this.vectorLayer) {
  //     this.vectorLayer = new VectorLayer({
  //       source: new VectorSource({
  //         features: features
  //       })
  //     })
  //     this.map.addLayer(this.vectorLayer)
  //   } else {

  //   }

  // }
}
