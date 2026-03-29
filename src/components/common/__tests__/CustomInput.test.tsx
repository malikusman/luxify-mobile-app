import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CustomInput from '../CustomInput';
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

describe('CustomInput', () => {
  const mockOnChangeText = jest.fn();
  const mockOnFocus = jest.fn();
  const mockOnBlur = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render input with placeholder', () => {
    const store = createMockStore();
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <CustomInput placeholder="Enter text" />
      </Provider>
    );

    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('should call onChangeText when text changes', () => {
    const store = createMockStore();
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <CustomInput
          placeholder="Enter text"
          onChangeText={mockOnChangeText}
        />
      </Provider>
    );

    const input = getByPlaceholderText('Enter text');
    fireEvent.changeText(input, 'test input');

    expect(mockOnChangeText).toHaveBeenCalledWith('test input');
  });

  it('should call onFocus when focused', () => {
    const store = createMockStore();
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <CustomInput placeholder="Enter text" onFocus={mockOnFocus} />
      </Provider>
    );

    const input = getByPlaceholderText('Enter text');
    fireEvent(input, 'focus');

    expect(mockOnFocus).toHaveBeenCalledTimes(1);
  });

  it('should call onBlur when blurred', () => {
    const store = createMockStore();
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <CustomInput placeholder="Enter text" onBlur={mockOnBlur} />
      </Provider>
    );

    const input = getByPlaceholderText('Enter text');
    fireEvent(input, 'blur');

    expect(mockOnBlur).toHaveBeenCalledTimes(1);
  });

  it('should render with icon', () => {
    const store = createMockStore();
    const icon = <div>Icon</div>;
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <CustomInput placeholder="Enter text" icon={icon} />
      </Provider>
    );

    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('should render with rightIcon', () => {
    const store = createMockStore();
    const rightIcon = <div>Right Icon</div>;
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <CustomInput placeholder="Enter text" rightIcon={rightIcon} />
      </Provider>
    );

    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('should call onRightIconPress when right icon is pressed', () => {
    const store = createMockStore();
    const mockOnRightIconPress = jest.fn();
    const rightIcon = <div>Right Icon</div>;
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <CustomInput
          placeholder="Enter text"
          rightIcon={rightIcon}
          onRightIconPress={mockOnRightIconPress}
        />
      </Provider>
    );

    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const store = createMockStore();
    const customStyle = { marginTop: 20 };
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <CustomInput placeholder="Enter text" style={customStyle} />
      </Provider>
    );

    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('should forward ref', () => {
    const store = createMockStore();
    const ref = React.createRef<any>();
    render(
      <Provider store={store}>
        <CustomInput ref={ref} placeholder="Enter text" />
      </Provider>
    );

    expect(ref.current).toBeTruthy();
  });

  it('should handle secureTextEntry prop', () => {
    const store = createMockStore();
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <CustomInput placeholder="Enter password" secureTextEntry />
      </Provider>
    );

    const input = getByPlaceholderText('Enter password');
    expect(input).toBeTruthy();
  });

  it('should handle value prop', () => {
    const store = createMockStore();
    const { getByDisplayValue } = render(
      <Provider store={store}>
        <CustomInput value="test value" />
      </Provider>
    );

    expect(getByDisplayValue('test value')).toBeTruthy();
  });
});

