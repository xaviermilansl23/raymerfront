import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FreshService {
  // URL base del backend (p.ej. http://localhost:3000/ )
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Construye URL asegurando que haya exactamente una "/" entre base y endpoint */
  private u(endpoint: string): string {
    const b = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const e = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${b}/${e}`;
  }

  listarEstadoPagoADmin() {
    throw new Error('Method not implemented.');
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
  listarProductos(): Observable<any> {
    return this.http.get(this.u('productos'));
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
  // 📦 LOTES
  // =========================================================
  // Resumen FIFO (todos los productos)
  listarProductosinfo(): Observable<any> {
    return this.http.get(this.u('lotes/calcular-fifo'));
  }

  // Resumen FIFO (todos o por productoId) devolviendo sólo 'data'
  calcularFIFO(productoId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (productoId != null) params = params.set('productoId', String(productoId));
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
    if (filters.productoId != null) params = params.set('productoId', String(filters.productoId));
    if (filters.fechaInicio) params = params.set('fechaInicio', filters.fechaInicio);
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
    if (params.fechaInicio) httpParams = httpParams.set('fechaInicio', params.fechaInicio);
    if (params.fechaFin) httpParams = httpParams.set('fechaFin', params.fechaFin);
    if (params.usuarioId != null) httpParams = httpParams.set('usuarioId', String(params.usuarioId));
    if (params.metodosPagoIds && params.metodosPagoIds.length > 0) {
      params.metodosPagoIds.forEach(id => {
        httpParams = httpParams.append('metodosPagoIds', String(id));
      });
    }
    return this.http.get<any[]>(this.u('ventas/consultar'), { params: httpParams });
  }

  IniciarVenta(params: any): Observable<any> {
    return this.http.post(this.u('ventas/iniciar'), params);
  }

  listarLotesByCB(codigoBarras: string): Observable<any> {
    return this.http.get(this.u(`lotes?codigoBarras=${encodeURIComponent(codigoBarras)}`));
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

  consultarGastosPorFecha(fechaInicio: string, fechaFin: string): Observable<any> {
    return this.http.get(this.u(`gastos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`));
  }

  // =========================================================
  // 📄 REPORTES PDF (nuevo módulo)
  // =========================================================
  obtenerInfoSistema(): Observable<any> {
    return this.http.get(this.u('config-sis/info'));
  }

  generarReporteVentas(fechaInicio: string, fechaFin: string): Observable<Blob> {
    return this.http.get(this.u('config-sis/reporte-ventas'), {
      params: { fechaInicio, fechaFin },
      responseType: 'blob',
    });
  }
}
