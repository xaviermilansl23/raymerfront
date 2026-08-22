import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { FreshService } from '../services/fresh.service';
import { DiaologUsuariosComponent } from './diaolog-usuarios/diaolog-usuarios.component';
import { ConfirmDialogUsuarioComponent } from './confirm-dialog-usuario/confirm-dialog-usuario.component';
import { AsignarRolComponent } from './asignar-rol/asignar-rol.component';

@Component({
  selector: 'app-usuarios',
  imports: [
     MatPaginator,
    CommonModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    MatButtonModule,
    MatTooltipModule

  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {


   dataSource = new MatTableDataSource<any>();
  dataSourceRoles = new MatTableDataSource<any>();

  displayedColumns: string[] = ['indice', 'nombre', 'correo', 'tipoUsuario', 'fecha_creacion', 'acciones'];
  displayedColumnsRoles: string[] = ['indice', 'nombre_usuario', 'roles_asignados'];

  @ViewChild('paginatorUsuarios', { static: true }) paginatorUsuarios!: MatPaginator;
  @ViewChild('paginatorRoles', { static: true }) paginatorRoles!: MatPaginator;

  usuariosConRol: any[] = [];

  constructor(
    private service: FreshService,
    private toastr: ToastrService,
    private dialog: MatDialog,

  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarUsuariosConRol();
  }

  cargarUsuarios() {
    this.service.listarusuarios().subscribe((res) => {
      this.dataSource.data = res;
      this.dataSource.paginator = this.paginatorUsuarios;
    });
  }

  cargarUsuariosConRol() {
    this.service.listarusuariosRol().subscribe((res) => {
      // Agrupar roles si hay múltiples por usuario
      const agrupados = this.agruparRolesPorUsuario(res);
      this.usuariosConRol = agrupados;
      this.dataSourceRoles.data = agrupados;
      this.dataSourceRoles.paginator = this.paginatorRoles;
    });
  }

  //  Agrupar múltiples roles por usuario si vienen desglosados
  agruparRolesPorUsuario(lista: any[]): any[] {
    const mapa = new Map<number, any>();

    lista.forEach(item => {
      if (!mapa.has(item.usuario_id)) {
        mapa.set(item.usuario_id, {
          nombre_usuario: item.nombre_usuario,
          roles_asignados: item.rol_nombre
        });
      } else {
        mapa.get(item.usuario_id).roles_asignados += ', ' + item.rol_nombre;
      }
    });

    return Array.from(mapa.values());
  }

  applyFilter(event: Event) {
    const filtro = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filtro;
  }

  applyFilterRoles(event: Event) {
    const filtro = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSourceRoles.filter = filtro;
  }

  // Validar si un usuario tiene rol
  tieneRol(usuario_id: number): boolean {
    return this.usuariosConRol.some(u => u.usuario_id === usuario_id);
  }

  // Acciones: Abrir diálogos
       openDialog(): void {
        const dialogRef = this.dialog.open(DiaologUsuariosComponent, {
          width: '550px',
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result === 'Usuario creado con exito') {
            this.cargarUsuarios();
          }
        });
      }


      abrirDialogoEditar(usuario: any): void {

        const dialogRef = this.dialog.open(DiaologUsuariosComponent, {
          width: '550px',
          data: usuario

        });
        console.log(usuario)

        dialogRef.afterClosed().subscribe(result => {
          if (result === 'actualizado') {
            this.cargarUsuarios();
          }
        });
      }


eliminarDialogo(usuario_id: number): void {
  const dialogRef = this.dialog.open(ConfirmDialogUsuarioComponent, {
    width: '350px',
    data: { usuario_id } // <- correcto
  });

  dialogRef.afterClosed().subscribe(confirmado => {
    if (confirmado) {
      this.service.eliminarUsuario(usuario_id).subscribe({
        next: () => {
          this.toastr.success('Usuario eliminado con éxito');
          this.cargarUsuarios();
          this.cargarUsuariosConRol();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al eliminar el usuario');
        }
      });
    }
  });
}


asignarRol(usuario: any): void {
  const dialogRef = this.dialog.open(AsignarRolComponent, {
    width: '400px',
    data: usuario
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'rol_asignado') {
      this.cargarUsuarios();
      this.cargarUsuariosConRol();

    }
  });
}

}
