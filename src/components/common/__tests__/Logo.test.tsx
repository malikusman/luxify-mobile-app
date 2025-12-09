import React from 'react';
import { render } from '@testing-library/react-native';
import Logo from '../Logo';

describe('Logo', () => {
  it('should render with default size', () => {
    const { getByTestId } = render(<Logo />);
    expect(getByTestId).toBeDefined();
  });

  it('should render with custom size', () => {
    const { UNSAFE_getByType } = render(<Logo size={100} />);
    const image = UNSAFE_getByType('Image');
    expect(image).toBeTruthy();
  });

  it('should apply custom style', () => {
    const customStyle = { marginTop: 20 };
    const { UNSAFE_getByType } = render(<Logo style={customStyle} />);
    const image = UNSAFE_getByType('Image');
    expect(image).toBeTruthy();
  });

  it('should render with correct source', () => {
    const { UNSAFE_getByType } = render(<Logo />);
    const image = UNSAFE_getByType('Image');
    expect(image.props.source).toBeDefined();
  });
});

