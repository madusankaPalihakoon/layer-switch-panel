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
  styleUrls: ['./layer-switch-panel.component.css'],
})
export class LayerSwitchPanelComponent {
  layerThemes: LayerTheme[] = [];
  hoveredTheme: LayerTheme | null = null;

  constructor(public dialog: MatDialog) {}

  openLayerDialog(): void {
    const dialogRef = this.dialog.open(AddLayerDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.layerThemes.push({ name: result, sublayers: [] });
      }
    });
  }

  openSublayerDialog(theme: LayerTheme): void {
    this.hoveredTheme = theme;
  }

  addSublayer(theme: LayerTheme): void {
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

  deleteSublayer(theme: LayerTheme, sublayer: any): void {
    const index = theme.sublayers.indexOf(sublayer);
    if (index !== -1) {
      theme.sublayers.splice(index, 1);
    }
  }
}
