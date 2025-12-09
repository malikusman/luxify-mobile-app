import { renderHook } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { useThemeColors, Colors } from '../Colors';
import themeReducer from '@/src/context/slices/themeSlice';

const createWrapper = (isDarkMode: boolean) => {
  const store = configureStore({
    reducer: {
      theme: themeReducer,
    },
    preloadedState: {
      theme: { isDarkMode },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('Colors', () => {
  describe('useThemeColors', () => {
    it('should return light colors when not in dark mode', () => {
      const wrapper = createWrapper(false);
      const { result } = renderHook(() => useThemeColors(), { wrapper });

      expect(result.current).toEqual(Colors.light);
    });

    it('should return dark colors when in dark mode', () => {
      const wrapper = createWrapper(true);
      const { result } = renderHook(() => useThemeColors(), { wrapper });

      expect(result.current).toEqual(Colors.dark);
    });
  });

  describe('Color definitions', () => {
    it('should have all required light theme colors', () => {
      expect(Colors.light).toHaveProperty('primary');
      expect(Colors.light).toHaveProperty('background');
      expect(Colors.light).toHaveProperty('text');
      expect(Colors.light).toHaveProperty('buttonPrimary');
      expect(Colors.light).toHaveProperty('google');
      expect(Colors.light).toHaveProperty('facebook');
      expect(Colors.light).toHaveProperty('apple');
    });

    it('should have all required dark theme colors', () => {
      expect(Colors.dark).toHaveProperty('primary');
      expect(Colors.dark).toHaveProperty('background');
      expect(Colors.dark).toHaveProperty('text');
      expect(Colors.dark).toHaveProperty('buttonPrimary');
      expect(Colors.dark).toHaveProperty('google');
      expect(Colors.dark).toHaveProperty('facebook');
      expect(Colors.dark).toHaveProperty('apple');
    });
  });
});

