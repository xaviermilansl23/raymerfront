import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FreshService } from '../../services/fresh.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule,
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
  tiposProductos: Array<{
    tipo_producto_id: number;
    nombre: string;
    descripcion?: string;
  }> = [];

  /** Preview e imágenes */
  imagenesPrevia: string[] = []; // dataURLs de archivos nuevos
  archivosSeleccionados: File[] = []; // archivos nuevos a subir
  imagenesExistentes: string[] = []; // URLs (absolutas) de imágenes ya guardadas

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
        marca: this._producto.marca ?? '',
        modelo: this._producto.modelo ?? '',
        tipoProductoId: this._producto.tipo_producto_id ?? null,

        // 🔥 NUEVOS CAMPOS
        modelo3dUrl: this._producto.modelo3d_url ?? '',
        modelo3dFullUrl: this._producto.modelo3d_full_url ?? '',
      });

      // Imágenes existentes (todas) para el carrusel en la app/web
      const listaExistentes = Array.isArray(this._producto.imagenes)
        ? this._producto.imagenes.filter((u: any) => u)
        : this._producto.imagen_url
          ? [this._producto.imagen_url]
          : [];

      this.imagenesExistentes = listaExistentes.map((raw: string) =>
        this.armarUrlAbsoluta(raw),
      );
      this.imagenesPrevia = [];
      this.archivosSeleccionados = [];
    } else {
      // Modo creación
      this.productoForm.reset({
        nombre: '',
        descripcion: '',
        marca: '',
        modelo: '',
        tipoProductoId: null,
        modelo3dUrl: '',
        modelo3dFullUrl: '',
        files: null,
      });
      this.archivosSeleccionados = [];
      this.imagenesPrevia = [];
      this.imagenesExistentes = [];
    }
  }

  constructor(
    private fb: FormBuilder,
    private freshService: FreshService,
    private toastr: ToastrService,
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      marca: ['', [Validators.maxLength(100)]],
      modelo: ['', [Validators.maxLength(100)]],
      tipoProductoId: [null],
      files: [null],

      // 🔥 NUEVOS CAMPOS
      modelo3dUrl: [''],
      modelo3dFullUrl: [''],
    });
  }

  ngOnInit(): void {
    this.freshService.listarTipoproductos().subscribe({
      next: (response: any) => {
        const arr = Array.isArray(response)
          ? response
          : (response?.result ?? []);
        this.tiposProductos = arr.map((t: any) => ({
          tipo_producto_id: Number(
            t.tipo_producto_id ?? t.id ?? t.tipoProductoId ?? 0,
          ),
          nombre: t.nombre ?? t.tipo_producto_nombre ?? '—',
          descripcion: t.descripcion ?? '',
        }));
      },
      error: () => {
        this.toastr.error(
          'No se pudieron cargar los tipos de producto.',
          'Error',
        );
      },
    });
  }

  /** Imágenes */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const nuevos = Array.from(input.files);
    const totalActuales =
      this.archivosSeleccionados.length + this.imagenesExistentes.length;

    // Máximo 4 imágenes por producto (consistente con la BD).
    const cupo = 4 - totalActuales;
    if (cupo <= 0) {
      this.toastr.warning(
        'Solo se permiten hasta 4 imágenes por producto.',
        'Cuidado',
      );
      input.value = '';
      return;
    }

    const aAgregar = nuevos.slice(0, cupo);
    if (nuevos.length > cupo) {
      this.toastr.warning(
        `Solo se permiten hasta 4 imágenes. Se agregaron ${cupo} de ${nuevos.length}.`,
        'Cuidado',
      );
    }

    this.archivosSeleccionados.push(...aAgregar);

    // Previews de los nuevos archivos
    aAgregar.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenesPrevia.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  /** Eliminar una imagen existente (no se conservará) */
  eliminarExistente(index: number): void {
    this.imagenesExistentes.splice(index, 1);
  }

  /** Eliminar un archivo nuevo aún no subido */
  eliminarNueva(index: number): void {
    this.archivosSeleccionados.splice(index, 1);
    this.imagenesPrevia.splice(index, 1);
  }

  /** Convierte un path relativo/absoluto del backend en URL usable. */
  private armarUrlAbsoluta(raw: string): string {
    if (!raw) return raw;
    if (raw.startsWith('http')) return raw;
    // El backend entrega rutas absolutas al admin; aseguramos prefijo si es relativa.
    return raw.startsWith('/')
      ? `${environment.apiUrl}${raw.slice(1)}`
      : `${environment.apiUrl}${raw}`;
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
    const marca = this.productoForm.get('marca')?.value?.trim() ?? '';
    const modelo = this.productoForm.get('modelo')?.value?.trim() ?? '';
    const tipoProductoId = this.productoForm.get('tipoProductoId')?.value;

    formData.append('nombre', nombre);
    if (descripcion) formData.append('descripcion', descripcion);
    formData.append('marca', marca);
    formData.append('modelo', modelo);
    if (tipoProductoId)
      formData.append('tipoProductoId', String(tipoProductoId));

    formData.append('manejaLotes', 'true');
    formData.append('ventaPorCodigo', 'true');

    // Imágenes existentes a conservar (rutas del backend).
    this.imagenesExistentes.forEach((url) => {
      const ruta = this.urlARutaRelativa(url);
      if (ruta) formData.append('imagenesExistentes', ruta);
    });

    // Nuevas imágenes (todas las seleccionadas).
    this.archivosSeleccionados.forEach((file) => {
      formData.append('files', file);
    });

    // 🔥 NUEVOS CAMPOS
    const modelo3dUrl = this.productoForm.get('modelo3dUrl')?.value?.trim();
    const modelo3dFullUrl = this.productoForm
      .get('modelo3dFullUrl')
      ?.value?.trim();

    if (modelo3dUrl) formData.append('modelo3dUrl', modelo3dUrl);
    if (modelo3dFullUrl) formData.append('modelo3dFullUrl', modelo3dFullUrl);

    const productoId =
      this._producto?.producto_id ?? this._producto?.id ?? null;

    if (productoId) {
      // ✏️ Editar
      this.freshService.actualizarProductoForm(productoId, formData).subscribe({
        next: (resp: any) => {
          if (resp?.ok) {
            this.toastr.success('Producto actualizado correctamente.', 'Éxito');
            this.cerrarFormulario();
          } else {
            this.toastr.warning(
              resp?.mensaje ?? 'No se pudo actualizar el producto.',
              'Cuidado',
            );
          }
        },
        error: (error) => {
          console.error('❌ Error al actualizar:', error);
          this.toastr.error(
            error?.error?.message ?? 'Error al actualizar el producto.',
            'Error',
          );
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
            this.toastr.warning(
              resp?.mensaje ?? 'No se pudo crear el producto.',
              'Cuidado',
            );
          }
        },
        error: (error) => {
          console.error('❌ Error al crear:', error);
          this.toastr.error(
            error?.error?.message ?? 'Error al crear el producto.',
            'Error',
          );
        },
      });
    }
  }

  /** Cerrar formulario y reset */
  cerrarFormulario(): void {
    this.productoForm.reset({
      nombre: '',
      descripcion: '',
      marca: '',
      modelo: '',
      tipoProductoId: null,
      modelo3dUrl: '',
      modelo3dFullUrl: '',
      files: null,
    });

    this.archivosSeleccionados = [];
    this.imagenesPrevia = [];
    this.imagenesExistentes = [];

    this.closePanel.emit();
  }

  /** Convierte una URL absoluta (con apiUrl) de vuelta a la ruta relativa que espera el backend. */
  private urlARutaRelativa(url: string): string {
    if (!url) return '';
    const raw = url.trim();
    if (raw.startsWith('http')) {
      try {
        const u = new URL(raw);
        return u.pathname.startsWith('/uploads/') ? u.pathname : '';
      } catch {
        return '';
      }
    }
    // Ya es relativa
    if (raw.startsWith('/uploads/')) return raw;
    return raw;
  }
}
