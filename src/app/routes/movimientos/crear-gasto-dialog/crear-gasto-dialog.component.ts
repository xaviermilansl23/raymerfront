import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FreshService } from '../../services/fresh.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; // ✅ Importar módulos de formularios
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-crear-gasto-dialog',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule

  ],
  templateUrl: './crear-gasto-dialog.component.html',
  styleUrl: './crear-gasto-dialog.component.scss'
})
export class CrearGastoDialogComponent {

  modoEdicion: boolean = false;
  gastoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private gastosService: FreshService,
    public dialogRef: MatDialogRef<CrearGastoDialogComponent>,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any


  ) {
    this.modoEdicion = !!data; // ✅ Si hay datos, está en modo edición

    this.gastoForm = this.fb.group({
      nombre: [data?.nombre || '', Validators.required],
      descripcion: [data?.descripcion || ''],
      total: [Number(data?.total) || 0, [Validators.required, Validators.min(0.01)]],
    });
  }


  guardarGasto(): void {
    if (this.gastoForm.valid) {
      if (this.modoEdicion) {
        // ✅ Editar gasto
        this.gastosService.editarGasto(this.data.gasto_id, this.gastoForm.value).subscribe(
          () => {
            this.toastr.success('Gasto actualizado exitosamente', 'Éxito');
            this.dialogRef.close(true);
          },
          (error) => {
            this.toastr.error('Error al actualizar gasto', 'Error');
          }
        );
      } else {
        // ✅ Crear gasto nuevo
        this.gastosService.crearGasto(this.gastoForm.value).subscribe(
          () => {
            this.toastr.success('Gasto creado exitosamente', 'Éxito');
            this.dialogRef.close(true);
          },
          (error) => {
            this.toastr.error('Error al crear gasto', 'Error');
            console.error('❌ Error al crear gasto:', error);
          }
        );
      }
    }
  }
}
