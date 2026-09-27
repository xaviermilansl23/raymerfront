import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { FreshService } from '../../../services/fresh.service';
import { ToastrService } from 'ngx-toastr';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ScannerComponent } from './scanner/scanner.component';
import { ScannerSyncService } from './scanner/scanner-sync.service';

@Component({
  selector: 'app-dialog-lotes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,
    ZXingScannerModule,
  ],
  templateUrl: './dialog-lotes.component.html',
  styleUrls: ['./dialog-lotes.component.scss'],
})
export class DialogLotesComponent implements OnInit, OnDestroy {
  loteForm: FormGroup;
  esEdicion = false;
  proveedores: Array<{
    proveedor_id: number;
    nombre: string;
    nit?: string;
    estado?: 'A' | 'I';
  }> = [];
  private scanSub?: Subscription;

  constructor(
    public dialogRef: MatDialogRef<DialogLotesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, // { productoId } o { lote }
    private fb: FormBuilder,
    private freshService: FreshService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private sync: ScannerSyncService,
  ) {
    this.loteForm = this.fb.group({
      proveedorId: [null],
      codigoBarras: ['', [Validators.required, Validators.maxLength(60)]],
      precioCompra: ['', [Validators.required, Validators.min(0.01)]],
      precioVenta: ['', [Validators.required, Validators.min(0.01)]],
      cantidad: ['', [Validators.required, Validators.min(1)]],
    });

    // Si viene lote → modo edición
    if (this.data?.lote) {
      this.esEdicion = true;
      const l = this.data.lote;
      this.loteForm.patchValue({
        proveedorId: l?.proveedor_id ?? null,
        codigoBarras: l?.codigo_barras ?? '',
        precioCompra: l?.precio_compra ?? '',
        precioVenta: l?.precio_venta ?? '',
        cantidad: l?.cantidad ?? '',
      });
    }
  }

  ngOnInit(): void {
    this.cargarProveedores();

    // Escucha de código escaneado
    this.scanSub = this.sync.codigo$.subscribe((codigo) => {
      if (codigo) {
        this.loteForm.get('codigoBarras')?.setValue(codigo);
        this.toastr.info(`📦 Código escaneado: ${codigo}`, 'Éxito');
        this.sync.reset();
      }
    });
  }

  private cargarProveedores(): void {
    this.freshService
      .listarProveedores({ estado: this.esEdicion ? 'TODOS' : 'A' })
      .subscribe({
        next: (rows) => {
          this.proveedores = Array.isArray(rows) ? rows : [];
        },
        error: () => {
          this.proveedores = [];
          this.toastr.error('No se pudieron cargar los proveedores.', 'Error');
        },
      });
  }

  ngOnDestroy(): void {
    this.scanSub?.unsubscribe();
  }

  // ---------- Helpers ----------
  private sanitizeBarcode(raw: any): string {
    return String(raw ?? '')
      .trim()
      .replace(/\s+/g, '')
      .replace(/[^\dA-Za-z]/g, '');
  }

  private extractMessage(resp: any, fallback = ''): string {
    const candidates = [
      resp?.message,
      resp?.mensaje,
      resp?.response,
      resp?.sp_crear_lote,
      resp?.sp_editar_lote,
      resp?.error?.message,
    ];
    const raw =
      candidates.find((v) => typeof v === 'string' && v.trim().length > 0) ??
      '';
    const clean = raw.replace(/^Error:\s*/i, '').trim();
    return clean || fallback;
  }

  private extractSuccess(resp: any, fallback = false): boolean {
    const check = (v: any): boolean | undefined => {
      if (typeof v === 'boolean') return v;
      if (typeof v === 'string') {
        if (v.toLowerCase() === 'true') return true;
        if (v.toLowerCase() === 'false') return false;
      }
      if (typeof v === 'number') return v !== 0;
      return undefined;
    };
    const val =
      check(resp?.success) ??
      check(resp?.ok) ??
      (typeof resp?.response === 'string'
        ? !/error/i.test(resp.response)
        : undefined);
    return val ?? fallback;
  }

  // ---------- UI actions ----------
  abrirEscaner(): void {
    this.dialog.open(ScannerComponent, { width: '100%', maxWidth: '420px' });
  }

  // CREAR
  guardarLote(): void {
    if (this.loteForm.invalid) {
      this.loteForm.markAllAsTouched();
      this.toastr.error(
        'Por favor, completa todos los campos correctamente.',
        'Error',
      );
      return;
    }

    if (!this.data?.productoId) {
      this.toastr.error(
        'No se recibió el productoId para crear el lote.',
        'Error',
      );
      return;
    }

    const nuevoLote = {
      productoId: Number(this.data.productoId),
      proveedorId: this.loteForm.value.proveedorId
        ? Number(this.loteForm.value.proveedorId)
        : null,
      codigoBarras: this.sanitizeBarcode(this.loteForm.value.codigoBarras),
      precioCompra: parseFloat(this.loteForm.value.precioCompra),
      precioVenta: parseFloat(this.loteForm.value.precioVenta),
      cantidad: parseInt(this.loteForm.value.cantidad, 10),
    };

    this.freshService.crearLotes(nuevoLote).subscribe({
      next: (response: any) => {
        const ok = this.extractSuccess(response, true);
        const msg = this.extractMessage(
          response,
          ok ? 'Lote creado.' : 'No se creó el lote.',
        );
        if (ok) {
          this.toastr.success('Lote creado exitosamente', 'Éxito');
          this.dialogRef.close('success');
        } else {
          this.toastr.warning(msg, 'Cuidado');
        }
      },
      error: (error) => {
        console.error('Error al crear el lote:', error);
        const msg = this.extractMessage(
          error,
          'Hubo un error inesperado al crear el lote.',
        );
        this.toastr.error(msg, 'Error');
      },
    });
  }

  // EDITAR
  actualizarLote(): void {
    if (this.loteForm.invalid) {
      this.loteForm.markAllAsTouched();
      this.toastr.error(
        'Por favor, completa todos los campos correctamente.',
        'Error',
      );
      return;
    }

    const loteId = this.data?.lote?.lote_id;
    if (!loteId) {
      this.toastr.error('No se encontró el ID del lote para editar.', 'Error');
      return;
    }

    const loteActualizado = {
      proveedorId: this.loteForm.value.proveedorId
        ? Number(this.loteForm.value.proveedorId)
        : null,
      codigoBarras: this.sanitizeBarcode(this.loteForm.value.codigoBarras),
      precioCompra: parseFloat(this.loteForm.value.precioCompra),
      precioVenta: parseFloat(this.loteForm.value.precioVenta),
      cantidad: parseInt(this.loteForm.value.cantidad, 10),
    };

    this.freshService.actualizarLote(loteId, loteActualizado).subscribe({
      next: (response: any) => {
        const ok = this.extractSuccess(response, true);
        const msg = this.extractMessage(
          response,
          ok ? 'Lote actualizado.' : 'No se actualizó el lote.',
        );
        if (ok) {
          this.toastr.success(msg, 'Éxito');
          this.dialogRef.close('success');
        } else {
          this.toastr.warning(msg, 'Cuidado');
        }
      },
      error: (error) => {
        console.error('Error al actualizar el lote:', error);
        const msg = this.extractMessage(
          error,
          'Hubo un error inesperado al actualizar el lote.',
        );
        this.toastr.error(msg, 'Error');
      },
    });
  }

  // Cerrar sin guardar
  cancelar(): void {
    this.dialogRef.close();
  }
}
