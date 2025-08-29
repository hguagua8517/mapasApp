import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';

import { environment } from 'src/environments/environments';
import { MenuComponent } from './shared/menu/menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  title = 'mapaApp';

  ngOnInit(): void {
    (mapboxgl as any).accessToken = environment.mapboxToken;
  }



}
