import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
@Component({
  selector: 'app-add-layer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './add-layer-dialog.component.html',
  styleUrl: './add-layer-dialog.component.css'
})
export class AddLayerDialogComponent {
  layerName!: string;

  constructor(public dialogRef: MatDialogRef<AddLayerDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
