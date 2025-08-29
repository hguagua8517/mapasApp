import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';


interface MarcadorColor {
  color: string;
  marker?: mapboxgl.Marker;
  centro?: [number, number];
}

@Component({
  selector: 'app-marcadores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marcadores.component.html',
  styles: [
    `.mapa-container{
      height: 100%;
      width: 100%;
    }
    .list-group{
      position: fixed;
      right: 20px;
      top: 20px;
      z-index: 99;
      }
    li{
      cursor: pointer;
    }
    `
  ]
})
export class MarcadoresComponent implements AfterViewInit{

  @ViewChild('mapa') divMapa!: ElementRef;
  mapa!: mapboxgl.Map;
  zoomLevel: number = 12;
  center: [number, number] = [-76.52752135125671, 3.3699701028686193];


  //Arreglo de marcadores
  marcadores: MarcadorColor[] = [];


  constructor(){}


  ngAfterViewInit(): void {
     this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://style/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel
    });

    this.leerLocalStorage();

    //const markerHtml: HTMLElement = document.createElement('div');
    //markerHtml.innerHTML = 'hola mundo';
     //new mapboxgl.Marker().setLngLat(this.center).addTo(this.mapa);

  }

  agregarMarcador(){

    const color = "#xxxxxx".replace(/x/g, y=>(Math.random()*16|0).toString(16));
    const nuevoMarcador = new mapboxgl.Marker({
      draggable: true,
      color
    }).setLngLat(this.center).addTo(this.mapa);
    this.marcadores.push({
      color,
      marker: nuevoMarcador,
    });
    console.log(this.marcadores);
    this.guardarMarcadoresLocalStorage();

    nuevoMarcador.on('dragend', () => {
      this.guardarMarcadoresLocalStorage();
    })
  }

  irMarcador(marker: mapboxgl.Marker){
  this.mapa.flyTo({
     center: marker.getLngLat()
  });
  }

  guardarMarcadoresLocalStorage(){
    const lnglatArr: MarcadorColor[] = [];
    this.marcadores.forEach(m =>{
      const color = m.color;
      const { lng, lat} = m.marker!.getLngLat();

      lnglatArr.push({
        color: m.color,
        centro: [lng, lat],
      });
    })
localStorage.setItem('marcadores', JSON.stringify(lnglatArr));
  }

  leerLocalStorage(){
if (!localStorage.getItem('marcadores')){
  return;
}
const lnglatArr: MarcadorColor[] = JSON.parse(localStorage.getItem('marcadores')!);
console.log(lnglatArr);

lnglatArr.forEach(m=>{
  const newMarker = new mapboxgl.Marker({
    color: m.color,
    draggable: true
  }).setLngLat(m.centro!).addTo(this.mapa);
  this.marcadores.push({
    marker: newMarker,
    color: m.color
  });

   newMarker.on('dragend', () =>{
    this.guardarMarcadoresLocalStorage();
    //console.log('drag');
   })
});
}
borrarMarcador(i: number){
this.marcadores[i].marker?.remove();
this.marcadores.splice(i,1);
this.guardarMarcadoresLocalStorage();
}

}
