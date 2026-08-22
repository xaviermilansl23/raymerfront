import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FreshService } from '../../services/fresh.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-dialog-producto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
  ],
  templateUrl: './dialog-producto.component.html',
  styleUrls: ['./dialog-producto.component.scss'],
})
export class DialogProductoComponent implements OnInit {
  /** Producto para edición */
  private _producto: any | null = null;

  public get editMode(): boolean {
    return !!this._producto;
  }

  /** Form principal */
  productoForm: FormGroup;

  /** Catálogo de tipos de productos */
  tiposProductos: Array<{ tipo_producto_id: number; nombre: string; descripcion?: string }> = [];

  /** Preview e imagen */
  imagenPrevia: string | null = null;
  archivoSeleccionado: File | null = null;

  /** Evento de cierre */
  @Output() closePanel = new EventEmitter<void>();

  /** Setter del producto */
  @Input()
  set producto(value: any | null) {
    this._producto = Array.isArray(value) ? value[0] : value;

    if (this._producto) {
      // Patch valores
      this.productoForm.patchValue({
        nombre: this._producto.nombre ?? '',
        descripcion: this._producto.descripcion ?? '',
        tipoProductoId: this._producto.tipo_producto_id ?? null,

        // 🔥 NUEVOS CAMPOS
        modelo3dUrl: this._producto.modelo3d_url ?? '',
        modelo3dFullUrl: this._producto.modelo3d_full_url ?? '',
      });

      // Imagen previa
      const raw = this._producto.imagen_url;
      if (raw) {
        const abs = raw.startsWith('http')
          ? raw
          : `${environment.apiUrl}${raw.startsWith('/') ? raw.slice(1) : raw}`;
        this.imagenPrevia = abs;
      } else {
        this.imagenPrevia = null;
      }
    } else {
      // Modo creación
      this.productoForm.reset({
        nombre: '',
        descripcion: '',
        tipoProductoId: null,
        modelo3dUrl: '',
        modelo3dFullUrl: '',
        file: null,
      });
      this.archivoSeleccionado = null;
      this.imagenPrevia = null;
    }
  }

  constructor(
    private fb: FormBuilder,
    private freshService: FreshService,
    private toastr: ToastrService
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      tipoProductoId: [null],
      file: [null],

      // 🔥 NUEVOS CAMPOS
      modelo3dUrl: [''],
      modelo3dFullUrl: [''],
    });
  }

  ngOnInit(): void {
    this.freshService.listarTipoproductos().subscribe({
      next: (response: any) => {
        const arr = Array.isArray(response) ? response : response?.result ?? [];
        this.tiposProductos = arr.map((t: any) => ({
          tipo_producto_id: Number(t.tipo_producto_id ?? t.id ?? t.tipoProductoId ?? 0),
          nombre: t.nombre ?? t.tipo_producto_nombre ?? '—',
          descripcion: t.descripcion ?? '',
        }));
      },
      error: () => {
        this.toastr.error('No se pudieron cargar los tipos de producto.', 'Error');
      },
    });
  }

  /** Imagen */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.archivoSeleccionado = input.files[0];
    const reader = new FileReader();
    reader.onload = () => (this.imagenPrevia = reader.result as string);
    reader.readAsDataURL(this.archivoSeleccionado);
  }

  /** Guardar */
  guardarProducto(): void {
    if (this.productoForm.invalid) {
      this.toastr.warning('Complete los datos del formulario.', 'Cuidado');
      this.productoForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();

    // Campos obligatorios
    const nombre = this.productoForm.get('nombre')?.value ?? '';
    const descripcion = this.productoForm.get('descripcion')?.value?.trim();
    const tipoProductoId = this.productoForm.get('tipoProductoId')?.value;

    formData.append('nombre', nombre);
    if (descripcion) formData.append('descripcion', descripcion);
    if (tipoProductoId) formData.append('tipoProductoId', String(tipoProductoId));

    formData.append('manejaLotes', 'true');
    formData.append('ventaPorCodigo', 'true');

    if (this.archivoSeleccionado) {
      formData.append('file', this.archivoSeleccionado);
    }

    // 🔥 NUEVOS CAMPOS
    const modelo3dUrl = this.productoForm.get('modelo3dUrl')?.value?.trim();
    const modelo3dFullUrl = this.productoForm.get('modelo3dFullUrl')?.value?.trim();

    if (modelo3dUrl) formData.append('modelo3dUrl', modelo3dUrl);
    if (modelo3dFullUrl) formData.append('modelo3dFullUrl', modelo3dFullUrl);

    const productoId =
      this._producto?.producto_id ??
      this._producto?.id ??
      null;

    if (productoId) {
      // ✏️ Editar
      this.freshService.actualizarProductoForm(productoId, formData).subscribe({
        next: (resp: any) => {
          if (resp?.ok) {
            this.toastr.success('Producto actualizado correctamente.', 'Éxito');
            this.cerrarFormulario();
          } else {
            this.toastr.warning(resp?.mensaje ?? 'No se pudo actualizar el producto.', 'Cuidado');
          }
        },
        error: (error) => {
          console.error('❌ Error al actualizar:', error);
          this.toastr.error(error?.error?.message ?? 'Error al actualizar el producto.', 'Error');
        },
      });
    } else {
      // 🆕 Crear
      this.freshService.crearProductos(formData).subscribe({
        next: (resp: any) => {
          if (resp?.ok) {
            this.toastr.success('Producto creado con éxito.', 'Éxito');
            this.cerrarFormulario();
          } else {
            this.toastr.warning(resp?.mensaje ?? 'No se pudo crear el producto.', 'Cuidado');
          }
        },
        error: (error) => {
          console.error('❌ Error al crear:', error);
          this.toastr.error(error?.error?.message ?? 'Error al crear el producto.', 'Error');
        },
      });
    }
  }

  /** Cerrar formulario y reset */
  cerrarFormulario(): void {
    this.productoForm.reset({
      nombre: '',
      descripcion: '',
      tipoProductoId: null,
      modelo3dUrl: '',
      modelo3dFullUrl: '',
      file: null,
    });

    this.archivoSeleccionado = null;
    this.imagenPrevia = null;

    this.closePanel.emit();
  }
}
