import { renderHook } from '@testing-library/react-hooks';
import { useCustomFonts } from '../useCustomFonts';

describe('useCustomFonts', () => {
  it('should return fontsLoaded status', () => {
    const { result } = renderHook(() => useCustomFonts());

    expect(result.current).toBe(true);
  });
});

