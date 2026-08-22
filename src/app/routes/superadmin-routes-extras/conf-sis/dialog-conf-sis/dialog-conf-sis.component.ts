import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FreshService } from '../../../services/fresh.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-dialog-conf-sis',
  imports: [

    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './dialog-conf-sis.component.html',
  styleUrl: './dialog-conf-sis.component.scss'
})
export class DialogConfSisComponent {


   form: FormGroup;
   minDate: Date = new Date(); // 🔒 hoy como mínimo


  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogConfSisComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: FreshService,
    private toastr: ToastrService
  ) {
this.form = this.fb.group({
  fecha_ultimo_pago: [data?.fecha_ultimo_pago ? new Date(data.fecha_ultimo_pago) : '', Validators.required],
  fecha_vencimiento: [data?.fecha_vencimiento ? new Date(data.fecha_vencimiento) : '', Validators.required],
  observaciones: [data?.observaciones || '', Validators.required]
});

  }

  actualizar(): void {
    if (this.form.invalid) return;

    this.service.renovarSis(this.data.id, this.form.value).subscribe({
      next: () => {
        this.toastr.success('Configuración actualizada con éxito');
        this.dialogRef.close('actualizado'); // 👈 esto activa el refresh en el padre
      },
      error: () => {
        this.toastr.error('Error al actualizar la configuración');
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
