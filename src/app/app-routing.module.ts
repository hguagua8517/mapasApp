import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'mapas',
    children: [
      {
        path: 'fullscreen', 
        loadComponent: () => import('./mapas/pages/full-screen/full-screen.component').then(c => c.FullScreenComponent)
      },
      {
        path: 'zoom-range', 
        loadComponent: () => import('./mapas/pages/zoom-range/zoom-range.component').then(c => c.ZoomRangeComponent)
      },
      {
        path: 'marcadores', 
        loadComponent: () => import('./mapas/pages/marcadores/marcadores.component').then(c => c.MarcadoresComponent)
      },
      {
        path: 'propiedades', 
        loadComponent: () => import('./mapas/pages/propiedades/propiedades.component').then(c => c.PropiedadesComponent)
      },
      {
        path: 'vista3d', 
        loadComponent: () => import('./mapas/pages/vista3d/vista3d.component').then(c => c.Vista3dComponent)
      },
      {
        path: '', 
        redirectTo: 'fullscreen', 
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'mapas',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'mapas'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
