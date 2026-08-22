import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FreshService } from '../../services/fresh.service';
import { MatCard } from '@angular/material/card';
import { MatCardTitle } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';


@Component({
  selector: 'app-categorias',
  imports: [
    MatCard,
    MatCardTitle,
    CommonModule,
    MatButton
  ],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss'
})
export class CategoriasComponent implements OnInit {
  tipoProductos: any[] = []; // Lista de productos

  @Output() abrirFormulario = new EventEmitter<void>(); // Evento para abrir el formulario
  @Output() productoSeleccionado = new EventEmitter<any>(); // Evento para emitir el producto seleccionado

  constructor(private tipoProductoService: FreshService) {}

  ngOnInit(): void {
    this.obtenerTipoProductos();
  }

  obtenerTipoProductos(): void {
    this.tipoProductoService.listarTipoproductos().subscribe(
      (data: any) => {
        this.tipoProductos = data.result; // Cargar los productos
      },
      (error) => {
        console.error('Error al obtener los tipos de productos:', error);
      }
    );
  }

  abrirPanelFormulario(): void {
    this.abrirFormulario.emit();
  }

  seleccionarProducto(producto: any): void {
    this.productoSeleccionado.emit(producto); // Emitir los datos del producto seleccionado
  }
}
