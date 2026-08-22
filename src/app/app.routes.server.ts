import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'dashboard/lotes/:productoId',
    renderMode: RenderMode.Server  //  usa SSR pero no prerenderiza porque la  ruta dashboard/lotes/id me pide que no renderice
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
