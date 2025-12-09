import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import OutfitsScreen from '../outfits';
import themeReducer from '@/src/context/slices/themeSlice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      theme: themeReducer,
    },
    preloadedState: {
      theme: { isDarkMode: false },
    },
  });
};

describe('OutfitsScreen', () => {
  const mockRouterReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-router').useRouter.mockReturnValue({
      replace: mockRouterReplace,
    });
  });

  it('should render outfits screen', () => {
    const store = createMockStore();
    const { root } = render(
      <Provider store={store}>
        <OutfitsScreen />
      </Provider>
    );

    expect(root).toBeTruthy();
  });

  it('should navigate to AIChat on mount', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <OutfitsScreen />
      </Provider>
    );

    expect(mockRouterReplace).toHaveBeenCalledWith('/home/AIChat');
  });
});

