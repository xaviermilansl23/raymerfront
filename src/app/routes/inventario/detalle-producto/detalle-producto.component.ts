import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { ToastrService } from 'ngx-toastr';

import { FreshService } from '../../services/fresh.service';
import { ModalConfirmacionComponent } from './modal-confirmacion/modal-confirmacion.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './detalle-producto.component.html',
  styleUrls: ['./detalle-producto.component.scss'],
})
export class DetalleProductoComponent implements OnInit, OnChanges {
  /** ID del producto a mostrar */
  @Input() productoId!: number;

  /** Solicitar edición al padre (emitimos el objeto producto) */
  @Output() editar = new EventEmitter<any>();

  /** Notificar al padre que se eliminó / cerrar panel */
  @Output() eliminar = new EventEmitter<void>();

  /** Datos mostrados */
  producto: any = null;

  /** Base de API para armar la URL de imagen absoluta */
  baseUrl: string = environment.apiUrl;

  constructor(
    private productosService: FreshService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.productoId) {
      this.cargarProducto(this.productoId);
    } else {
      console.warn('⚠️ No se recibió productoId; no se puede cargar el detalle.');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productoId'] && !changes['productoId'].firstChange) {
      const id = changes['productoId'].currentValue;
      if (id) this.cargarProducto(id);
    }
  }

  private cargarProducto(id: number): void {
    this.productosService.listarProductoPorId(id).subscribe({
      next: (data) => {
        const item = Array.isArray(data) ? data[0] : data;
        if (!item) {
          console.error('❌ Producto no encontrado.');
          return;
        }

        // Normalizar imagen
        let url = item.imagen_url;
        if (url) {
          url = url.startsWith('http')
            ? url
            : `${this.baseUrl}${url.startsWith('/') ? url.slice(1) : url}`;
        } else {
          url = 'assets/noimg.png';
        }

        this.producto = {
          ...item,
          imagen_url: url,
        };
      },
      error: (err) => {
        console.error('❌ Error al obtener detalles del producto:', err);
        this.toastr.error('No se pudo cargar el producto.', 'Error');
      },
    });
  }

  /** Ir a la vista de lotes del producto */
  verLotes(): void {
    if (!this.productoId) return;
    this.router.navigate(['dashboard/lotes', this.productoId]);
  }

  /** Pedir al padre que abra el formulario de edición con el producto actual */
  editarProducto(): void {
    if (!this.producto) {
      this.toastr.warning('No hay producto cargado para editar.', 'Cuidado');
      return;
    }
    this.editar.emit(this.producto);
  }

  /** Abrir modal de confirmación y, si aceptan, eliminar */
  abrirModalEliminar(): void {
    if (!this.productoId) return;

    const dialogRef = this.dialog.open(ModalConfirmacionComponent, {
      width: '400px',
      data: { productoId: this.productoId, nombre: this.producto?.nombre },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.eliminarProducto();
    });
  }

  /** Ejecutar eliminación (soft delete en el back) */
  private eliminarProducto(): void {
    if (!this.productoId) {
      console.error('❌ No se puede eliminar: no hay productoId.');
      return;
    }

    this.productosService.EliminarProductos(this.productoId).subscribe({
      next: (resp: any) => {
        const ok = resp?.ok ?? resp?.success ?? true; // algunos delete no retornan body útil
        if (ok) {
          this.toastr.success('Producto eliminado correctamente.', 'Éxito');
          this.eliminar.emit(); // notifica al padre para refrescar/cerrar
        } else {
          this.toastr.warning(resp?.mensaje ?? resp?.message ?? 'No se pudo eliminar el producto.', 'Cuidado');
        }
      },
      error: (err) => {
        console.error('❌ Error al eliminar producto:', err);
        const msg = err?.error?.message ?? 'Error al eliminar el producto.';
        this.toastr.error(msg, 'Error');
      },
    });
  }

  /** Cerrar panel sin acción (si tu template tiene un botón “Cerrar”) */
  cerrarPanel(): void {
    this.eliminar.emit(); // el padre decide qué hacer (cerrar sidenav/volver a la lista)
  }
}
