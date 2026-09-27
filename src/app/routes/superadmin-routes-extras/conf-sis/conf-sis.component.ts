import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  catchError,
  distinctUntilChanged,
  finalize,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
  timer,
  timeout,
} from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FreshService, UsuarioReporte } from '../../services/fresh.service';
import { REPORT_DATE_FORMATS, ReportDateAdapter } from './report-date-adapter';

@Component({
  selector: 'app-conf-sis',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: ReportDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: REPORT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-BO' },
  ],
  templateUrl: './conf-sis.component.html',
  styleUrl: './conf-sis.component.scss',
})
export class ConfSisComponent implements OnInit, OnDestroy {
  private readonly zonaHoraria = 'America/La_Paz';
  readonly fechaMinima = '2022-01-01';
  readonly fechaMaxima: string;
  readonly fechaMinimaDate = new Date(2022, 0, 1);
  readonly fechaMaximaDate: Date;
  readonly fechas: FormGroup<{
    inicio: FormControl<Date | null>;
    fin: FormControl<Date | null>;
  }>;
  readonly vendedorControl = new FormControl<string | UsuarioReporte>('', {
    nonNullable: true,
  });

  infoSistema: any = {};
  vendedorSeleccionado: UsuarioReporte | null = null;
  vendedoresSugeridos: UsuarioReporte[] = [];
  generandoReporte = false;
  cargandoInfo = true;
  cargandoVendedores = false;
  errorVendedores = false;
  errorInfo = false;

  private readonly destruir$ = new Subject<void>();

  constructor(
    private service: FreshService,
    private toastr: ToastrService,
  ) {
    this.fechaMaxima = this.obtenerFechaBolivia(new Date());
    this.fechaMaximaDate = this.stringToDate(this.fechaMaxima)!;
    const inicioMes = `${this.fechaMaxima.slice(0, 7)}-01`;
    this.fechas = new FormGroup({
      inicio: new FormControl(this.stringToDate(inicioMes < this.fechaMinima ? this.fechaMinima : inicioMes), Validators.required),
      fin: new FormControl<Date | null>(this.fechaMaximaDate, Validators.required),
    });
  }

