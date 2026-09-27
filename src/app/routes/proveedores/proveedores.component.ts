import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { FreshService } from '../services/fresh.service';

interface Proveedor {
  proveedor_id: number;
  nombre: string;
  nit: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  estado: 'A' | 'I';
}

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss',
})
export class ProveedoresComponent implements OnInit {
  readonly displayedColumns = [
    'nombre',
    'nit',
    'contacto',
    'direccion',
    'estado',
    'acciones',
  ];

  proveedores: Proveedor[] = [];
  proveedorEditando: Proveedor | null = null;
  busqueda = '';
  filtroEstado: 'A' | 'I' | 'TODOS' = 'A';
  cargando = false;
  guardando = false;
  mostrarFormulario = false;

  proveedorForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly freshService: FreshService,
    private readonly toastr: ToastrService,
  ) {
    this.proveedorForm = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(160),
        ],
      ],
      nit: ['', Validators.maxLength(30)],
      telefono: ['', Validators.maxLength(40)],
      correo: ['', [Validators.email, Validators.maxLength(160)]],
      direccion: ['', Validators.maxLength(300)],
      estado: ['A', Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.cargando = true;
    this.freshService
      .listarProveedores({ estado: this.filtroEstado })
      .subscribe({
        next: (rows) => {
          this.proveedores = Array.isArray(rows) ? rows : [];
          this.cargando = false;
        },
        error: (error) => {
          this.cargando = false;
          this.toastr.error(this.mensajeError(error), 'Proveedores');
        },
      });
  }

  get proveedoresFiltrados(): Proveedor[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) return this.proveedores;
    return this.proveedores.filter((proveedor) =>
      [
        proveedor.nombre,
        proveedor.nit,
        proveedor.telefono,
        proveedor.correo,
        proveedor.direccion,
      ]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(termino)),
    );
  }

  nuevoProveedor(): void {
    this.proveedorEditando = null;
    this.proveedorForm.reset({ estado: 'A' });
    this.mostrarFormulario = true;
  }

  editarProveedor(proveedor: Proveedor): void {
    this.proveedorEditando = proveedor;
    this.proveedorForm.reset({
      nombre: proveedor.nombre,
      nit: proveedor.nit ?? '',
      telefono: proveedor.telefono ?? '',
      correo: proveedor.correo ?? '',
      direccion: proveedor.direccion ?? '',
      estado: proveedor.estado,
    });
    this.mostrarFormulario = true;
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.proveedorEditando = null;
    this.proveedorForm.reset({ estado: 'A' });
  }

  guardarProveedor(): void {
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      return;
    }

    const valor = this.proveedorForm.getRawValue();
    const payload = {
      nombre: valor.nombre.trim(),
      nit: valor.nit?.trim() || undefined,
      telefono: valor.telefono?.trim() || undefined,
      correo: valor.correo?.trim() || undefined,
      direccion: valor.direccion?.trim() || undefined,
      ...(this.proveedorEditando ? { estado: valor.estado } : {}),
    };
    const solicitud = this.proveedorEditando
      ? this.freshService.actualizarProveedor(
          this.proveedorEditando.proveedor_id,
          payload,
        )
      : this.freshService.crearProveedor(payload);

    this.guardando = true;
    solicitud.subscribe({
      next: () => {
        this.guardando = false;
        this.toastr.success(
          this.proveedorEditando
            ? 'Proveedor actualizado correctamente.'
            : 'Proveedor creado correctamente.',
          'Proveedores',
        );
        this.cancelar();
        this.cargarProveedores();
      },
      error: (error) => {
        this.guardando = false;
        this.toastr.error(this.mensajeError(error), 'Proveedores');
      },
    });
  }

  desactivarProveedor(proveedor: Proveedor): void {
    const confirmado = window.confirm(
      `¿Desactivar al proveedor "${proveedor.nombre}"? Los lotes existentes conservarán su historial.`,
    );
    if (!confirmado) return;

    this.freshService.eliminarProveedor(proveedor.proveedor_id).subscribe({
      next: () => {
        this.toastr.success(
          'Proveedor desactivado correctamente.',
          'Proveedores',
        );
        this.cargarProveedores();
      },
      error: (error) =>
        this.toastr.error(this.mensajeError(error), 'Proveedores'),
    });
  }

  private mensajeError(error: any): string {
    const mensaje = error?.error?.message ?? error?.message;
    return Array.isArray(mensaje)
      ? mensaje.join(', ')
      : mensaje || 'No se pudo completar la operación.';
  }
}
