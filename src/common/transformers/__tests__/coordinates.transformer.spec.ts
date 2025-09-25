import { CoordinatesTransformer } from '../coordinates.transformer';

describe('CoordinatesTransformer', () => {
  describe('toGeoJSON', () => {
    it('should transform lat/lng coordinates to GeoJSON format', () => {
      const coordinates = { lat: -34.6037, lng: -58.3816 };
      const result = CoordinatesTransformer.toGeoJSON(coordinates);

      expect(result).toEqual({
        type: 'Point',
        coordinates: [-58.3816, -34.6037]
      });
    });

    it('should handle zero coordinates', () => {
      const coordinates = { lat: 0, lng: 0 };
      const result = CoordinatesTransformer.toGeoJSON(coordinates);

      expect(result).toEqual({
        type: 'Point',
        coordinates: [0, 0]
      });
    });

    it('should handle negative coordinates', () => {
      const coordinates = { lat: -90, lng: -180 };
      const result = CoordinatesTransformer.toGeoJSON(coordinates);

      expect(result).toEqual({
        type: 'Point',
        coordinates: [-180, -90]
      });
    });

    it('should handle positive coordinates', () => {
      const coordinates = { lat: 90, lng: 180 };
      const result = CoordinatesTransformer.toGeoJSON(coordinates);

      expect(result).toEqual({
        type: 'Point',
        coordinates: [180, 90]
      });
    });

    it('should handle decimal coordinates', () => {
      const coordinates = { lat: -34.603722, lng: -58.381592 };
      const result = CoordinatesTransformer.toGeoJSON(coordinates);

      expect(result).toEqual({
        type: 'Point',
        coordinates: [-58.381592, -34.603722]
      });
    });
  });

  describe('fromGeoJSON', () => {
    it('should transform GeoJSON coordinates to lat/lng format', () => {
      const place = {
        id: '123',
        name: 'Test Place',
        contact: {
          address: 'Test Address',
          coordinates: {
            type: 'Point',
            coordinates: [-58.3816, -34.6037]
          }
        }
      };

      const result = CoordinatesTransformer.fromGeoJSON(place);

      expect(result).toEqual({
        id: '123',
        name: 'Test Place',
        contact: {
          address: 'Test Address',
          coordinates: {
            lat: -34.6037,
            lng: -58.3816
          }
        }
      });
    });

    it('should return place unchanged if already in lat/lng format', () => {
      const place = {
        id: '123',
        name: 'Test Place',
        contact: {
          address: 'Test Address',
          coordinates: {
            lat: -34.6037,
            lng: -58.3816
          }
        }
      };

      const result = CoordinatesTransformer.fromGeoJSON(place);

      expect(result).toEqual(place);
    });

    it('should handle zero coordinates', () => {
      const place = {
        id: '123',
        contact: {
          coordinates: {
            type: 'Point',
            coordinates: [0, 0]
          }
        }
      };

      const result = CoordinatesTransformer.fromGeoJSON(place);

      expect(result).toEqual({
        id: '123',
        contact: {
          coordinates: {
            lat: 0,
            lng: 0
          }
        }
      });
    });

    it('should handle negative coordinates', () => {
      const place = {
        id: '123',
        contact: {
          coordinates: {
            type: 'Point',
            coordinates: [-180, -90]
          }
        }
      };

      const result = CoordinatesTransformer.fromGeoJSON(place);

      expect(result).toEqual({
        id: '123',
        contact: {
          coordinates: {
            lat: -90,
            lng: -180
          }
        }
      });
    });

    it('should handle positive coordinates', () => {
      const place = {
        id: '123',
        contact: {
          coordinates: {
            type: 'Point',
            coordinates: [180, 90]
          }
        }
      };

      const result = CoordinatesTransformer.fromGeoJSON(place);

      expect(result).toEqual({
        id: '123',
        contact: {
          coordinates: {
            lat: 90,
            lng: 180
          }
        }
      });
    });

    it('should handle decimal coordinates', () => {
      const place = {
        id: '123',
        contact: {
          coordinates: {
            type: 'Point',
            coordinates: [-58.381592, -34.603722]
          }
        }
      };

      const result = CoordinatesTransformer.fromGeoJSON(place);

      expect(result).toEqual({
        id: '123',
        contact: {
          coordinates: {
            lat: -34.603722,
            lng: -58.381592
          }
        }
      });
    });

    it('should return place unchanged if no coordinates', () => {
      const place = {
        id: '123',
        name: 'Test Place',
        contact: {
          address: 'Test Address'
        }
      };

      const result = CoordinatesTransformer.fromGeoJSON(place);

      expect(result).toEqual(place);
    });

    it('should return place unchanged if no contact', () => {
      const place = {
        id: '123',
        name: 'Test Place'
      };

      const result = CoordinatesTransformer.fromGeoJSON(place);

      expect(result).toEqual(place);
    });

    it('should return place unchanged if place is null', () => {
      const result = CoordinatesTransformer.fromGeoJSON(null);

      expect(result).toBeNull();
    });

    it('should return place unchanged if place is undefined', () => {
      const result = CoordinatesTransformer.fromGeoJSON(undefined);

      expect(result).toBeUndefined();
    });

    it('should return place unchanged if coordinates is not Point type', () => {
      const place = {
        id: '123',
        contact: {
          coordinates: {
            type: 'LineString',
            coordinates: [[-58.3816, -34.6037], [-58.3817, -34.6038]]
          }
        }
      };

      const result = CoordinatesTransformer.fromGeoJSON(place);

      expect(result).toEqual(place);
    });

    it('should return place unchanged if coordinates is not an array', () => {
      const place = {
        id: '123',
        contact: {
          coordinates: {
            type: 'Point',
            coordinates: 'invalid'
          }
        }
      };

      const result = CoordinatesTransformer.fromGeoJSON(place);

      expect(result).toEqual(place);
    });

    it('should preserve all other properties of the place', () => {
      const place = {
        id: '123',
        name: 'Test Place',
        description: 'Test Description',
        category: 'Museum',
        rating: 4.5,
        isActive: true,
        color: '#FF0000',
        image: 'test.jpg',
        schedules: {
          monday: { open: '09:00', close: '18:00', closed: false }
        },
        contact: {
          address: 'Test Address',
          phone: '+1234567890',
          website: 'https://test.com',
          email: 'test@test.com',
          coordinates: {
            type: 'Point',
            coordinates: [-58.3816, -34.6037]
          }
        }
      };

      const result = CoordinatesTransformer.fromGeoJSON(place);

      expect(result).toEqual({
        ...place,
        contact: {
          ...place.contact,
          coordinates: {
            lat: -34.6037,
            lng: -58.3816
          }
        }
      });
    });
  });
});
