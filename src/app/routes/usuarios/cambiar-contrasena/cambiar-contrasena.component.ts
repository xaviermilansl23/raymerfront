import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FreshService } from '../../services/fresh.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { contrasenaFuerte } from '../../../shared/validators/contrasena-fuerte.validator';

@Component({
  selector: 'app-cambiar-contrasena',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './cambiar-contrasena.component.html',
  styleUrl: './cambiar-contrasena.component.scss'
})
export class CambiarContrasenaComponent {
  formUsuario: FormGroup;
  private usuarioId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CambiarContrasenaComponent>,
    private service: FreshService,
    private toastr: ToastrService,
  ) {
    this.usuarioId = this.obtenerUsuarioId();

    this.formUsuario = this.fb.group(
      {
        nuevaContrasena: ['', [Validators.required, contrasenaFuerte]],
        confirmacion: ['', Validators.required],
      },
      { validators: this.coincidenContrasenas }
    );
  }

  private coincidenContrasenas(group: AbstractControl): { [key: string]: boolean } | null {
    const nueva = group.get('nuevaContrasena')?.value;
    const confirmacion = group.get('confirmacion')?.value;
    return nueva === confirmacion ? null : { noCoinciden: true };
  }

  private obtenerUsuarioId(): number | null {
    if (typeof sessionStorage === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem('user');
      const id = raw ? JSON.parse(raw)?.usuario_id : null;
      const n = Number(id);
      return Number.isInteger(n) && n > 0 ? n : null;
    } catch {
      return null;
    }
  }

  guardar(): void {
    if (this.formUsuario.invalid) return;

    if (!this.usuarioId) {
      this.toastr.error('No se pudo identificar al usuario en sesión');
      return;
    }

    this.service
      .actualizarUsuario(this.usuarioId, { contrasena: this.formUsuario.value.nuevaContrasena })
      .subscribe({
        next: () => {
          this.dialogRef.close('contrasena_cambiada');
        },
        error: () => {
          this.toastr.error('Error al cambiar la contraseña');
        }
      });
  }
}