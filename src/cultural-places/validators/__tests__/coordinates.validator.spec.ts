import { BadRequestException } from '@nestjs/common';
import { CoordinatesValidator } from '../coordinates.validator';

describe('CoordinatesValidator', () => {
  describe('validate', () => {
    it('should validate correct coordinates', () => {
      const validCoordinates = { lat: -34.6037, lng: -58.3816 };
      
      expect(() => CoordinatesValidator.validate(validCoordinates)).not.toThrow();
    });

    it('should validate coordinates at extreme values', () => {
      const extremeCoordinates = [
        { lat: -90, lng: -180 },
        { lat: 90, lng: 180 },
        { lat: 0, lng: 0 }
      ];

      extremeCoordinates.forEach(coords => {
        expect(() => CoordinatesValidator.validate(coords)).not.toThrow();
      });
    });

    it('should throw BadRequestException for non-number lat', () => {
      const invalidCoordinates = { lat: 'invalid', lng: -58.3816 } as any;
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow(BadRequestException);
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow('Coordinates must have lat and lng as numbers');
    });

    it('should throw BadRequestException for non-number lng', () => {
      const invalidCoordinates = { lat: -34.6037, lng: 'invalid' } as any;
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow(BadRequestException);
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow('Coordinates must have lat and lng as numbers');
    });

    it('should throw BadRequestException for undefined lat', () => {
      const invalidCoordinates = { lat: undefined, lng: -58.3816 } as any;
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow(BadRequestException);
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow('Coordinates must have lat and lng as numbers');
    });

    it('should throw BadRequestException for undefined lng', () => {
      const invalidCoordinates = { lat: -34.6037, lng: undefined } as any;
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow(BadRequestException);
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow('Coordinates must have lat and lng as numbers');
    });

    it('should throw BadRequestException for latitude out of range (too low)', () => {
      const invalidCoordinates = { lat: -91, lng: -58.3816 };
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow(BadRequestException);
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow('Latitude must be between -90 and 90');
    });

    it('should throw BadRequestException for latitude out of range (too high)', () => {
      const invalidCoordinates = { lat: 91, lng: -58.3816 };
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow(BadRequestException);
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow('Latitude must be between -90 and 90');
    });

    it('should throw BadRequestException for longitude out of range (too low)', () => {
      const invalidCoordinates = { lat: -34.6037, lng: -181 };
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow(BadRequestException);
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow('Longitude must be between -180 and 180');
    });

    it('should throw BadRequestException for longitude out of range (too high)', () => {
      const invalidCoordinates = { lat: -34.6037, lng: 181 };
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow(BadRequestException);
      
      expect(() => CoordinatesValidator.validate(invalidCoordinates))
        .toThrow('Longitude must be between -180 and 180');
    });

    it('should validate decimal coordinates', () => {
      const decimalCoordinates = { lat: -34.603722, lng: -58.381592 };
      
      expect(() => CoordinatesValidator.validate(decimalCoordinates)).not.toThrow();
    });

    it('should validate integer coordinates', () => {
      const integerCoordinates = { lat: 0, lng: 0 };
      
      expect(() => CoordinatesValidator.validate(integerCoordinates)).not.toThrow();
    });
  });
});
