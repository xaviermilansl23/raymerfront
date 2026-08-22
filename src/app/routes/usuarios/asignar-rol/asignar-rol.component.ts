import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FreshService } from '../../services/fresh.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

interface Rol {
  rol_id: number | string; // <- clave esperada en el HTML
  nombre: string;
}

interface DialogData {
  usuario_id: number | string;
  // Puede venir como 'V', 'G', 'S' o como 'VENDEDOR', 'GERENTE', 'SUPERADMIN'
  ci: string;
}

@Component({
  selector: 'app-asignar-rol',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './asignar-rol.component.html',
  styleUrls: ['./asignar-rol.component.scss']
})
export class AsignarRolComponent implements OnInit {
  formRol!: FormGroup;
  listaRoles: Rol[] = [];
  tipoUsuarioLogueado = '';
  rolesUsuarioLogueado: any[] = [];

  constructor(
    private fb: FormBuilder,
    private usuarioService: FreshService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<AsignarRolComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  // ===== Helpers =====
  private U(x: any): string {
    return (x ?? '').toString().trim().toUpperCase();
  }

  private normalizarTipoUsuario(x: any): string {
    const t = this.U(x);
    const map: Record<string, string> = { 'S': 'SUPERADMIN', 'G': 'GERENTE', 'V': 'VENDEDOR' };
    return map[t] ?? t;
  }

  private rolesNombreUpper(roles: any[]): string[] {
    return (roles || [])
      .map((r: any) => typeof r === 'string' ? r : r?.nombre)
      .filter(Boolean)
      .map((n: string) => this.U(n));
  }

  /** Asegura que todos los roles tengan { rol_id, nombre } */
  private normalizarRoles(res: any[]): Rol[] {
    return (Array.isArray(res) ? res : []).map((r: any) => ({
      rol_id: r?.rol_id ?? r?.id,   // <-- si tu backend trae "id", lo mapeamos a "rol_id"
      nombre: r?.nombre
    })).filter((r: Rol) => r.rol_id != null && !!r.nombre);
  }

  // ===== Ciclo de vida =====
  ngOnInit(): void {
    this.formRol = this.fb.group({
      rol_id: [null, Validators.required]
    });

    const userRaw = sessionStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;

    this.tipoUsuarioLogueado = this.U(user?.ci);
    this.rolesUsuarioLogueado = Array.isArray(user?.roles) ? user!.roles : [];

    this.usuarioService.listarRoles().subscribe({
      next: (res: any[]) => {
        const roles = this.normalizarRoles(res);
        this.listaRoles = this.filtrarRolesSegunContexto(roles);
      },
      error: () => this.toastr.error('Error al cargar los roles')
    });
  }

  // ===== Reglas de visibilidad/asignación =====
  private filtrarRolesSegunContexto(roles: Rol[]): Rol[] {
    const tipoDestino = this.normalizarTipoUsuario(this.data?.ci);
    const rolesLogueadoUpper = this.rolesNombreUpper(this.rolesUsuarioLogueado);
    const tieneRol = (rol: string) => rolesLogueadoUpper.includes(this.U(rol));

    // SUPERADMIN: ve/asigna todos
    if (tieneRol('SUPERADMIN')) {
      return roles;
    }

    // GERENTE: solo puede asignar VENDEDOR (cuando el destino es VENDEDOR)
    if (tieneRol('GERENTE')) {
      if (tipoDestino === 'VENDEDOR') {
        return roles.filter(r => this.U(r.nombre) === 'VENDEDOR');
      }
      return [];
    }

    // VENDEDOR: no asigna
    return [];
  }

  // ===== Acciones =====
  asignar(): void {
    if (this.formRol.invalid) return;

    const payload = {
      usuario_id: this.data.usuario_id,
      rol_id: this.formRol.value.rol_id  // <- usa el valor del mat-select (rol.rol_id)
    };

    this.usuarioService.asignarRol(payload).subscribe({
      next: () => {
        this.toastr.success('Rol asignado correctamente');
        this.dialogRef.close('rol_asignado');
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error al asignar rol';
        this.toastr.error(msg);
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
