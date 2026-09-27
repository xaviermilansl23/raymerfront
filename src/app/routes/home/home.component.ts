import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MenuItem } from '../../shared/menu-item.interface';
import { Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FreshService } from '../services/fresh.service';
import { AuthService } from '../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil, filter, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  nombreUsuario: string = '';
  rolesUsuario: string[] = [];
  accesosVisibles: MenuItem[] = [];
  estadoPago: string = '';
  mensajeBloqueo: string = '';
  diasRestantes: number = 0;
  fechaVencimiento: string = '';
  fechaHoy: string = new Date().toLocaleDateString('es-BO', {
    timeZone: 'America/La_Paz',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  resumenCargando = false;
  resumenError = false;

  resumen: any = {
    ventasHoy: { total: 0, cantidad: 0 },
    ventasSemana: { total: 0, cantidad: 0 },
    ventasMes: { total: 0, cantidad: 0 },
    balanceNetoHoy: 0,
    productosTop: [],
  };

  menuItems: MenuItem[] = [
    { label: 'Usuarios', icon: 'account_circle', route: '/dashboard/usuarios', roles: ['SUPERADMIN'] },
    { label: 'Ventas', icon: 'shopping_basket', route: '/dashboard/ventas', roles: ['GERENTE', 'VENDEDOR', 'SUPERADMIN'] },
    { label: 'Smart Sales', icon: 'insights', route: '/dashboard/smart-sales', roles: ['GERENTE', 'SUPERADMIN'] },
    { label: 'Movimientos', icon: 'receipt', route: '/dashboard/movimientos', roles: ['GERENTE', 'VENDEDOR', 'SUPERADMIN'] },
    { label: 'Inventario', icon: 'inventory', route: '/dashboard/inventario', roles: ['GERENTE', 'SUPERADMIN'] },
    { label: 'Proveedores', icon: 'local_shipping', route: '/dashboard/proveedores', roles: ['GERENTE', 'SUPERADMIN'] },
    { label: 'Reportes', icon: 'report', route: '/dashboard/pagos', roles: ['SUPERADMIN', 'GERENTE'] },
    { label: 'Scanner', icon: 'qr_code', route: '/dashboard/scanner', roles: ['GERENTE', 'VENDEDOR', 'SUPERADMIN'] },
  ];

  constructor(
    private router: Router,
    private freshService: FreshService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuario();
    if (usuario) {
      this.nombreUsuario = usuario.nombre || '';
      this.rolesUsuario = usuario.roles || this.authService.getRoles();
      this.filtrarAccesosPorRoles();
    }

    this.freshService.listarEstadoPagoADmin().subscribe({
      next: (res) => {
        this.estadoPago = res?.estado_pago || 'ACTIVO';
        this.mensajeBloqueo = res?.mensaje_bloqueo || '';
        this.diasRestantes = res?.dias_restantes || 0;
        this.fechaVencimiento = res?.fecha_vencimiento || '';
      },
      error: (err) => {
        console.error('Error al obtener estado del sistema:', err);
        this.estadoPago = 'ACTIVO';
      },
    });

    this.cargarResumen();

    // Recarga el resumen cada vez que el usuario vuelve al home
    // (evita que quede vacío tras iniciar sesión de nuevo).
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd && e.urlAfterRedirects.includes('/dashboard/home')),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.cargarResumen());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarResumen(): void {
    if (this.resumenCargando) return;
    this.resumenCargando = true;
    this.resumenError = false;
    const fechaReferencia = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    this.freshService.obtenerResumenVentas(fechaReferencia)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.resumenCargando = false; }))
      .subscribe({
      next: (data) => {
        if (data?.ventasHoy && data?.ventasSemana && data?.ventasMes) {
          this.resumen = {
            ...this.resumen,
            ...data,
            ventasHoy: { ...this.resumen.ventasHoy, ...(data.ventasHoy || {}) },
            ventasSemana: { ...this.resumen.ventasSemana, ...(data.ventasSemana || {}) },
            ventasMes: { ...this.resumen.ventasMes, ...(data.ventasMes || {}) },
          };
        } else {
          this.resumenError = true;
        }
      },
      error: (err) => {
        console.error('Error al cargar resumen:', err);
        this.resumenError = true;
      },
    });
  }

  // Accesores seguros: nunca rompen la plantilla aunque el backend devuelva datos parciales
  get ventasHoy(): { total: number; cantidad: number } {
    return {
      total: this.resumen?.ventasHoy?.total ?? 0,
      cantidad: this.resumen?.ventasHoy?.cantidad ?? 0,
    };
  }

  get ventasSemana(): { total: number; cantidad: number } {
    return {
      total: this.resumen?.ventasSemana?.total ?? 0,
      cantidad: this.resumen?.ventasSemana?.cantidad ?? 0,
    };
  }

  get ventasMes(): { total: number; cantidad: number } {
    return {
      total: this.resumen?.ventasMes?.total ?? 0,
      cantidad: this.resumen?.ventasMes?.cantidad ?? 0,
    };
  }

  get balanceNeto(): number {
    return this.resumen?.balanceNetoHoy ?? 0;
  }

  get topProductos(): any[] {
    return Array.isArray(this.resumen?.productosTop) ? this.resumen.productosTop : [];
  }

  formatearMoneda(valor: number): string {
    if (valor === null || valor === undefined || isNaN(valor)) valor = 0;
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2,
    }).format(valor);
  }

  filtrarAccesosPorRoles(): void {
    this.accesosVisibles = this.menuItems.filter(item => {
      if (item.label === 'Scanner' && !this.esCelular) {
        return false;
      }
      return !item.roles || item.roles.some(role => this.rolesUsuario.includes(role));
    });
  }

  navegar(ruta: string): void {
    this.router.navigate([ruta]);
  }

  get esCelular(): boolean {
    const userAgent = navigator.userAgent || (navigator as any).vendor || (window as any).opera;
    return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  }
}
