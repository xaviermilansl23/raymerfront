import { provideRouter, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './routes/auth/login/login.component';
import { DashboardComponent } from './routes/dashboard/dashboard.component';
import { AuthGuard } from './routes/auth/auth.guard';
import { InventarioComponent } from './routes/inventario/inventario.component';
import { HomeComponent } from './routes/home/home.component';
import { LotesComponent } from './routes/inventario/lotes/lotes.component';
import { MovimientosComponent } from './routes/movimientos/movimientos.component';
import { VentasComponent } from './routes/ventas/ventas.component';
import { UsuariosComponent } from './routes/usuarios/usuarios.component';
import { ConfigurationComponent } from './routes/configuration/configuration.component';
import { ConfSisComponent } from './routes/superadmin-routes-extras/conf-sis/conf-sis.component';
import { ScannerBarrasComponent } from './routes/scanner-barras/scanner-barras.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent, data:{roles:['GERENTE','VENDEDOR','SUPERADMIN']}},
      { path: 'inventario', component: InventarioComponent, canActivate: [AuthGuard], data:{roles:['GERENTE','VENDEDOR','SUPERADMIN']} },
      { path: 'lotes/:productoId', component: LotesComponent, canActivate: [AuthGuard], data:{roles:['GERENTE','VENDEDOR','SUPERADMIN'], renderMode: 'no-prerender' } },
      { path: 'movimientos', component: MovimientosComponent, canActivate: [AuthGuard], data:{roles:['GERENTE','VENDEDOR','SUPERADMIN']} },
      { path: 'ventas', component: VentasComponent, canActivate:[AuthGuard], data: {roles:['GERENTE','VENDEDOR','SUPERADMIN']} },
      { path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard], data: {roles:['GERENTE', 'SUPERADMIN']}},
      { path: 'pagos', component: ConfSisComponent, canActivate: [AuthGuard], data: {roles:[ 'SUPERADMIN']}},
      { path: 'scanner', component: ScannerBarrasComponent, canActivate:[AuthGuard], data: {roles:['GERENTE','VENDEDOR','SUPERADMIN']} },

      {path: 'configuracion', component:ConfigurationComponent}



    ],

  },
  { path: '**', redirectTo: 'dashboard' },
];

export const AppRoutingModule = RouterModule.forRoot(routes, {
  onSameUrlNavigation: 'reload', // Permite recargar en la misma ruta
  enableTracing: false, // Opcional: rastrear eventos de enrutamiento para depuración
});
