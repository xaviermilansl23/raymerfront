import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { MenuItem } from '../../shared/menu-item.interface';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CambiarContrasenaComponent } from '../usuarios/cambiar-contrasena/cambiar-contrasena.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    RouterModule,
    CommonModule,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  reload: boolean = true;
  modoBarra: 'side' | 'over' = 'side';
  abiertaBarra = true;
  private destroy$ = new Subject<void>();

  nombreUsuario: string = '';
  rolesUsuario: string[] = [];
  inicialesUsuario: string = '';
  isCollapsed = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private toastr: ToastrService,
  ) {
    // Restaura el estado colapsado del menú aunque se haya recargado la sesión
    this.isCollapsed = sessionStorage.getItem('menuCollapsed') === 'true';

    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result.matches) {
          this.modoBarra = 'over';
          this.abiertaBarra = false;
          this.isCollapsed = false;
        } else {
          this.modoBarra = 'side';
          this.abiertaBarra = true;
        }
      });
  }

  ngOnInit(): void {
    const usuario = this.authService.getUsuario();
    this.nombreUsuario =
      usuario?.nombre || this.authService.getNombreUsuario() || '';
    this.rolesUsuario = this.authService.getRoles();
    this.inicialesUsuario = this.obtenerIniciales(this.nombreUsuario);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private obtenerIniciales(nombre: string): string {
    if (!nombre) return '?';
    return nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  sidenavElement!: HTMLElement;

  ngAfterViewInit(): void {
    this.sidenavElement = document.querySelector('.sidenav') as HTMLElement;

    if (this.sidenavElement) {
      const resizeObserver = new ResizeObserver(() => {
        this.forceResize();
      });
      resizeObserver.observe(this.sidenavElement);
    }

    // Asegura que al entrar desde login también se dispare
    setTimeout(() => this.forceResize(), 150);
  }

  logout(): void {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  cambiarContrasena(): void {
    const dialogRef = this.dialog.open(CambiarContrasenaComponent, {
      width: '420px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'contrasena_cambiada') {
        this.toastr.success('Contraseña actualizada con éxito');
      }
    });
  }

  getRoles(): string[] {
    return this.authService.getRoles();
  }

  menuItems: MenuItem[] = [
    { label: 'Inicio', icon: 'home', route: '/dashboard/home' },
    {
      label: 'Usuarios',
      icon: 'account_circle',
      route: '/dashboard/usuarios',
      roles: ['SUPERADMIN'],
    },
    {
      label: 'Ventas',
      icon: 'shopping_basket',
      route: '/dashboard/ventas',
      roles: ['GERENTE', 'VENDEDOR', 'SUPERADMIN'],
    },
    {
      label: 'Smart Sales',
      icon: 'insights',
      route: '/dashboard/smart-sales',
      roles: ['GERENTE', 'SUPERADMIN'],
    },
    {
      label: 'Movimientos',
      icon: 'receipt',
      route: '/dashboard/movimientos',
      roles: ['GERENTE', 'VENDEDOR', 'SUPERADMIN'],
    },
    {
      label: 'Inventario',
      icon: 'inventory',
      route: '/dashboard/inventario',
      roles: ['GERENTE', 'SUPERADMIN'],
    },
    {
      label: 'Proveedores',
      icon: 'local_shipping',
      route: '/dashboard/proveedores',
      roles: ['GERENTE', 'SUPERADMIN'],
    },
    {
      label: 'Scanner',
      icon: 'qr_code',
      route: '/dashboard/scanner',
      roles: ['GERENTE', 'VENDEDOR', 'SUPERADMIN'],
    },
    {
      label: 'Reportes',
      icon: 'report',
      route: '/dashboard/pagos',
      roles: ['SUPERADMIN', 'GERENTE'],
    },
  ];

  puedeVer(item: MenuItem): boolean {
    const rolesUsuario = this.getRoles();
    if (item.label === 'Scanner' && !this.esCelular) {
      return false;
    }
    if (!item.roles) return true;
    return item.roles.some((rol) => rolesUsuario.includes(rol));
  }

  toggleSidenav(): void {
    this.isCollapsed = !this.isCollapsed;
    sessionStorage.setItem('menuCollapsed', String(this.isCollapsed));
    setTimeout(() => this.forceResize(), 100);
  }

  forceResize(): void {
    window.dispatchEvent(new Event('resize'));
  }

  get esCelular(): boolean {
    const userAgent =
      navigator.userAgent || (navigator as any).vendor || (window as any).opera;
    return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent.toLowerCase(),
    );
  }
}
