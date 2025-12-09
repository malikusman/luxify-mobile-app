import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CustomCheckbox from '../CustomCheckbox';
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

describe('CustomCheckbox', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with label', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <CustomCheckbox label="Test Checkbox" checked={false} onPress={mockOnPress} />
      </Provider>
    );

    expect(getByText('Test Checkbox')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <CustomCheckbox label="Test Checkbox" checked={false} onPress={mockOnPress} />
      </Provider>
    );

    fireEvent.press(getByText('Test Checkbox'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should show checkmark when checked', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <CustomCheckbox label="Test Checkbox" checked={true} onPress={mockOnPress} />
      </Provider>
    );

    expect(getByText('Test Checkbox')).toBeTruthy();
  });

  it('should not show checkmark when unchecked', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <CustomCheckbox label="Test Checkbox" checked={false} onPress={mockOnPress} />
      </Provider>
    );

    expect(getByText('Test Checkbox')).toBeTruthy();
  });
});

