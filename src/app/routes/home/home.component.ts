import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MenuItem } from '../../shared/menu-item.interface';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { FreshService } from '../services/fresh.service';
import { MatDividerModule } from '@angular/material/divider';
@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule,
    FlexLayoutModule,
    MatDividerModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent  implements OnInit{



  nombreUsuario: string = '';
  rolesUsuario: string[] = [];
  accesosVisibles: MenuItem[] = [];
  estadoPago: string = '';
  mensajeBloqueo: string = '';
  diasRestantes: number = 0;
  fechaVencimiento: string ='';


  menuItems: MenuItem[] = [
    { label: 'Usuarios', icon: 'account_circle', route: '/dashboard/usuarios', roles: ['SUPERADMIN'] },
    { label: 'Ventas', icon: 'shopping_basket', route: '/dashboard/ventas', roles: ['GERENTE', 'VENDEDOR', 'SUPERADMIN'] },
    { label: 'Movimientos', icon: 'receipt', route: '/dashboard/movimientos', roles: ['GERENTE', 'VENDEDOR', 'SUPERADMIN'] },
    { label: 'Inventario', icon: 'inventory', route: '/dashboard/inventario', roles: ['GERENTE', 'VENDEDOR', 'SUPERADMIN'] },
    { label: 'Pagos', icon: 'credit_card', route: '/dashboard/pagos', roles: [] },
    { label: 'Scanner', icon: 'qr_code', route: '/dashboard/scanner', roles: ['GERENTE', 'VENDEDOR', 'SUPERADMIN'] },

  ];

  constructor(
    private router: Router,
    private freshService: FreshService
  ) {}

 ngOnInit(): void {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const usuario = JSON.parse(storedUser);
      this.nombreUsuario = usuario.nombre || '';
      this.rolesUsuario = usuario.roles || [];
      this.filtrarAccesosPorRoles();
    }
    this.freshService.listarMetPago().subscribe((res) => {
    this.estadoPago = res.estado_pago;
    this.mensajeBloqueo = res.mensaje_bloqueo;
    this.diasRestantes = res.dias_restantes;
    this.fechaVencimiento= res.fecha_vencimiento;
  });

  }

filtrarAccesosPorRoles(): void {
  this.accesosVisibles = this.menuItems.filter(item => {
    // Oculta el acceso a "Scanner" si no es celular
    if (item.label === 'Scanner' && !this.esCelular) {
      return false;
    }

    // Filtra por roles
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
