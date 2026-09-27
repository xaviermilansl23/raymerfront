import { Component, Inject } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface FiltrosTipo {
  tipo_producto_id: number;
  tipo_producto_nombre: string;
}

export interface FiltrosProductoData {
  tipos: FiltrosTipo[];
  seleccion: number[];
}

@Component({
  selector: 'app-filtros-producto-dialog',
  standalone: true,
  imports: [NgFor, NgIf, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './filtros-producto-dialog.component.html',
  styleUrls: ['./filtros-producto-dialog.component.scss'],
})
export class FiltrosProductoDialogComponent {
  seleccion: Set<number>;

  constructor(
    public dialogRef: MatDialogRef<FiltrosProductoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FiltrosProductoData,
  ) {
    this.seleccion = new Set<number>(data.seleccion ?? []);
  }

  estaSeleccionado(id: number): boolean {
    return this.seleccion.has(id);
  }

  toggle(id: number): void {
    if (!this.seleccion.delete(id)) this.seleccion.add(id);
  }

  limpiar(): void {
    this.seleccion.clear();
  }

  aplicar(): void {
    this.dialogRef.close(Array.from(this.seleccion));
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}