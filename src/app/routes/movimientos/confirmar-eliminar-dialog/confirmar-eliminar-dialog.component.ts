import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  imports : [
    MatButtonModule,
    MatDialogModule

  ],
  selector: 'app-confirmar-eliminar-dialog',
  templateUrl: './confirmar-eliminar-dialog.component.html',
})
export class ConfirmarEliminarDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmarEliminarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  confirmar(): void {
    this.dialogRef.close(true); // ✅ Se confirma la eliminación
  }

  cancelar(): void {
    this.dialogRef.close(false); // ❌ Se cancela la eliminación
  }
}

