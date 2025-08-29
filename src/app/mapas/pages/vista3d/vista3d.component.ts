import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../../../environments/environments';

interface SavedLocation {
  id: string;
  name: string;
  shortName: string;
  emoji?: string;
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

@Component({
  selector: 'app-vista3d',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vista3d.component.html',
  styles: [`
    .mapa-container {
      height: 100vh;
      width: 100%;
    }

    .controls {
      position: absolute;
      top: 20px;
      left: 160px;
      z-index: 1000;
      background: #ffffff80;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .controls h4 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .control-group {
      margin-bottom: 10px;
    }

    .control-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      font-size: 12px;
    }

    .control-group button {
      margin-right: 5px;
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      background: #007cbf;
      color: white;
      cursor: pointer;
      font-size: 11px;
    }

    .control-group button:hover {
      background: #005a8c;
    }

    .control-group button.active {
      background: #28a745;
    }

    .search-container {
      display: flex;
      gap: 5px;
      margin-bottom: 5px;
    }

    .search-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 12px;
    }

    .search-btn {
      padding: 8px 12px !important;
      margin: 0 !important;
    }

    .loading {
      font-size: 12px;
      color: #666;
      font-style: italic;
    }

    .locations-grid {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .location-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .location-item button:first-child {
      flex: 1;
      text-align: left;
      font-size: 11px;
      padding: 6px 8px;
    }

    .remove-btn {
      background: #dc3545 !important;
      color: white;
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      padding: 0 !important;
      margin: 0 !important;
      font-size: 12px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remove-btn:hover {
      background: #c82333 !important;
    }

    .no-locations {
      font-size: 11px;
      color: #666;
      font-style: italic;
      text-align: center;
      padding: 10px;
    }

    .control-group button.reset {
      background: #dc3545;
    }

    .slider-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .slider-container input {
      width: 100px;
    }

    .info-panel {
      position: absolute;
      bottom: 20px;
      left: 20px;
      z-index: 1000;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      max-width: 300px;
    }

    .info-panel h5 {
      margin: 0 0 10px 0;
    }

    .info-panel ul {
      margin: 0;
      padding-left: 20px;
    }

    .info-panel p {
      margin: 10px 0 0 0;
      font-size: 11px;
      opacity: 0.8;
    }

    .mapa-element {
      width: 100%;
      height: 100%;
    }
  `]
})
export class Vista3dComponent implements AfterViewInit, OnDestroy {

  @ViewChild('mapa') mapaElemento!: ElementRef;
  
  public mapa!: mapboxgl.Map;
  public terrainEnabled = false;
  public buildingsEnabled = false;
  public fogEnabled = false;
  public exaggeration = 1.5;

  // Propiedades para búsqueda
  public searchQuery = '';
  public searchLoading = false;
  public defaultLocations: SavedLocation[] = [];
  public recentSearches: SavedLocation[] = [];

  private readonly STORAGE_KEY = 'vista3d-locations';
  private readonly MAX_RECENT_SEARCHES = 5;

  ngAfterViewInit(): void {
    this.loadSavedLocations();
    this.initializeDefaultLocations();
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.mapa) {
      this.mapa.remove();
    }
  }

