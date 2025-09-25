import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class CoordinatesValidator {
  /**
   * Valida que las coordenadas sean números válidos y estén dentro de los rangos permitidos
   */
  static validate(coordinates: { lat: number; lng: number }): void {
    if (typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
      throw new BadRequestException('Coordinates must have lat and lng as numbers');
    }
    
    if (coordinates.lat < -90 || coordinates.lat > 90) {
      throw new BadRequestException('Latitude must be between -90 and 90');
    }
    
    if (coordinates.lng < -180 || coordinates.lng > 180) {
      throw new BadRequestException('Longitude must be between -180 and 180');
    }
  }
}