  ngOnInit(): void {
    this.cargarInfoSistema();
    this.configurarAutocompletado();
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  get fechaInicioMaxDate(): Date {
    const fin = this.fechas.controls.fin.value;
    return fin && fin < this.fechaMaximaDate ? fin : this.fechaMaximaDate;
  }

  get fechaFinMinDate(): Date {
    const inicio = this.fechas.controls.inicio.value;
    return inicio && inicio > this.fechaMinimaDate ? inicio : this.fechaMinimaDate;
  }

  get fechaInicio(): string {
    const value = this.fechas.controls.inicio.value;
    return value && Number.isFinite(value.getTime()) ? this.dateToISO(value) : '';
  }
  get fechaFin(): string {
    const value = this.fechas.controls.fin.value;
    return value && Number.isFinite(value.getTime()) ? this.dateToISO(value) : '';
  }

  get puedeGenerar(): boolean {
    return (
      !this.generandoReporte &&
      !!this.vendedorSeleccionado &&
      this.rangoValido(false)
    );
  }

  get busquedaTieneTexto(): boolean {
    const value = this.vendedorControl.value;
    return typeof value === 'string' && value.trim().length >= 2;
  }

  identificarUsuario(_index: number, usuario: UsuarioReporte): number {
    return usuario.usuario_id;
  }

  cargarInfoSistema(): void {
    this.cargandoInfo = true;
    this.errorInfo = false;
    this.service.obtenerInfoSistema().pipe(
      timeout(15000),
      takeUntil(this.destruir$),
      finalize(() => this.cargandoInfo = false),
    ).subscribe({
      next: (data) => {
        this.infoSistema = data || {};
      },
      error: () => {
        this.errorInfo = true;
      },
    });
  }

  mostrarVendedor(value: string | UsuarioReporte | null): string {
    return typeof value === 'string' ? value : value?.nombre || '';
  }

  seleccionarVendedor(event: MatAutocompleteSelectedEvent): void {
    const vendedor = event.option.value as UsuarioReporte;
    this.vendedorSeleccionado = vendedor;
    this.vendedoresSugeridos = [vendedor];
  }

  limpiarVendedor(event?: MouseEvent): void {
    event?.stopPropagation();
    this.vendedorSeleccionado = null;
    this.vendedorControl.setValue('');
  }

  generarReporte(): void {
    if (this.generandoReporte) return;
    if (!this.rangoValido(true)) return;
    if (!this.vendedorSeleccionado) {
      this.toastr.warning(
        'Seleccione un vendedor de la lista de sugerencias.',
        'Atención',
      );
      return;
    }

    const vendedor = this.vendedorSeleccionado;
    const fechaInicio = this.fechaInicio;
    const fechaFin = this.fechaFin;
    this.generandoReporte = true;
    this.service
      .generarReporteVentas(
        fechaInicio,
        fechaFin,
        vendedor.usuario_id,
      )
      .pipe(timeout(60000), takeUntil(this.destruir$), finalize(() => (this.generandoReporte = false)))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const enlace = document.createElement('a');
          const nombre = vendedor.nombre
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');

          enlace.href = url;
          enlace.download =
            `Reporte_Ventas_${nombre || vendedor.usuario_id}_` +
            `${fechaInicio}_a_${fechaFin}.pdf`;
          document.body.appendChild(enlace);
          enlace.click();
          enlace.remove();
          window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
          this.toastr.success('Reporte generado correctamente.', 'Éxito');
        },
        error: (err) => {
          this.mostrarErrorReporte(err);
        },
      });
  }

  private mostrarErrorReporte(err: any): void {
    const cuerpo = err?.error;

    if (cuerpo instanceof Blob) {
      cuerpo
        .text()
        .then((texto: string) => {
          try {
            const data = JSON.parse(texto);
            this.toastr.error(
              data?.message || 'No se pudo generar el reporte de ventas.',
              'Error',
            );
          } catch {
            this.toastr.error(
              texto || 'No se pudo generar el reporte de ventas.',
              'Error',
            );
          }
        })
        .catch(() => {
          this.toastr.error('No se pudo generar el reporte de ventas.', 'Error');
        });
      return;
    }

    this.toastr.error(
      err?.error?.message || 'No se pudo generar el reporte de ventas.',
      'Error',
    );
  }

  private configurarAutocompletado(): void {
    this.vendedorControl.valueChanges
      .pipe(
        startWith(this.vendedorControl.value),
        distinctUntilChanged(),
        tap((value) => {
          if (typeof value === 'string') this.vendedorSeleccionado = null;
          this.vendedoresSugeridos = [];
          this.errorVendedores = false;
        }),
        switchMap((value) => {
          this.cargandoVendedores = false;
          if (value && typeof value === 'object') {
            return of([value]);
          }
          const texto = typeof value === 'string' ? value.trim() : '';
          if (texto.length < 2) return of([]);
          this.cargandoVendedores = true;
          // Cancela la petición anterior inmediatamente; consulta al terminar de escribir.
          return timer(250).pipe(switchMap(() => this.consultarVendedores(texto)));
        }),
        takeUntil(this.destruir$),
      )
      .subscribe((vendedores) => {
        if (!this.vendedorSeleccionado) {
          this.vendedoresSugeridos = vendedores;
        }
      });
  }

  private consultarVendedores(busqueda: string): Observable<UsuarioReporte[]> {
    this.cargandoVendedores = true;
    this.errorVendedores = false;
    return this.service
      .buscarUsuariosReporte(busqueda)
      .pipe(
        timeout(15000),
        catchError(() => {
          this.errorVendedores = true;
          return of([]);
        }),
        finalize(() => (this.cargandoVendedores = false)),
      );
  }

  private rangoValido(mostrarMensaje: boolean): boolean {
    const avisar = (mensaje: string) => {
      if (mostrarMensaje) this.toastr.warning(mensaje, 'Atención');
      return false;
    };
    const formato = /^\d{4}-\d{2}-\d{2}$/;

    if (!this.fechaInicio || !this.fechaFin) {
      return avisar('Debe seleccionar un rango de fechas.');
    }
    if (this.fechas.invalid) {
      return avisar('Revisa las fechas: usa dd/mm/aaaa y un rango entre 01/01/2022 y hoy.');
    }
    if (!formato.test(this.fechaInicio) || !formato.test(this.fechaFin)) {
      return avisar('Las fechas seleccionadas no son válidas.');
    }
    if (this.fechaInicio < this.fechaMinima) {
      return avisar('La fecha Desde no puede ser anterior al 01/01/2022.');
    }
    if (
      this.fechaInicio > this.fechaMaxima ||
      this.fechaFin > this.fechaMaxima
    ) {
      return avisar('No se pueden seleccionar fechas posteriores a hoy.');
    }
    if (this.fechaInicio > this.fechaFin) {
      return avisar('La fecha Desde no puede ser posterior a la fecha Hasta.');
    }
    return true;
  }

  private obtenerFechaBolivia(fecha: Date): string {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: this.zonaHoraria,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(fecha);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((item) => item.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  }

  private stringToDate(valor: string): Date | null {
    if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
    const [year, month, day] = valor.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private dateToISO(fecha: Date): string {
    const pad = (x: number) => String(x).padStart(2, '0');
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(
      fecha.getDate(),
    )}`;
  }
}
