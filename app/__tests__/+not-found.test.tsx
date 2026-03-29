import React from 'react';
import { render } from '@testing-library/react-native';
import NotFoundScreen from '../+not-found';

jest.mock('expo-router', () => ({
  Link: ({ children, href, style }: any) => {
    const React = require('react');
    return React.createElement('View', { testID: 'link', href, style }, children);
  },
  Stack: {
    Screen: ({ options }: any) => null,
  },
}));

describe('NotFoundScreen', () => {
  it('should render not found screen', () => {
    const { getByText } = render(<NotFoundScreen />);

    expect(getByText("This screen doesn't exist.")).toBeTruthy();
  });

  it('should render link to home screen', () => {
    const { getByText } = render(<NotFoundScreen />);

    expect(getByText('Go to home screen!')).toBeTruthy();
  });
});

