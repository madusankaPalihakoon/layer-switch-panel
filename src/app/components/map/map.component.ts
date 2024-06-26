import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
} from '@angular/core';
import { OpenLayersService } from '../../services/open-layers.service';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayerSwitchPanelComponent } from '../layer-switch-panel/layer-switch-panel.component';
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule, LayerSwitchPanelComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, AfterViewInit {
  parentSelectedLayer: string | null = null;
  @ViewChild('mapElement') mapElementRef!: ElementRef;

  constructor(private openLayerService: OpenLayersService) {}
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.openLayerService.initializeMap(this.mapElementRef.nativeElement);
    this.openLayerService.createMousePositionControl();
    this.openLayerService.addselectionInteraction();
  }

  select(): void {
    this.openLayerService.addselectionInteraction();
  }
  setDrawingType(type: 'Point' | 'LineString' | 'Polygon'): void {
    if (this.parentSelectedLayer!) {
      // where does this comes from??
      this.openLayerService.addDrawingInteraction(
        type,
        (drawnFeature: Feature<Geometry>) => {
          // Here, you handle the drawnFeature. For example:
          console.log('A feature was drawn:', drawnFeature);
          this.openLayerService.assignFeatureToLayer(
            drawnFeature,
            this.parentSelectedLayer!
          ); // this where the feature is adding to the selected layer
        }
      );
    } else {
      alert('Please select a layer to draw');
    }
  }

  togglesnap(): void {
    this.openLayerService.toggleSnapInteraction();
  }

  onProjectionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const projectionId = selectElement.value;
    this.openLayerService.viewProjectionChange(projectionId);
  }

  polyCut(): void {
    this.openLayerService.splitPolygon(this.parentSelectedLayer!);
  }

  move(): void {
    this.openLayerService.addTranslateInteraction();
  }

  delete(): void {
    this.openLayerService.deleteSelectedFeatures();
  }

  testSelect(): void {
    this.openLayerService.addselectionInteraction();
  }

  onLayerSelected(layer: string) {
    this.parentSelectedLayer = layer;
  }
}
