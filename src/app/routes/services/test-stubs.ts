import { of } from 'rxjs';

export function freshServiceStub(): any {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (typeof prop === 'symbol') return undefined;
        return () => of([]);
      },
    },
  );
}

export const authServiceStub: any = {
  getUsuario: () => null,
  getNombreUsuario: () => 'Test',
  getRoles: () => [],
  getToken: () => null,
  isAuthenticated: () => true,
  logout: () => undefined,
};

export const toastrServiceStub: any = {
  success: () => undefined,
  warning: () => undefined,
  error: () => undefined,
  info: () => undefined,
};

export const dialogRefStub: any = { close: () => undefined };

export const matDialogDataStub: any = {};

export const matDialogStub: any = {
  open: () => ({ afterClosed: () => of(false) }),
};

export const routerStub: any = {
  navigate: () => undefined,
  navigateByUrl: () => undefined,
  events: of(null),
  createUrlTree: () => null,
  serializeUrl: () => '',
  isActive: () => false,
};

export const activatedRouteStub: any = {
  params: of({}),
  paramMap: of({ get: () => null }),
  snapshot: { paramMap: { get: () => null } },
};

export const breakpointObserverStub: any = {
  observe: () => of({ matches: true, breakpoints: {} }),
};

export const socketServiceStub: any = {
  codigoEscaneado$: of(null),
  enviarCodigo: () => undefined,
  obtenerToken: () => null,
  connect: () => undefined,
  disconnect: () => undefined,
};