import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AddLayerDialogComponent } from '../add-layer-dialog/add-layer-dialog.component';
import { AddSublayerDialogComponent } from '../add-sublayer-dialog/add-sublayer-dialog.component';
import { LayerTheme } from '../../layer.model';
import { MatIconModule } from '@angular/material/icon';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-layer-switch-panel',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MapComponent],
  templateUrl: './layer-switch-panel.component.html',
  styleUrl: './layer-switch-panel.component.css',
})
export class LayerSwitchPanelComponent {
  layerThemes: any[] = [];

  constructor(public dialog: MatDialog) {} // injecting th3 metrials to the dialog

  openLayerDialog(): void {
    const dialogRef = this.dialog.open(AddLayerDialogComponent); // this make references to the opendialog component (this.dialog is library with angular material )

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.layerThemes.push({ name: result, sublayers: [] }); // in the case sublayers are type of array
      }
    });
  }

  addSublayer(theme: LayerTheme): void {
    // this very important concept , in the create it has created new layer type in the layer theme
    const dialogRef = this.dialog.open(AddSublayerDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        theme.sublayers.push(result);
      }
    });
  }

  deleteTheme(index: number): void {
    this.layerThemes.splice(index, 1);
  }

  deleteSublayer(theme: any, sublayer: any): void {
    const index = theme.sublayers.indexOf(sublayer);
    if (index !== -1) {
      theme.sublayers.splice(index, 1);
    }
  }
}
