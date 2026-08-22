import { Component, input, Input, OnInit,Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FreshService } from '../../../services/fresh.service';
import { MatFormField } from '@angular/material/form-field';
import { MatLabel, MatError } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EventEmitter } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogcategorias',
  imports: [
    CommonModule,
    MatFormField,
    MatLabel,
    MatError,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButton,
  ],
  standalone: true,
  templateUrl: './dialogcategorias.component.html',
  styleUrls: ['./dialogcategorias.component.scss'], // Cambié `styleUrl` a `styleUrls`
})
export class DialogcategoriasComponent implements OnInit {
  @Input() producto: any = null; // Recibe el producto para edición
  @Output() closePanel = new EventEmitter<void>(); // Notifica al padre para cerrar el panel

  formulario: FormGroup;
  isEditMode: boolean = false; // Indica si estamos en modo edición

  constructor(
    private fb: FormBuilder,
    private tipoProductoService: FreshService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {
    this.formulario = this.fb.group({
      nombre: ['', Validators.required], // Campo de nombre obligatorio
    });
  }

  ngOnInit(): void {
    // Detectar si estamos en modo edición
    if (this.producto) {
      this.isEditMode = true;
      this.formulario.patchValue(this.producto); // Prellenar el formulario con los datos del producto
    } else {
      this.isEditMode = false;
    }
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.toastr.error('Por favor completa el nombre.', 'Error');
      return;
    }

    const params = {
      nombre: this.formulario.value.nombre,
      descripcion: 'descripcion igual', // Valor fijo
    };

    if (this.isEditMode) {
      // Si estamos en modo edición, actualizar el producto
      this.actualizarProducto(params);
    } else {
      // Si no, crear un nuevo producto
      this.crearTipoProducto(params);
    }
  }

  crearTipoProducto(params: any): void {

    this.tipoProductoService.crearTipoProductos(params).subscribe(
      (response) => {
        if (response.success) {
          this.toastr.success(response.message || 'Tipo de producto creado con éxito.', 'Éxito');
          this.formulario.reset();
        } else {
          this.toastr.error(response.message || 'No se pudo crear el producto.', 'Error');
        }
      },
      (error) => {
        this.toastr.error('Hubo un error al comunicarse con el servidor.', 'Error');
      }
    );
  }

  actualizarProducto(params: any): void {
    if (!this.producto || !this.producto.tipo_producto_id) {
      this.toastr.error('No se puede actualizar: el ID del producto no está definido.', 'Error');
      return;
    }

    const id = this.producto.tipo_producto_id; // Usar tipo_producto_id en lugar de id
    this.tipoProductoService.actualizarTipoproducto(id, params).subscribe(
      (response) => {
        if (response.success) {
          this.toastr.success(response.message || 'Producto actualizado con éxito.', 'Éxito');
          this.closePanel.emit(); // Cerrar el panel tras edición exitosa
        } else {
          this.toastr.error(response.message || 'No se pudo actualizar el producto.', 'Error');
        }
      },
      (error) => {
        console.error('Error en la petición:', error);
        const mensajeError = error.error?.detail || 'Hubo un error al actualizar el producto.';

        this.toastr.warning(mensajeError, 'Intente de nuevo');
        this.toastr.error('No se pudo actualizar.', 'Error', { enableHtml: true });

      }
    );
  }

  confirmarEliminacion(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        titulo: 'Confirmar eliminación',
        mensaje: '¿Estás seguro de que deseas eliminar este producto?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si el usuario confirmó, proceder con la eliminación
        if (this.producto) {
          this.eliminarProducto(this.producto.tipo_producto_id);
        }
      }
    });
  }

  eliminarProducto(id: number): void {
    this.tipoProductoService.Eliminar(id).subscribe(
      (response) => {
        if (response.success) {
          this.toastr.success( 'Producto eliminado con éxito.', 'Éxito');
          this.closePanel.emit(); // Cerrar el panel tras eliminación exitosa
        } else {
          this.toastr.error(response.message || 'No se pudo eliminar el producto.', 'Error');
        }
      },
      (error) => {
        const mensajeError = error.error?.detail || 'Hubo un error al eliminar el producto.';
        this.toastr.error(mensajeError, 'Error');
      }
    );
  }
  }



