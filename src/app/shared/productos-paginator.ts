import { MatPaginatorIntl } from '@angular/material/paginator';

export function crearPaginadorProductos(): MatPaginatorIntl {
  const paginator = new MatPaginatorIntl();
  paginator.itemsPerPageLabel = 'Productos por página';
  paginator.firstPageLabel = 'Primera página';
  paginator.lastPageLabel = 'Última página';
  paginator.nextPageLabel = 'Página siguiente';
  paginator.previousPageLabel = 'Página anterior';
  paginator.getRangeLabel = (page, pageSize, length) => {
    if (!length) return '0 productos';
    const inicio = page * pageSize;
    return `${inicio + 1}–${Math.min(inicio + pageSize, length)} de ${length} productos`;
  };
  return paginator;
}
