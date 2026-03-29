import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TabsLayout from '../_layout';
import themeReducer from '@/src/context/slices/themeSlice';

let mockScreenOptions: any = null;
let mockTabScreens: Array<{ name: string; options: any }> = [];
jest.mock('expo-router', () => {
  const React = require('react');
  const MockTabs = ({ children, screenOptions }: any) => {
    mockScreenOptions = screenOptions;
    return React.createElement('View', { testID: 'tabs-container' }, children);
  };
  MockTabs.Screen = ({ name, options }: any) => {
    mockTabScreens.push({ name, options });
    return null;
  };
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    })),
    useSegments: jest.fn(() => []),
    usePathname: jest.fn(() => '/'),
    Tabs: MockTabs,
  };
});

const mockUseSafeAreaInsets = jest.fn(() => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => mockUseSafeAreaInsets(),
  SafeAreaProvider: ({ children }: any) => children,
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      theme: themeReducer,
    },
    preloadedState: {
      theme: { isDarkMode: false },
      ...initialState,
    },
  });
};

describe('TabsLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockScreenOptions = null;
    mockTabScreens = [];
  });

  it('should render TabsLayout component', () => {
    const store = createMockStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <TabsLayout />
      </Provider>
    );

    expect(getByTestId('tabs-container')).toBeTruthy();
  });

  it('should render with light theme', () => {
    const store = createMockStore({
      theme: { isDarkMode: false },
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <TabsLayout />
      </Provider>
    );

    expect(getByTestId('tabs-container')).toBeTruthy();
  });

  it('should render with dark theme', () => {
    const store = createMockStore({
      theme: { isDarkMode: true },
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <TabsLayout />
      </Provider>
    );

    expect(getByTestId('tabs-container')).toBeTruthy();
  });

  it('should use safe area insets', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TabsLayout />
      </Provider>
    );

    expect(mockUseSafeAreaInsets).toHaveBeenCalled();
  });

  it('should configure Tabs with headerShown false', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TabsLayout />
      </Provider>
    );

    expect(mockScreenOptions).toBeTruthy();
    expect(mockScreenOptions.headerShown).toBe(false);
  });

  it('should configure Tabs with tabBarStyle display none', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TabsLayout />
      </Provider>
    );

    expect(mockScreenOptions).toBeTruthy();
    expect(mockScreenOptions.tabBarStyle).toEqual({ display: 'none' });
  });

  it('should render all required tab screens', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TabsLayout />
      </Provider>
    );

    const expectedTabs = ['index', 'closet', 'outfits', 'shop', 'deals'];
    expect(mockTabScreens).toHaveLength(5);
    expectedTabs.forEach((tabName) => {
      expect(mockTabScreens.some((screen) => screen.name === tabName)).toBe(true);
    });
  });

  it('should configure each tab screen with tabBarStyle display none', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TabsLayout />
      </Provider>
    );

    mockTabScreens.forEach((screen) => {
      expect(screen.options).toBeTruthy();
      expect(screen.options.tabBarStyle).toEqual({ display: 'none' });
    });
  });
});

