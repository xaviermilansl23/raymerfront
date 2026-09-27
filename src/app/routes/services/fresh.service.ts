import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { expand, map, reduce } from 'rxjs/operators';

export interface VendedorVentas {
  usuario_id: number;
  nombre: string;
  usuario: string;
  ci: string | null;
  cantidad_ventas: number;
  total_ventas: number;
}

export type UsuarioReporte = Pick<VendedorVentas, 'usuario_id' | 'nombre' | 'usuario' | 'ci'>;

@Injectable({
  providedIn: 'root',
})
export class FreshService {
  // URL base del backend (p.ej. http://localhost:3000/ )
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Construye URL asegurando que haya exactamente una "/" entre base y endpoint */
  private u(endpoint: string): string {
    const b = this.baseUrl.endsWith('/')
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
    const e = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${b}/${e}`;
  }

  /**
   * Estado del sistema (activo/bloqueado) para el home.
   * La información viene de la configuración del sistema (config-sis/info).
   */
  listarEstadoPagoADmin(): Observable<any> {
    return this.http.get(this.u('config-sis/info')).pipe(
      map((res: any) => {
        const estado = res?.estado_sistema ?? 'ACTIVO';
        return {
          estado_pago: estado,
          mensaje_bloqueo:
            estado === 'ACTIVO'
              ? ''
              : 'El sistema se encuentra bloqueado. Comuníquese con el administrador.',
          dias_restantes: null,
          fecha_vencimiento: null,
          nombre_empresa: res?.nombre_empresa,
          logo_url: res?.logo_url,
        };
      }),
    );
  }

  // =========================================================
  // 🧑‍💼 USUARIOS
  // =========================================================
  listarusuarios(): Observable<any> {
    return this.http.get(this.u('usuarios'));
  }

  listarusuariosRol(): Observable<any> {
    return this.http.get(this.u('usuarios/con-rol'));
  }

  crearUsuario(params: any): Observable<any> {
    return this.http.post(this.u('usuarios'), params);
  }

  actualizarUsuario(id: number, params: any): Observable<any> {
    return this.http.patch(this.u(`usuarios/${id}`), params);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(this.u(`usuarios/${id}`));
  }

  asignarRol(params: any): Observable<any> {
    return this.http.post(this.u('usuario-roles/asignar-rol'), params);
  }

  // =========================================================
  // ⚙️ ROLES
  // =========================================================
  listarRoles(): Observable<any> {
    return this.http.get(this.u('roles'));
  }

  // =========================================================
  // 📦 CATEGORÍAS
  // =========================================================
  listarTipoproductos(): Observable<any> {
    return this.http.get(this.u('tipo-producto'));
  }

  crearTipoProductos(params: any): Observable<any> {
    return this.http.post(this.u('tipo-producto'), params);
  }

  actualizarTipoproducto(id: number, params: any): Observable<any> {
    return this.http.patch(this.u(`tipo-producto/${id}`), params);
  }

  Eliminar(id: number): Observable<any> {
    return this.http.delete(this.u(`tipo-producto/${id}`));
  }

  // =========================================================
  // 🧾 PRODUCTOS
  // =========================================================
  listarProductos(): Observable<any[]> {
    const cargarPagina = (page: number) => this.http.get<any>(this.u('productos'), {
      params: new HttpParams().set('page', page).set('limit', 30),
    });

    // El catálogo se filtra localmente: hay que recuperar todas las páginas
    // del servidor antes de calcular filtros, contadores y páginas visibles.
    return cargarPagina(1).pipe(
      expand((respuesta) => {
        if (Array.isArray(respuesta)) return EMPTY;
        const page = Number(respuesta?.page || 1);
        const limit = Number(respuesta?.limit || 30);
        return respuesta?.items?.length && page * limit < Number(respuesta.total)
          ? cargarPagina(page + 1)
          : EMPTY;
      }),
      reduce((productos: any[], respuesta: any) => productos.concat(
        Array.isArray(respuesta) ? respuesta : (respuesta?.items ?? []),
      ), [] as any[]),
    );
  }

  listarProductoPorId(id: number): Observable<any> {
    return this.http.get(this.u(`productos/${id}`));
  }

  listarProductosPorNombre(nombre: string): Observable<any> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get(this.u('productos'), { params });
  }

  crearProductos(params: any): Observable<any> {
    return this.http.post(this.u('productos'), params);
  }

  actualizarProducto(producto: any): Observable<any> {
    const id = producto?.producto_id ?? producto?.id;
    if (!id) throw new Error('Producto sin ID');
    return this.http.patch(this.u(`productos/${id}`), producto);
  }

  actualizarProductoForm(id: number, formData: FormData): Observable<any> {
    if (!id) throw new Error('Producto sin ID');
    return this.http.patch(this.u(`productos/${id}`), formData);
  }

  EliminarProductos(id: number): Observable<any> {
    return this.http.delete(this.u(`productos/${id}`));
  }

  // =========================================================
  // 🚚 PROVEEDORES
  // =========================================================
  listarProveedores(
    params: { q?: string; estado?: 'A' | 'I' | 'TODOS' } = {},
  ): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params.q?.trim()) httpParams = httpParams.set('q', params.q.trim());
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    return this.http.get<any[]>(this.u('proveedores'), {
      params: httpParams,
    });
  }

  crearProveedor(payload: any): Observable<any> {
    return this.http.post(this.u('proveedores'), payload);
  }

  actualizarProveedor(id: number, payload: any): Observable<any> {
    return this.http.patch(this.u(`proveedores/${id}`), payload);
  }

  eliminarProveedor(id: number): Observable<any> {
    return this.http.delete(this.u(`proveedores/${id}`));
  }

  // =========================================================
  // 📦 LOTES
  // =========================================================
  // Resumen FIFO (todos los productos)
  listarProductosinfo(): Observable<any> {
    return this.http.get(this.u('lotes/calcular-fifo'));
  }

  // Resumen FIFO (todos o por productoId) devolviendo sólo 'data'
  calcularFIFO(productoId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (productoId != null)
      params = params.set('productoId', String(productoId));
    return this.http
      .get(this.u('lotes/calcular-fifo'), { params })
      .pipe(map((resp: any) => resp?.data ?? []));
  }

  ListarLotesStock(filters: {
    productoId?: number;
    fechaInicio?: string;
    fechaFin?: string;
    estado?: string;
  }): Observable<any[]> {
    let params = new HttpParams();
    if (filters.productoId != null)
      params = params.set('productoId', String(filters.productoId));
    if (filters.fechaInicio)
      params = params.set('fechaInicio', filters.fechaInicio);
    if (filters.fechaFin) params = params.set('fechaFin', filters.fechaFin);
    if (filters.estado) params = params.set('estado', filters.estado);
    return this.http.get<any[]>(this.u('lotes/stock'), { params });
  }

  listarLotesById(productoId: number): Observable<any> {
    return this.http.get(this.u(`lotes?productoId=${productoId}`));
  }

  listarultimoLotesById(productoId: number): Observable<any> {
    return this.http.get(this.u(`lotes/ultimo-lote/${productoId}`));
  }

  crearLotes(params: any): Observable<any> {
    return this.http.post(this.u('lotes'), params);
  }

  actualizarLote(id: number, params: any): Observable<any> {
    return this.http.patch(this.u(`lotes/${id}`), params);
  }

  eliminarLote(id: number): Observable<any> {
    return this.http.delete(this.u(`lotes/${id}`));
  }

  // =========================================================
  // 💰 VENTAS
  // =========================================================
  consultarVentasDelDia(fechaInicio: string): Observable<any> {
    return this.http.get(this.u('ventas/consultar'), {
      params: { fechaInicio },
    });
  }

  consultarVentas(params: {
    fechaInicio?: string;
    fechaFin?: string;
    usuarioId?: number;
    metodosPagoIds?: number[];
  }): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params.fechaInicio)
      httpParams = httpParams.set('fechaInicio', params.fechaInicio);
    if (params.fechaFin)
      httpParams = httpParams.set('fechaFin', params.fechaFin);
    if (params.usuarioId != null)
      httpParams = httpParams.set('usuarioId', String(params.usuarioId));
    if (params.metodosPagoIds && params.metodosPagoIds.length > 0) {
      params.metodosPagoIds.forEach((id) => {
        httpParams = httpParams.append('metodosPagoIds', String(id));
      });
    }
    return this.http.get<any[]>(this.u('ventas/consultar'), {
      params: httpParams,
    });
  }

  IniciarVenta(params: any): Observable<any> {
    return this.http.post(this.u('ventas/iniciar'), params);
  }

  listarLotesByCB(codigoBarras: string): Observable<any> {
    return this.http.get(
      this.u(`lotes?codigoBarras=${encodeURIComponent(codigoBarras)}`),
    );
  }

  procesarProductos(params: any): Observable<any> {
    return this.http.post(this.u('ventas/procesar-productos'), params);
  }

  listarMetPago(): Observable<any> {
    return this.http.get(this.u('ventas/metodos'));
  }

  registrarMetPago(params: any): Observable<any> {
    return this.http.post(this.u('ventas/registrar-simple'), params);
  }

  confirmarVenta(params: any): Observable<any> {
    return this.http.post(this.u('ventas/confirmar'), params);
  }

  cancelarVenta(ventaId: number): Observable<any> {
    return this.http.post(this.u('ventas/cancelar'), { ventaId });
  }

  // =========================================================
  // 🧾 FACTURACIÓN
  // =========================================================
  buscarClientes(q: string): Observable<any> {
    const params = new HttpParams().set('q', q || '');
    return this.http.get(this.u('ventas/clientes'), { params });
  }

  generarFactura(payload: {
    ventaId: number;
    clienteId?: number;
    razonSocial?: string;
    ci?: string;
  }): Observable<Blob> {
    return this.http.post(this.u('ventas/factura'), payload, {
      responseType: 'blob',
    });
  }

  // =========================================================
  // 📊 RESUMEN DASHBOARD
  // =========================================================
  obtenerResumenVentas(
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<any> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get(this.u('ventas/resumen'), { params });
  }

  // =========================================================
  // 📉 GASTOS
  // =========================================================
  listarGastos(): Observable<any> {
    return this.http.get(this.u('gastos'));
  }

  crearGasto(params: any): Observable<any> {
    return this.http.post(this.u('gastos'), params);
  }

  editarGasto(id: number, params: any): Observable<any> {
    return this.http.patch(this.u(`gastos/${id}`), params);
  }

  eliminarGasto(id: number): Observable<any> {
    return this.http.delete(this.u(`gastos/${id}`));
  }

  consultarGastoDelDia(): Observable<any> {
    const hoy = new Date();
    const fechaHoy = hoy.toLocaleDateString('sv-SE'); // YYYY-MM-DD
    return this.http.get(this.u(`gastos?fechaInicio=${fechaHoy}`));
  }

  consultarGastosPorFecha(
    fechaInicio: string,
    fechaFin: string,
  ): Observable<any> {
    return this.http.get(
      this.u(`gastos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
    );
  }

  // =========================================================
  // 📄 REPORTES PDF (nuevo módulo)
  // =========================================================
  obtenerInfoSistema(): Observable<any> {
    return this.http.get(this.u('config-sis/info'));
  }

  buscarUsuariosReporte(busqueda: string): Observable<UsuarioReporte[]> {
    return this.http.get<UsuarioReporte[]>(this.u('config-sis/usuarios-reporte'), {
      params: { busqueda: busqueda.trim() },
    });
  }

  buscarVendedoresConVentas(
    fechaInicio: string,
    fechaFin: string,
    busqueda: string = '',
  ): Observable<VendedorVentas[]> {
    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    if (busqueda.trim()) {
      params = params.set('busqueda', busqueda.trim());
    }

    return this.http
      .get<any[]>(this.u('config-sis/vendedores-ventas'), { params })
      .pipe(
        map((rows) =>
          (rows || []).map((row) => ({
            usuario_id: Number(row.usuario_id),
            nombre: String(row.nombre || ''),
            usuario: String(row.usuario || ''),
            ci: row.ci ? String(row.ci) : null,
            cantidad_ventas: Number(row.cantidad_ventas || 0),
            total_ventas: Number(row.total_ventas || 0),
          })),
        ),
      );
  }

  generarReporteVentas(
    fechaInicio: string,
    fechaFin: string,
    usuarioId: number,
  ): Observable<Blob> {
    return this.http.get(this.u('config-sis/reporte-ventas'), {
      params: {
        fechaInicio,
        fechaFin,
        usuarioId: String(usuarioId),
      },
      responseType: 'blob',
    });
  }
}
