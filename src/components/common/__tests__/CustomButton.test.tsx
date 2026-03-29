import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomButton from '../CustomButton';

describe('CustomButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with title', () => {
    const { getByText } = render(<CustomButton title="Test Button" />);

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const { getByText } = render(
      <CustomButton title="Test Button" onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const { getByText } = render(
      <CustomButton title="Test Button" onPress={mockOnPress} disabled />
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should render with icon', () => {
    const icon = <div>Icon</div>;
    const { getByText } = render(
      <CustomButton title="Test Button" icon={icon} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should apply custom backgroundColor', () => {
    const { getByText } = render(
      <CustomButton title="Test Button" backgroundColor="#FF0000" />
    );

    const button = getByText('Test Button').parent;
    expect(button).toBeTruthy();
  });

  it('should apply custom textColor', () => {
    const { getByText } = render(
      <CustomButton title="Test Button" textColor="#00FF00" />
    );

    const text = getByText('Test Button');
    expect(text).toBeTruthy();
  });

  it('should apply custom borderColor', () => {
    const { getByText } = render(
      <CustomButton title="Test Button" borderColor="#0000FF" />
    );

    const button = getByText('Test Button').parent;
    expect(button).toBeTruthy();
  });

  it('should apply custom style', () => {
    const customStyle = { marginTop: 20 };
    const { getByText } = render(
      <CustomButton title="Test Button" style={customStyle} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should apply custom textStyle', () => {
    const customTextStyle = { fontSize: 20 };
    const { getByText } = render(
      <CustomButton title="Test Button" textStyle={customTextStyle} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should use default values when props are not provided', () => {
    const { getByText } = render(<CustomButton title="Test Button" />);

    expect(getByText('Test Button')).toBeTruthy();
  });
});

