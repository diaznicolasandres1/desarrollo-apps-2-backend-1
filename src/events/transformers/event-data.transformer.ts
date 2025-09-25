import { Injectable } from '@nestjs/common';
import { CreateEventDto } from '../dto/create-event.dto';
import { Types } from 'mongoose';

@Injectable()
export class EventDataTransformer {
  /**
   * Transforma los datos del DTO para la creación de un evento
   */
  transformCreateEventData(createEventDto: CreateEventDto): any {
    return {
      ...createEventDto,
      culturalPlaceId: new Types.ObjectId(createEventDto.culturalPlaceId),
      date: new Date(createEventDto.date),
      ticketTypes: createEventDto.ticketTypes.map(ticketType => ({
        ...ticketType,
        soldQuantity: 0,
        isActive: ticketType.isActive ?? true
      }))
    };
  }

  /**
   * Transforma las coordenadas GeoJSON del lugar cultural a formato {lat, lng} para mantener compatibilidad con el frontend
   */
  transformEventCoordinates(event: any): any {
    // Convertir a objeto plano primero
    const plainEvent = this.toPlainObject(event);
    
    if (plainEvent && plainEvent.culturalPlaceId && plainEvent.culturalPlaceId.contact && plainEvent.culturalPlaceId.contact.coordinates) {
      const coordinates = plainEvent.culturalPlaceId.contact.coordinates;
      
      // Si ya está en formato {lat, lng}, devolverlo tal como está
      if (coordinates.lat !== undefined && coordinates.lng !== undefined) {
        return plainEvent;
      }
      
      // Si está en formato GeoJSON, convertir a {lat, lng}
      if (coordinates.type === 'Point' && Array.isArray(coordinates.coordinates)) {
        return {
          ...plainEvent,
          culturalPlaceId: {
            ...plainEvent.culturalPlaceId,
            contact: {
              ...plainEvent.culturalPlaceId.contact,
              coordinates: {
                lat: coordinates.coordinates[1], // lat es el segundo elemento
                lng: coordinates.coordinates[0]  // lng es el primer elemento
              }
            }
          }
        };
      }
    }
    
    return plainEvent;
  }

  /**
   * Transforma un array de eventos aplicando la transformación de coordenadas
   */
  transformEventsCoordinates(events: any[]): any[] {
    return events.map(event => {
      return this.transformEventCoordinates(event);
    });
  }

  /**
   * Convierte un documento de Mongoose a objeto plano
   */
  private toPlainObject(doc: any): any {
    if (doc && typeof doc.toObject === 'function') {
      return doc.toObject();
    }
    return doc;
  }
}
