import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface MenuItem {
  ruta: string;
  nombre: string;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './menu.component.html',
  styles: [`
    li {
      cursor: pointer;
    }
  `]
})
export class MenuComponent {
  menuItem: MenuItem[] = [
    {
      ruta: '/mapas/fullscreen',
      nombre: 'FullScreen'
    },
    {
      ruta: '/mapas/zoom-range',
      nombre: 'Zoom Range'
    },
    {
      ruta: '/mapas/marcadores',
      nombre: 'Marcadores'
    },
    {
      ruta: '/mapas/propiedades',
      nombre: 'Propiedades'
    },
    {
      ruta: '/mapas/vista3d',
      nombre: '🏔️ Vista 3D'
    }
  ];
}