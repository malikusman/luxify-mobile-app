import { scaleFontSize } from '../FontSizeUtil';

describe('FontSizeUtil', () => {
  describe('scaleFontSize', () => {
    it('should scale font size and return a number', () => {
      const fontSize = scaleFontSize(16);
      expect(fontSize).toBeGreaterThan(0);
      expect(typeof fontSize).toBe('number');
      expect(Number.isInteger(fontSize)).toBe(true);
    });

    it('should handle different font sizes', () => {
      expect(scaleFontSize(12)).toBeGreaterThan(0);
      expect(scaleFontSize(14)).toBeGreaterThan(0);
      expect(scaleFontSize(16)).toBeGreaterThan(0);
      expect(scaleFontSize(20)).toBeGreaterThan(0);
      expect(scaleFontSize(24)).toBeGreaterThan(0);
    });

    it('should return rounded values', () => {
      const fontSize = scaleFontSize(16);
      expect(Number.isInteger(fontSize)).toBe(true);
    });

    it('should handle zero and negative values gracefully', () => {
      const zeroResult = scaleFontSize(0);
      expect(typeof zeroResult).toBe('number');
      
      const negativeResult = scaleFontSize(-10);
      expect(typeof negativeResult).toBe('number');
    });

    it('should handle large font sizes', () => {
      const largeSize = scaleFontSize(100);
      expect(largeSize).toBeGreaterThan(0);
      expect(typeof largeSize).toBe('number');
    });
  });
});

