
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/login",
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "redirectTo": "/dashboard/home",
    "route": "/dashboard"
  },
  {
    "renderMode": 2,
    "route": "/dashboard/home"
  },
  {
    "renderMode": 2,
    "route": "/dashboard/inventario"
  },
  {
    "renderMode": 0,
    "route": "/dashboard/lotes/*"
  },
  {
    "renderMode": 2,
    "route": "/dashboard/movimientos"
  },
  {
    "renderMode": 2,
    "route": "/dashboard/ventas"
  },
  {
    "renderMode": 2,
    "route": "/dashboard/usuarios"
  },
  {
    "renderMode": 2,
    "route": "/dashboard/pagos"
  },
  {
    "renderMode": 2,
    "route": "/dashboard/scanner"
  },
  {
    "renderMode": 2,
    "route": "/dashboard/configuracion"
  },
  {
    "renderMode": 2,
    "redirectTo": "/dashboard",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 24072, hash: '20c4fdaefaa3efef039b1b966feffc3515530fc22843e245babf3836cb14d7b8', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17562, hash: '2a1f956cdddad16439536f7559f6e698d50d15a401c69595e3eb28379f4e4f03', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'login/index.html': {size: 90043, hash: 'ee6f933d587c8e0809a036592943885ffcbf276a990212ed262d2b22e832df88', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'dashboard/home/index.html': {size: 90043, hash: 'ee6f933d587c8e0809a036592943885ffcbf276a990212ed262d2b22e832df88', text: () => import('./assets-chunks/dashboard_home_index_html.mjs').then(m => m.default)},
    'dashboard/movimientos/index.html': {size: 90043, hash: '8323514a6314dc90a414748a2b45abf95df4bfb25c707ff7fbeeb71fe9f52d58', text: () => import('./assets-chunks/dashboard_movimientos_index_html.mjs').then(m => m.default)},
    'dashboard/ventas/index.html': {size: 90043, hash: '8323514a6314dc90a414748a2b45abf95df4bfb25c707ff7fbeeb71fe9f52d58', text: () => import('./assets-chunks/dashboard_ventas_index_html.mjs').then(m => m.default)},
    'dashboard/inventario/index.html': {size: 90043, hash: 'ee6f933d587c8e0809a036592943885ffcbf276a990212ed262d2b22e832df88', text: () => import('./assets-chunks/dashboard_inventario_index_html.mjs').then(m => m.default)},
    'dashboard/usuarios/index.html': {size: 90043, hash: '79226b3e43f3dd33f300f9aada6c1e82c5ec1eba3369bb7b46f316891ceb78cd', text: () => import('./assets-chunks/dashboard_usuarios_index_html.mjs').then(m => m.default)},
    'dashboard/configuracion/index.html': {size: 90043, hash: '20392499cb073781cf6cd09bd60e6402f944e91d4128e22a293c594951d07f9f', text: () => import('./assets-chunks/dashboard_configuracion_index_html.mjs').then(m => m.default)},
    'dashboard/scanner/index.html': {size: 90043, hash: '8323514a6314dc90a414748a2b45abf95df4bfb25c707ff7fbeeb71fe9f52d58', text: () => import('./assets-chunks/dashboard_scanner_index_html.mjs').then(m => m.default)},
    'dashboard/pagos/index.html': {size: 90043, hash: '79226b3e43f3dd33f300f9aada6c1e82c5ec1eba3369bb7b46f316891ceb78cd', text: () => import('./assets-chunks/dashboard_pagos_index_html.mjs').then(m => m.default)},
    'styles-YFFD6KED.css': {size: 14789, hash: 'lyiMfYB6hAA', text: () => import('./assets-chunks/styles-YFFD6KED_css.mjs').then(m => m.default)}
  },
};
