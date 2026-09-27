import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  imports:[
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  selector: 'app-confirm-dialog-usuario',
  template: `
    <div class="dialog-header">
      <mat-icon>delete_forever</mat-icon>
      <h2 mat-dialog-title>¿Eliminar usuario?</h2>
    </div>
    <mat-dialog-content>
      ¿Estás seguro de que deseas eliminar este usuario?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button mat-raised-button color="warn" (click)="confirmar()">
        <mat-icon>delete</mat-icon>
        Eliminar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      background: linear-gradient(135deg, #c62828 0%, #e53935 100%);
      color: #fff;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: -16px -24px 20px -24px;
      padding: 0;
    }
    .dialog-header mat-icon {
      color: #fff;
      font-size: 26px;
      width: 26px;
      height: 26px;
      margin-left: 20px;
    }
    .dialog-header h2 {
      margin: 0;
      padding: 18px 20px 18px 0;
      font-size: 1.15rem !important;
      font-weight: 600;
    }
  `]
})
export class ConfirmDialogUsuarioComponent {
    constructor(
    public dialogRef: MatDialogRef<ConfirmDialogUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { usuario_id: number }
  ) {}


    cancelar() {
    this.dialogRef.close(false);
  }

  confirmar() {
    this.dialogRef.close(true);
  }
}
