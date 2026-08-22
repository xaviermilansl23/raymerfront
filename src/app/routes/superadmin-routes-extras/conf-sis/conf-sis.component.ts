import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FreshService } from '../../services/fresh.service';

@Component({
  selector: 'app-conf-sis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './conf-sis.component.html',
  styleUrl: './conf-sis.component.scss'
})
export class ConfSisComponent {

  fechaInicio: string = '';
  fechaFin: string = '';
  infoSistema: any = {};

  constructor(
    private service: FreshService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarInfoSistema();
  }

  cargarInfoSistema(): void {
    this.service.obtenerInfoSistema().subscribe({
      next: (data) => {
        this.infoSistema = data;
      },
      error: () => {
        this.toastr.error('No se pudo cargar la información del sistema.', 'Error');
      }
    });
  }

  generarReporte(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      this.toastr.warning('Debe seleccionar un rango de fechas.', 'Atención');
      return;
    }

    this.service.generarReporteVentas(this.fechaInicio, this.fechaFin).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Ventas_${this.fechaInicio}_a_${this.fechaFin}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastr.success('Reporte generado correctamente.', 'Éxito');
      },
      error: () => {
        this.toastr.error('No se pudo generar el reporte de ventas.', 'Error');
      }
    });
  }
}

