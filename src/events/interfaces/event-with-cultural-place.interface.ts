import { Event } from '../schemas/event.schema';

export interface CulturalPlaceInfo {
  _id: string;
  name: string;
  description: string;
  category: string;
  characteristics: string[];
  contact: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    phone: string;
    website: string;
    email: string;
  };
  image: string;
  rating: number;
}

export interface EventWithCulturalPlace extends Omit<Event, 'culturalPlaceId'> {
  culturalPlaceId: CulturalPlaceInfo;
}
