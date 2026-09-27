import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FreshService } from '../../services/fresh.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { contrasenaFuerte } from '../../../shared/validators/contrasena-fuerte.validator';

@Component({
  selector: 'app-diaolog-usuarios',
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
    MatOptionModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './diaolog-usuarios.component.html',
  styleUrl: './diaolog-usuarios.component.scss'
})
export class DiaologUsuariosComponent {
  formUsuario: FormGroup;
tipoUsuarioLogueado = '';
rolesFiltrados: any[] = [];




  constructor(
  private fb: FormBuilder,
  private usuarioService: FreshService,
  private dialogRef: MatDialogRef<DiaologUsuariosComponent>,
  private toastr: ToastrService,
  @Inject(MAT_DIALOG_DATA) public data: any
) {
const usuarioRaw = sessionStorage.getItem('user');
const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
this.tipoUsuarioLogueado = usuario?.ci || '';
  this.formUsuario = this.fb.group({
    nombre: [data?.nombre || '', Validators.required],
    usuario: [data?.usuario || '', [Validators.required, Validators.email]],
    contrasena: [{ value: '', disabled: !!data?.usuario_id }, data ? [contrasenaFuerte] : [Validators.required, contrasenaFuerte]],
    ci: [data?.ci || '', [Validators.required, Validators.maxLength(20)]]
    // Solo agregar ci si es SUPERADMIN
    //...(this.tipoUsuarioLogueado === 'SUPERADMIN' && {
    //  ci: [data?.ci || '', Validators.required]
    //})
  });
  
}


guardarUsuario(): void {
  const datos = this.formUsuario.value;

  if (this.data?.usuario_id) {
    // Modo edición
    this.usuarioService.actualizarUsuario(this.data.usuario_id, datos).subscribe({
      next: () => {
        this.dialogRef.close('actualizado');
      },
      error: () => {
        this.toastr.error('Error al actualizar usuario');
      }
    });
  } else {
    // Modo creación
    this.usuarioService.crearUsuario(datos).subscribe({
      next: () => {
        this.dialogRef.close('creado');
      },
      error: () => {
        this.toastr.error('Error al crear usuario');
      }
    });
  }
}


}
