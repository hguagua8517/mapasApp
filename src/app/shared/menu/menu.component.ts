import { Component } from '@angular/core';

interface MenuItem {
  ruta: string;
  nombre: string;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styles: [`
   li{
    cursor: pointer;
   }
  `
  ]
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
      nombre: 'marcadores'
    },
    {
      ruta: '/mapas/propiedades',
      nombre: 'propiedades'
    }
  ]
}
