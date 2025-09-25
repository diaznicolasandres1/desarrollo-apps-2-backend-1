import { Injectable } from '@nestjs/common';

@Injectable()
export class CoordinatesTransformer {
  /**
   * Transforma las coordenadas de {lat, lng} a formato GeoJSON para almacenamiento
   */
  static toGeoJSON(coordinates: { lat: number; lng: number }) {
    return {
      type: 'Point' as const,
      coordinates: [coordinates.lng, coordinates.lat] as [number, number]
    };
  }

  /**
   * Transforma las coordenadas GeoJSON a formato {lat, lng} para mantener compatibilidad con el frontend
   */
  static fromGeoJSON(place: any): any {
    if (place && place.contact && place.contact.coordinates) {
      const coordinates = place.contact.coordinates;
      
      // Si ya está en formato {lat, lng}, devolverlo tal como está
      if (coordinates.lat !== undefined && coordinates.lng !== undefined) {
        return place;
      }
      
      // Si está en formato GeoJSON, convertir a {lat, lng}
      if (coordinates.type === 'Point' && Array.isArray(coordinates.coordinates)) {
        return {
          ...place,
          contact: {
            ...place.contact,
            coordinates: {
              lat: coordinates.coordinates[1], // lat es el segundo elemento
              lng: coordinates.coordinates[0]  // lng es el primer elemento
            }
          }
        };
      }
    }
    
    return place;
  }
}
