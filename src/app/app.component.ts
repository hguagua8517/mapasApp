import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

import { environment } from 'src/environments/environments';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  title = 'mapaApp';

  ngOnInit(): void {
    (mapboxgl as any).accessToken = environment.mapboxToken;
  }



}
