import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-zoom-range',
  templateUrl: './zoom-range.component.html',
  styles: [`
    .mapa-container{
      height: 100%;
      width: 100%;
    }
    .row {
      background-color: white;
      border-radius: 5px;
      bottom: 50px;
      left: 50px;
      padding: 10px;
      position: fixed;
      z-index: 999;
      width: 400px;
        }
  `]
})
export class ZoomRangeComponent implements AfterViewInit, OnDestroy{

  @ViewChild('mapa') divMapa!: ElementRef;
  mapa!: mapboxgl.Map;
  zoomLevel: number = 10;
  center: [number, number] = [-76.52752135125671, 3.3699701028686193];


  constructor(){
    //console.log( 'constructor', this.divMapa);
  }
  ngOnDestroy(): void {
    this.mapa.off('zoom', () => {});
    this.mapa.off('zoomend', () => {});
    this.mapa.off('move', () => {});

  }

  ngAfterViewInit(): void {
    //console.log('onInit', this.divMapa);
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://style/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel
    });
    this.mapa.on('zoom', (ev)=> {
      this.zoomLevel = this.mapa.getZoom();
    });

    this.mapa.on('zoomend', (ev)=> {
      if (this.mapa.getZoom() > 19 ){
        this.mapa.zoomTo(19);
      }
    });

    //moviemiento del mapa
    this.mapa.on('move', (event) =>{
      const target = event.target;
      const {lng, lat} = target.getCenter();
      this.center = [lng, lat];
    });
  }

  zoomOut(){
    this.mapa.zoomOut();
    //this.zoomLevel = this.mapa.getZoom();
    //console.log('zoomOut', this.divMapa);
  }

  zoomIn(){
    this.mapa.zoomIn();
    //this.zoomLevel = this.mapa.getZoom();
  }
  zoomCambio(valor : string){
    this.mapa.zoomTo(Number(valor));
  }


}
