
import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../shared/menu-item.interface';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';



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
    RouterModule,
    CommonModule
  ],
})

export class DashboardComponent {
  reload: boolean = true; // Controla la recarga de los componentes hijos
  modoBarra: 'side' | 'over' = 'side';
abiertaBarra = true;


  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver

  )  {
  this.breakpointObserver.observe([Breakpoints.Handset])
    .subscribe(result => {
      if (result.matches) {
        this.modoBarra = 'over';      // en móvil: barra flotante
        this.abiertaBarra = false;    // cerrada por defecto
      } else {
        this.modoBarra = 'side';      // en escritorio: barra lateral
        this.abiertaBarra = true;
      }
    });
  }



sidenavElement!: HTMLElement;

ngAfterViewInit(): void {
  this.sidenavElement = document.querySelector('.sidenav') as HTMLElement;

  if (this.sidenavElement) {
    const resizeObserver = new ResizeObserver(() => {
      // Fuerza el recálculo de layout
      this.forceResize();
    });
    resizeObserver.observe(this.sidenavElement);
  }

  // Asegura que al entrar desde login también se dispare
  setTimeout(() => this.forceResize(), 150);
}




  logout(): void {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');// Elimina el usuario del almacenamiento
    this.router.navigate(['/login']).then(() => {
      window.location.reload(); // Recarga la página por completo
    });
  }

getRoles(): string[] {
  const token = sessionStorage.getItem('token');
  if (!token) return [];
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.roles || [];
  } catch (e) {
    return [];
  }
}




menuItems: MenuItem[] = [
  { label: 'Home', icon: 'home', route: '/dashboard/home' }, // siempre visible
  { label: 'Usuarios', icon: 'account_circle', route: '/dashboard/usuarios', roles: ['SUPERADMIN'] },
  { label: 'Ventas', icon: 'shopping_basket', route: '/dashboard/ventas', roles: ['GERENTE', 'VENDEDOR','SUPERADMIN'] },
  { label: 'Movimientos', icon: 'receipt', route: '/dashboard/movimientos', roles: ['GERENTE', 'VENDEDOR', 'SUPERADMIN'] },
  { label: 'Inventario', icon: 'inventory', route: '/dashboard/inventario', roles: ['GERENTE','SUPERADMIN'] },
  { label: 'Scanner', icon: 'qr_code', route: '/dashboard/scanner', roles: ['GERENTE', 'VENDEDOR', 'SUPERADMIN'] },
  { label: 'Reportes', icon: 'report', route: '/dashboard/pagos', roles: ['GERENTE','SUPERADMIN'] },
  { label: 'direcciones', icon: 'report', route: '/dashboard/configuracion', roles: [] },

];

puedeVer(item: MenuItem): boolean {
  const rolesUsuario = this.getRoles();
   if (item.label === 'Scanner' && !this.esCelular) {
    return false;
  }
  if (!item.roles) return true; // visible para todos si no hay restricción
  return item.roles.some((rol) => rolesUsuario.includes(rol));
}


isCollapsed = false;

toggleSidenav(): void {
  this.isCollapsed = !this.isCollapsed;
  sessionStorage.setItem('menuCollapsed', String(this.isCollapsed)); // guardar estado

  setTimeout(() => this.forceResize(), 100);
}



forceResize(): void {
  window.dispatchEvent(new Event('resize'));
}

get esCelular(): boolean {
  const userAgent = navigator.userAgent || (navigator as any).vendor || (window as any).opera;
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
}

}