  private initializeDefaultLocations(): void {
    const allDefaultLocations = [
      {
        id: 'nyc',
        name: 'Nueva York, Estados Unidos',
        shortName: 'Nueva York',
        emoji: '🏙️',
        center: [-74.006, 40.7128] as [number, number],
        zoom: 15.5,
        pitch: 60,
        bearing: -17.6
      },
      {
        id: 'everest',
        name: 'Monte Everest, Nepal',
        shortName: 'Everest',
        emoji: '🏔️',
        center: [86.9250, 27.9881] as [number, number],
        zoom: 13,
        pitch: 70,
        bearing: 80
      },
      {
        id: 'grandcanyon',
        name: 'Gran Cañón, Arizona',
        shortName: 'Gran Cañón',
        emoji: '🏜️',
        center: [-112.1401, 36.0544] as [number, number],
        zoom: 12,
        pitch: 60,
        bearing: 0
      },
      {
        id: 'swiss',
        name: 'Alpes Suizos, Suiza',
        shortName: 'Alpes Suizos',
        emoji: '🏔️',
        center: [7.7521, 46.0207] as [number, number],
        zoom: 14,
        pitch: 80,
        bearing: 160
      }
    ];

    // Filtrar ubicaciones que han sido eliminadas
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        const removedDefaults = data.removedDefaults || [];
        this.defaultLocations = allDefaultLocations.filter(loc => 
          !removedDefaults.includes(loc.id)
        );
      } else {
        this.defaultLocations = [...allDefaultLocations];
      }
    } catch (error) {
      this.defaultLocations = [...allDefaultLocations];
    }
  }

  private loadSavedLocations(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.recentSearches = data.recentSearches || [];
        
        // Filtrar ubicaciones predefinidas que hayan sido eliminadas
        const removedDefaults = data.removedDefaults || [];
        // Este filtro se aplicará en initializeDefaultLocations
      }
    } catch (error) {
      console.error('Error al cargar ubicaciones guardadas:', error);
      this.recentSearches = [];
    }
  }

  private saveLocations(): void {
    try {
      const removedDefaults = this.defaultLocations.length === 0 ? 
        ['nyc', 'everest', 'grandcanyon', 'swiss'] : 
        ['nyc', 'everest', 'grandcanyon', 'swiss'].filter(id => 
          !this.defaultLocations.find(loc => loc.id === id)
        );

      const data = {
        recentSearches: this.recentSearches,
        removedDefaults: removedDefaults
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error al guardar ubicaciones:', error);
    }
  }

  private initializeMap(): void {
    // Configurar el token de acceso de Mapbox
    (mapboxgl as any).accessToken = environment.mapboxToken;
    
    this.mapa = new mapboxgl.Map({
      container: this.mapaElemento.nativeElement,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-74.006, 40.7128], // Nueva York
      zoom: 15.5,
      pitch: 60, // Ángulo de inclinación para vista 3D
      bearing: -17.6, // Rotación del mapa
      antialias: true // Mejora la calidad visual
    });

    this.mapa.on('load', () => {
      // Añadir controles de navegación 3D
      this.mapa.addControl(new mapboxgl.NavigationControl());
      
      // Configurar la fuente de terreno
      this.mapa.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });

      // Inicialmente activar el terreno 3D
      this.enableTerrain();
      this.enableBuildings();
      this.enableFog();
    });
  }

  public toggleTerrain(): void {
    if (this.terrainEnabled) {
      this.mapa.setTerrain(null);
      this.terrainEnabled = false;
    } else {
      this.enableTerrain();
    }
  }

  private enableTerrain(): void {
    this.mapa.setTerrain({
      'source': 'mapbox-dem',
      'exaggeration': this.exaggeration
    });
    this.terrainEnabled = true;
  }

  public toggleBuildings(): void {
    if (this.buildingsEnabled) {
      this.mapa.removeLayer('3d-buildings');
      this.buildingsEnabled = false;
    } else {
      this.enableBuildings();
    }
  }

  private enableBuildings(): void {
    // Verificar si la capa ya existe
    if (this.mapa.getLayer('3d-buildings')) {
      return;
    }

    this.mapa.addLayer({
      'id': '3d-buildings',
      'source': 'composite',
      'source-layer': 'building',
      'filter': ['==', 'extrude', 'true'],
      'type': 'fill-extrusion',
      'minzoom': 15,
      'paint': {
        'fill-extrusion-color': '#aaa',
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'height']
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'min_height']
        ],
        'fill-extrusion-opacity': 0.6
      }
    });
    this.buildingsEnabled = true;
  }

  public toggleFog(): void {
    if (this.fogEnabled) {
      this.mapa.setFog(null);
      this.fogEnabled = false;
    } else {
      this.enableFog();
    }
  }

  private enableFog(): void {
    this.mapa.setFog({
      'color': 'rgb(186, 210, 235)', // Color azul claro
      'high-color': 'rgb(36, 92, 223)', // Color azul alto
      'horizon-blend': 0.02, // Mezcla del horizonte
      'space-color': 'rgb(11, 11, 25)', // Color del espacio
      'star-intensity': 0.6 // Intensidad de las estrellas
    });
    this.fogEnabled = true;
  }

  public updateExaggeration(value: number): void {
    this.exaggeration = value;
    if (this.terrainEnabled) {
      this.mapa.setTerrain({
        'source': 'mapbox-dem',
        'exaggeration': this.exaggeration
      });
    }
  }

  public flyToLocation(location: string): void {
    const locations = {
      'nyc': {
        center: [-74.006, 40.7128] as [number, number],
        zoom: 15.5,
        pitch: 60,
        bearing: -17.6
      },
      'everest': {
        center: [86.9250, 27.9881] as [number, number],
        zoom: 13,
        pitch: 70,
        bearing: 80
      },
      'grandcanyon': {
        center: [-112.1401, 36.0544] as [number, number],
        zoom: 12,
        pitch: 60,
        bearing: 0
      },
      'swiss': {
        center: [7.7521, 46.0207] as [number, number],
        zoom: 14,
        pitch: 80,
        bearing: 160
      }
    };

    const config = locations[location as keyof typeof locations];
    if (config) {
      this.mapa.flyTo({
        ...config,
        duration: 3000,
        essential: true
      });
    }
  }

  public resetView(): void {
    this.mapa.flyTo({
      center: [-74.006, 40.7128],
      zoom: 15.5,
      pitch: 60,
      bearing: -17.6,
      duration: 2000
    });
  }

  // Métodos para búsqueda y gestión de ubicaciones
  public async searchLocation(): Promise<void> {
    if (!this.searchQuery.trim()) {
      alert('Por favor, escribe algo para buscar');
      return;
    }

    console.log('Iniciando búsqueda para:', this.searchQuery);
    this.searchLoading = true;
    
    try {
      // Usar el token de Mapbox desde el archivo de ambiente
      const accessToken = environment.mapboxToken;
      
      if (!accessToken || accessToken === 'TU_TOKEN_AQUI') {
        alert('⚠️ Configuración requerida: Token de Mapbox no configurado.\n\nConfigura tu token en src/environments/environments.ts');
        this.searchLoading = false;
        return;
      }
      
      const encodedQuery = encodeURIComponent(this.searchQuery.trim());
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${accessToken}&types=poi,place,address&limit=1`;

      console.log('URL de búsqueda:', url);
      
      const response = await fetch(url);
      console.log('Respuesta HTTP:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        console.log('Ubicación encontrada:', feature);
        
        const [lng, lat] = feature.center;
        
        const newLocation: SavedLocation = {
          id: `search_${Date.now()}`,
          name: feature.place_name,
          shortName: feature.text || this.searchQuery,
          center: [lng, lat],
          zoom: 15,
          pitch: 60,
          bearing: 0
        };

        console.log('Nueva ubicación creada:', newLocation);

        // Agregar a búsquedas recientes
        this.addToRecentSearches(newLocation);
        
        // Volar a la ubicación
        this.flyToSavedLocation(newLocation);
        
        // Limpiar búsqueda
        this.searchQuery = '';
        
        console.log('Búsqueda completada exitosamente');
      } else {
        console.log('No se encontraron resultados en la respuesta');
        alert('No se encontró la ubicación. Intenta con otro término de búsqueda.');
      }
    } catch (error) {
      console.error('Error detallado en la búsqueda:', error);
      alert(`Error al buscar la ubicación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.searchLoading = false;
      console.log('Búsqueda finalizada');
    }
  }

  public flyToSavedLocation(location: SavedLocation): void {
    this.mapa.flyTo({
      center: location.center,
      zoom: location.zoom,
      pitch: location.pitch,
      bearing: location.bearing,
      duration: 3000,
      essential: true
    });
  }

  public removeLocation(locationId: string, type: 'default' | 'recent'): void {
    if (type === 'default') {
      this.defaultLocations = this.defaultLocations.filter(loc => loc.id !== locationId);
    } else {
      this.recentSearches = this.recentSearches.filter(loc => loc.id !== locationId);
    }
    this.saveLocations();
  }

  private addToRecentSearches(location: SavedLocation): void {
    // Eliminar si ya existe
    this.recentSearches = this.recentSearches.filter(loc => 
      loc.center[0] !== location.center[0] || loc.center[1] !== location.center[1]
    );
    
    // Agregar al inicio
    this.recentSearches.unshift(location);
    
    // Mantener solo las últimas N búsquedas
    if (this.recentSearches.length > this.MAX_RECENT_SEARCHES) {
      this.recentSearches = this.recentSearches.slice(0, this.MAX_RECENT_SEARCHES);
    }
    
    this.saveLocations();
  }
}
