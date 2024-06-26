import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-sublayer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    FormsModule,
    MatDialogModule,
  ],
  templateUrl: './add-sublayer-dialog.component.html',
  styleUrl: './add-sublayer-dialog.component.css',
})
export class AddSublayerDialogComponent {
  sublayerName!: string;
  sublayerType: string = 'point';
  color!: string;
  shape!: string;
  style!: string;
  width!: number;

  constructor(public dialogRef: MatDialogRef<AddSublayerDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
