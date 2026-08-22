import {
  Component,
  ViewChild,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSidenavContent, MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Observable, Subject } from 'rxjs';
import { FreshService } from '../services/fresh.service';
import { ToastrService } from 'ngx-toastr';
import { MatFormField } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SocketService } from '../services/sockets.service';
import { skip, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  imports: [
    MatSidenavModule,
    CommonModule,
    RouterModule,
    MatSidenavContent,
    MatToolbarModule,
    MatIconModule,
    MatFormField,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FlexLayoutModule,
  ],
  styleUrls: ['./ventas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class VentasComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('sideNav') sideNav!: MatSidenav;

  private destroy$ = new Subject<void>();
  private keydownHandler!: (e: KeyboardEvent) => void;

  productos: any[] = [];
  productosFiltrados: any[] = [];
  tiposProducto: any[] = [];
  tipoSeleccionado: number | null = null;
  filtroNombre: string = '';

  carrito: any[] = [];
  ventaId: number | null = null;
  baseUrl: string = environment.apiUrl;
  codigoBarrasActual: string = '';
  escaneando: boolean = false;
  tiempoLimiteEscaneo = 500;
  timeout: any;
  ventaJson: any = { ventaId: null, productos: [], usuarioId: null };

  pagoAbierto: boolean = false;
  metodosPago: Array<{ id: number; nombre: string; activo: boolean }> = [];
  metodoSeleccionado: { id: number; nombre: string } | null = null;
  pagoPayloadPreview: any | null = null;

  // Flags
  isRegistrandoPago = false;
  isConfirmandoVenta = false;
  productosProcesados = false;

  modoSidenav: 'over' | 'side' = 'side';
  esMovil = false;
  sidenavElement!: HTMLElement;

  constructor(
    private productosService: FreshService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private breakpointObserver: BreakpointObserver,
    private socketService: SocketService
  ) {}

  /** Normaliza cualquier respuesta a array:
   *  - [ ... ]
   *  - { result: [...] }
   *  - { data: [...] } | { items: [...] } | { rows: [...] }
   *  - { content: [...] } | { results: [...] }
   */
  private asArray<T = any>(res: any): T[] {
    if (Array.isArray(res)) return res as T[];
    if (res?.result && Array.isArray(res.result)) return res.result as T[];
    if (res?.data && Array.isArray(res.data)) return res.data as T[];
    if (res?.items && Array.isArray(res.items)) return res.items as T[];
    if (res?.rows && Array.isArray(res.rows)) return res.rows as T[];
    if (res?.content && Array.isArray(res.content)) return res.content as T[];
    if (res?.results && Array.isArray(res.results)) return res.results as T[];
    // Si vino un objeto único, devuelvo [obj] para no romper map()
    if (res && typeof res === 'object') return [res as T];
    return [];
  }

  private mapProducto(producto: any) {
  // imagen
  let imagen = producto?.imagen_url || producto?.imagen || null;
  if (!imagen) {
    imagen = 'assets/noimg.png';
  } else {
    imagen = `${this.baseUrl}${String(imagen).startsWith('/') ? String(imagen).slice(1) : imagen}`;
  }

  // 👇 calcula total_cantidad con más aliases y con fallback a sumar lotes si vienen embebidos
  let total_cantidad =
    producto?.total_cantidad ??
    producto?.stock_disponible ??     // alias típico en vistas
    producto?.existencias ??          // alias común
    producto?.stock ??                // lo que veías en Inventario
    producto?.cantidad_total ??
    producto?.cantidad ??
    0;

  if ((!Number.isFinite(total_cantidad) || total_cantidad === 0) && Array.isArray(producto?.lotes)) {
    total_cantidad = producto.lotes.reduce(
      (acc: number, l: any) => acc + Number(l?.cantidad || 0),
      0
    );
  }

  const precio_fifo =
    producto?.precio_fifo ??
    producto?.precio_venta ??
    producto?.precio ??
    0;

  return {
    ...producto,
    imagen_url: imagen,
    total_cantidad: Number(total_cantidad || 0),
    precio_fifo: Number(precio_fifo || 0),
    producto_id: producto?.producto_id ?? producto?.id ?? producto?.codigo ?? null,
    tipo_producto_id: producto?.tipo_producto_id ?? null,
    tipo_producto_nombre: producto?.tipo_producto_nombre ?? producto?.tipo ?? null,
    nombre: producto?.nombre ?? producto?.descripcion ?? 'Producto',
  };
}


  ngOnInit(): void {
    this.obtenerTiposProducto();
    this.cargarProductos();

    // Guardar referencia del handler para removerlo
    this.keydownHandler = this.onBarcodeScan.bind(this);
    document.addEventListener('keydown', this.keydownHandler);

    // socket...
    this.socketService.codigoEscaneado$
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe((codigo) => {
        if (codigo && this.ventaId !== null) {
          this.detectarCodigoBarras(codigo);
        }
      });
  }

  ngAfterViewInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        queueMicrotask(() => {
          this.esMovil = result.matches;
          this.modoSidenav = this.esMovil ? 'over' : 'side';
          this.cdr.markForCheck();
        });
      });

    this.sidenavElement = document.querySelector('.sidenav') as HTMLElement;
    if (this.sidenavElement) {
      const resizeObserver = new ResizeObserver(() => {
        this.forceResize();
      });
      resizeObserver.observe(this.sidenavElement);
    }

    setTimeout(() => this.forceResize(), 0);
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.keydownHandler);
    this.destroy$.next();
    this.destroy$.complete();
  }

  forceResize(): void {
    window.dispatchEvent(new Event('resize'));
  }

  // 🔹 Obtener todos los productos
  cargarProductos(): void {
    this.productosService
      .listarProductosinfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const arr = this.asArray(data);
          this.productos = arr.map((p: any) => this.mapProducto(p));
          this.filtrarProductos();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error al listar productos:', err);
          this.toastr.error('No se pudieron cargar los productos.', 'Error');
          this.productos = [];
          this.productosFiltrados = [];
          this.cdr.markForCheck();
        },
      });
  }

  // 🔹 Filtrar productos según el tipo y el nombre
  filtrarProductos(): void {
    const nombre = this.filtroNombre.trim().toLowerCase();
    this.productosFiltrados = this.productos.filter((producto) => {
      const coincideTipo =
        this.tipoSeleccionado === null || producto.tipo_producto_id === this.tipoSeleccionado;
      const coincideNombre = nombre === '' || (producto.nombre || '').toLowerCase().includes(nombre);
      return coincideTipo && coincideNombre;
    });
    this.cdr.markForCheck();
  }

  // 🔹 Obtener la lista de tipos de producto
  obtenerTiposProducto(): void {
    this.productosService
      .listarTipoproductos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const lista = this.asArray(response?.result ?? response);
          // agrega "Todos"
          this.tiposProducto = [{ tipo_producto_id: null, nombre: 'Todos' }, ...lista];
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error al listar tipos de producto:', err);
          this.tiposProducto = [{ tipo_producto_id: null, nombre: 'Todos' }];
          this.cdr.markForCheck();
        },
      });
  }

  iniciarVenta(): void {
    const usuarioData = sessionStorage.getItem('user');
    if (!usuarioData) {
      this.toastr.warning('No se encontró el usuario en sesión.', 'Sesión');
      return;
    }

    const usuario = JSON.parse(usuarioData);
    if (!usuario?.usuario_id) {
      this.toastr.warning('El usuario en sesión es inválido.', 'Sesión');
      return;
    }

    const params = {
      gerenteId: null, // SP resolverá Cliente Genérico si aplica
      usuarioId: Number(usuario.usuario_id),
    };

    this.productosService
      .IniciarVenta(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const ventaId = (response?.ventaId ?? response?.result?.ventaId ?? response?.data?.ventaId) ?? null;
          queueMicrotask(() => {
            this.ventaId = ventaId;
            if (!this.ventaId) {
              this.toastr.error('No se pudo iniciar la venta.', 'Error');
            }
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          console.error('Error al iniciar venta:', err);
          this.toastr.error('No se pudo iniciar la venta.', 'Error');
        },
      });
  }

  onBarcodeScan(event: KeyboardEvent): void {
    if (this.pagoAbierto) return;
    if (this.ventaId === null) return;

    if (event.key === 'Enter') {
      if (this.codigoBarrasActual.trim() !== '') {
        this.detectarCodigoBarras(this.codigoBarrasActual);
        this.codigoBarrasActual = '';
      }
    } else {
      if (!this.escaneando) {
        this.codigoBarrasActual = '';
        this.escaneando = true;
      }
      this.codigoBarrasActual += event.key;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.escaneando = false;
      }, this.tiempoLimiteEscaneo);
    }
  }

  detectarCodigoBarras(codigoBarras: string): void {
    this.productosService
      .listarLotesByCB(codigoBarras)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (productoEscaneado) => {
          const arr = this.asArray(productoEscaneado);
          if (!arr.length) return;

          const productoIdEscaneado = arr[0]?.producto_id ?? arr[0]?.id ?? null;
          const productoEncontrado = this.productos.find((p) => p.producto_id === productoIdEscaneado);
          if (!productoEncontrado) return;

          if (productoEncontrado.total_cantidad > 0) {
            productoEncontrado.codigo_barras = codigoBarras;
            this.agregarAlCarrito(productoEncontrado);
          } else {
            this.toastr.warning('No puedes agregar más unidades de este producto', 'Stock agotado');
          }
        },
        error: (err) => {
          console.error('❌ Error al obtener el producto por código de barras:', err);
          this.toastr.error('No se pudo leer el producto por código de barras.', 'Error');
        },
      });
  }

  actualizarVentaJson(): void {
    if (!this.ventaId) return;

    const usuarioId = Number(JSON.parse(sessionStorage.getItem('user') || '{}').usuario_id) || null;

    this.ventaJson = {
      ventaId: this.ventaId,
      productos: this.carrito
        .filter((item) => item.codigo_barras)
        .map((item) => ({
          codigoBarras: String(item.codigo_barras),
          cantidad: Number(item.cantidad),
        })),
      usuarioId,
    };
  }

  agregarAlCarrito(producto: any): void {
    if (this.pagoAbierto) {
      this.toastr.info('Cierra el cobro antes de agregar productos.');
      return;
    }
    if (!this.ventaId) {
      this.toastr.warning('Inicia una venta antes de agregar productos.', 'Venta no iniciada');
      return;
    }

    if (typeof producto === 'number') {
      producto = this.productos.find((p) => p.producto_id === producto);
    }
    if (!producto || !producto.producto_id) {
      this.toastr.error('No se pudo obtener el ID del producto.', 'Error');
      return;
    }

    if ((producto.total_cantidad ?? 0) <= 0) {
      this.toastr.warning('No puedes agregar más unidades de este producto', 'Límite alcanzado');
      return;
    }

    const productoEnCarrito = this.carrito.find((p) => p.producto_id === producto.producto_id);
    if (productoEnCarrito) {
      productoEnCarrito.cantidad += 1;
    } else {
      if (producto.codigo_barras) {
        this.carrito.push({
          producto_id: producto.producto_id,
          nombre: producto.nombre,
          imagen_url: producto.imagen_url,
          codigo_barras: producto.codigo_barras,
          precio_fifo: producto.precio_fifo || producto.precio_venta || 0,
          cantidad: 1,
        });
      } else {
        this.productosService
          .listarLotesById(producto.producto_id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (lotes) => {
              const lotesArr = this.asArray(lotes);
              const loteValido = [...lotesArr].reverse().find((l: any) => (l?.cantidad ?? 0) > 0) || null;
              if (loteValido?.codigo_barras) {
                this.carrito.push({
                  producto_id: producto.producto_id,
                  nombre: producto.nombre,
                  imagen_url: producto.imagen_url,
                  codigo_barras: String(loteValido.codigo_barras),
                  precio_fifo: producto.precio_fifo || producto.precio_venta || 0,
                  cantidad: 1,
                });
                this.actualizarVentaJson();
                this.cdr.markForCheck();
              } else {
                this.toastr.warning('Sin stock disponible para este producto', 'Stock Agotado');
              }
            },
            error: (err) => {
              console.error('❌ Error al obtener lotes:', err);
              this.toastr.error('Error al obtener lotes del producto', 'Error');
            },
          });
      }
    }

    // Reducir stock visualmente
    producto.total_cantidad = Math.max(0, Number(producto.total_cantidad || 0) - 1);

    this.actualizarVentaJson();
    this.cdr.markForCheck();
  }

  restarDelCarrito(producto: any): void {
    if (this.pagoAbierto) {
      this.toastr.info('Cierra el cobro antes de quitar productos.');
      return;
    }

    const productoEnCarrito = this.carrito.find((p) => p.producto_id === producto.producto_id);
    if (productoEnCarrito) {
      productoEnCarrito.cantidad -= 1;

      const productoEnCards = this.productos.find((p) => p.producto_id === producto.producto_id);
      if (productoEnCards) {
        productoEnCards.total_cantidad = Number(productoEnCards.total_cantidad || 0) + 1;
      }

      if (productoEnCarrito.cantidad <= 0) {
        this.carrito = this.carrito.filter((p) => p.producto_id !== producto.producto_id);
      }
    }

    this.actualizarVentaJson();
    this.cdr.markForCheck();
  }

  abrirPago(): void {
    queueMicrotask(() => {
      this.pagoAbierto = true;
      this.metodoSeleccionado = null;
      this.cdr.markForCheck();
    });

    this.productosService
      .listarMetPago()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          const arr = this.asArray(resp);
          // si viene {id, nombre, activo}
          this.metodosPago = arr
            .map((m: any) => ({
              id: Number(m?.id ?? m?.metodo_pago_id ?? m?.codigo ?? 0),
              nombre: String(m?.nombre ?? m?.descripcion ?? 'Método'),
              activo: Boolean(m?.activo ?? true),
            }))
            .filter((m: any) => m.activo);
          this.cdr.markForCheck();
        },
        error: () => {
          this.metodosPago = [];
          this.toastr.error('No se pudieron cargar los métodos de pago', 'Error');
          this.cdr.markForCheck();
        },
      });
  }

  cerrarPago(): void {
    queueMicrotask(() => {
      this.pagoAbierto = false;
      this.cdr.markForCheck();
    });
  }

  seleccionarMetodo(m: { id: number; nombre: string }): void {
    this.metodoSeleccionado = m;
    const total = this.calcularTotal();
    const monto = total.toFixed(2);
    const ts = Date.now().toString().slice(-6);
    const tag = (m.nombre || 'MET').toUpperCase().slice(0, 3);

    this.pagoPayloadPreview = {
      ventaId: this.ventaId,
      metodoPagoId: m.id,
      monto,
      referencia: `${tag}-${ts}`,
      observaciones: `auto:${m.nombre}; total=${monto}; ts=${new Date().toISOString()}`,
    };
    this.cdr.markForCheck();
  }

  private formatearMonto(total: number): string {
    return (total || 0).toFixed(2);
  }
  private generarReferenciaAuto(nombreMetodo: string): string {
    const ts = Date.now().toString().slice(-6);
    const tag = nombreMetodo?.toUpperCase().slice(0, 3) || 'MET';
    return `${tag}-${ts}`;
  }
  private generarObservacionesAuto(nombreMetodo: string, total: number): string {
    const iso = new Date().toISOString();
    return `auto:${nombreMetodo}; total=${this.formatearMonto(total)}; ts=${iso}`;
  }

  get payloadPreview(): any | null {
    if (!this.ventaId || !this.metodoSeleccionado) return null;
    const total = this.calcularTotal();
    return {
      ventaId: this.ventaId,
      metodoPagoId: this.metodoSeleccionado.id,
      monto: this.formatearMonto(total),
      referencia: this.generarReferenciaAuto(this.metodoSeleccionado.nombre),
      observaciones: this.generarObservacionesAuto(this.metodoSeleccionado.nombre, total),
    };
  }

  finalizarVenta(): void {
    if (!this.ventaId) return;

    this.productosService
      .procesarProductos(this.ventaJson)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const confirmarVentaBody = { ventaId: this.ventaId };
          this.productosService
            .confirmarVenta(confirmarVentaBody)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.toastr.success('Venta realizada con éxito', 'Éxito');
                this.carrito = [];
                this.ventaId = null;
                this.ventaJson = { ventaId: null, productos: [], usuarioId: null };
                this.cdr.markForCheck();
              },
              error: (err) => {
                console.error('Error al confirmar la venta:', err);
                this.toastr.error('Error al confirmar la venta', 'Error');
              },
            });
        },
        error: (err) => {
          console.error('Error al procesar los productos de la venta:', err);
          this.toastr.error('No se pudieron procesar los productos de la venta', 'Error');
        },
      });
  }

  calcularTotal(): number {
    return this.carrito.reduce(
      (total, item) => total + Number(item.cantidad || 0) * Number(item.precio_fifo || 0),
      0
    );
  }

  limpiarFiltros(): void {
    this.tipoSeleccionado = null;
    this.filtroNombre = '';
    this.filtrarProductos();
  }

  private async prepararVentaAntesDeCobrar(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.productosProcesados) {
        resolve();
        return;
      }
      this.actualizarVentaJson();
      if (
        !this.ventaJson ||
        !Array.isArray(this.ventaJson.productos) ||
        this.ventaJson.productos.length === 0
      ) {
        resolve();
        return;
      }

      this.productosService
        .procesarProductos(this.ventaJson)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.productosProcesados = true;
            this.cdr.markForCheck();
            resolve();
          },
          error: (err) => {
            console.error('❌ Error al procesar productos antes de cobrar:', err);
            this.toastr.error('No se pudieron preparar los productos para el cobro.', 'Error');
            reject(err);
          },
        });
    });
  }

  private validarAntesDeRegistrarPago(): boolean {
    if (!this.pagoAbierto) {
      this.toastr.info('Abre el panel de cobro para registrar el pago.');
      return false;
    }
    if (!this.ventaId) {
      this.toastr.warning('No hay una venta activa.', 'Venta no iniciada');
      return false;
    }
    if (!this.metodoSeleccionado) {
      this.toastr.info('Selecciona un método de pago.');
      return false;
    }
    if (!this.pagoPayloadPreview) {
      this.toastr.info('El payload de pago no está listo.');
      return false;
    }
    if (this.carrito.length === 0 || this.calcularTotal() <= 0) {
      this.toastr.warning('No hay productos en el carrito para cobrar.', 'Carrito vacío');
      return false;
    }
    return true;
  }

  async registrarPagoYConfirmar(): Promise<void> {
    if (!this.validarAntesDeRegistrarPago()) return;

    this.isRegistrandoPago = true;
    this.cdr.markForCheck();

    try {
      await this.prepararVentaAntesDeCobrar();

      const body = { ...this.pagoPayloadPreview };
      this.productosService
        .registrarMetPago(body)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.confirmarVentaSolo();
          },
          error: (err) => {
            console.error('❌ Error al registrar pago:', err);
            this.toastr.error('No se pudo registrar el pago.', 'Error');
          },
          complete: () => {
            this.isRegistrandoPago = false;
            this.cdr.markForCheck();
          },
        });
    } catch (_) {
      this.isRegistrandoPago = false;
      this.cdr.markForCheck();
    }
  }

  confirmarVentaSolo(): void {
    if (!this.ventaId) {
      this.toastr.warning('No hay una venta activa para confirmar.', 'Atención');
      return;
    }

    this.isConfirmandoVenta = true;
       this.cdr.markForCheck();

    const body = { ventaId: this.ventaId };
    this.productosService
      .confirmarVenta(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Venta confirmada con éxito. ¡Gracias!', 'Éxito');

          this.carrito = [];
          this.ventaId = null;
          this.ventaJson = { ventaId: null, productos: [], usuarioId: null };
          this.productosProcesados = false;

          this.metodoSeleccionado = null;
          this.pagoPayloadPreview = null;
          this.pagoAbierto = false;

          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error al confirmar la venta:', err);
          this.toastr.error(
            'El pago fue registrado, pero la venta no se confirmó. Reintenta confirmar.',
            'Atención'
          );
        },
        complete: () => {
          this.isConfirmandoVenta = false;
          this.cdr.markForCheck();
        },
      });
  }

  // útil para *ngFor trackBy
  trackById = (_: number, item: any) => item?.producto_id ?? item?.id ?? _;
}
