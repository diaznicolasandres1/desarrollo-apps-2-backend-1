import { ColorService } from '../color.service';

describe('ColorService', () => {
  describe('generateRandomColor', () => {
    it('should return a valid hex color', () => {
      const color = ColorService.generateRandomColor();
      
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should return a color from the predefined palette', () => {
      const predefinedColors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
        '#FF9FF3', '#A8E6CF', '#FFD93D', '#6C5CE7', '#FD79A8',
        '#00B894', '#FDCB6E', '#E17055', '#74B9FF', '#81ECEC'
      ];

      const color = ColorService.generateRandomColor();
      
      expect(predefinedColors).toContain(color);
    });

    it('should return different colors on multiple calls (statistical test)', () => {
      const colors = new Set();
      
      // Generate 50 colors and check that we get some variety
      for (let i = 0; i < 50; i++) {
        colors.add(ColorService.generateRandomColor());
      }

      // We should get at least 5 different colors (statistical expectation)
      expect(colors.size).toBeGreaterThan(5);
    });

    it('should return a string', () => {
      const color = ColorService.generateRandomColor();
      
      expect(typeof color).toBe('string');
    });

    it('should return colors with 7 characters (#RRGGBB)', () => {
      const color = ColorService.generateRandomColor();
      
      expect(color).toHaveLength(7);
    });

    it('should return colors starting with #', () => {
      const color = ColorService.generateRandomColor();
      
      expect(color).toMatch(/^#/);
    });

    it('should return valid hex colors only', () => {
      const validHexPattern = /^#[0-9A-F]{6}$/i;
      
      // Test multiple times to ensure consistency
      for (let i = 0; i < 20; i++) {
        const color = ColorService.generateRandomColor();
        expect(color).toMatch(validHexPattern);
      }
    });

    it('should not return null or undefined', () => {
      const color = ColorService.generateRandomColor();
      
      expect(color).not.toBeNull();
      expect(color).not.toBeUndefined();
    });

    it('should return colors from the exact predefined list', () => {
      const expectedColors = [
        '#FF6B6B', // Rojo coral
        '#4ECDC4', // Turquesa
        '#45B7D1', // Azul claro
        '#96CEB4', // Verde menta
        '#FECA57', // Amarillo dorado
        '#FF9FF3', // Rosa
        '#A8E6CF', // Verde claro
        '#FFD93D', // Amarillo brillante
        '#6C5CE7', // Morado
        '#FD79A8', // Rosa fuerte
        '#00B894', // Verde esmeralda
        '#FDCB6E', // Naranja suave
        '#E17055', // Rojo terracota
        '#74B9FF', // Azul cielo
        '#81ECEC', // Cian
      ];

      // Generate many colors to ensure we can get all predefined ones
      const generatedColors = new Set();
      for (let i = 0; i < 1000; i++) {
        generatedColors.add(ColorService.generateRandomColor());
      }

      // All predefined colors should be possible to generate
      expectedColors.forEach(expectedColor => {
        expect(generatedColors.has(expectedColor)).toBe(true);
      });
    });
  });
});
