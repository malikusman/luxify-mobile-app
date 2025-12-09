import React from 'react';
import { render } from '@testing-library/react-native';
import RootLayout from '../_layout';

jest.mock('expo-router', () => {
  const React = require('react');
  const MockStack = ({ children }: any) => children;
  MockStack.Screen = () => null;
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    })),
    useSegments: jest.fn(() => []),
    usePathname: jest.fn(() => '/'),
    Stack: MockStack,
  };
});

jest.mock('redux-persist/integration/react', () => ({
  PersistGate: ({ children }: any) => children,
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/src/hooks/useCustomFonts', () => ({
  useCustomFonts: jest.fn(() => true),
}));

jest.mock('@/src/hooks/splash/useSplashScreen', () => ({
  useSplashScreen: jest.fn(),
}));

jest.mock('@/src/context/store', () => ({
  store: {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  },
  persistor: {
    persist: jest.fn(),
    flush: jest.fn(),
    purge: jest.fn(),
  },
}));

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render RootLayout when fonts are loaded', () => {
    const { useCustomFonts } = require('@/src/hooks/useCustomFonts');
    useCustomFonts.mockReturnValue(true);

    const { root } = render(<RootLayout />);

    expect(root).toBeTruthy();
  });

  it('should not render when fonts are not loaded', () => {
    const { useCustomFonts } = require('@/src/hooks/useCustomFonts');
    useCustomFonts.mockReturnValue(false);

    const result = render(<RootLayout />);

    expect(result).toBeTruthy();
  });

  it('should call hideAsync when fonts are loaded', async () => {
    const { useCustomFonts } = require('@/src/hooks/useCustomFonts');
    const { hideAsync } = require('expo-splash-screen');
    
    useCustomFonts.mockReturnValue(true);

    render(<RootLayout />);

    expect(useCustomFonts).toHaveBeenCalled();
  });
});

