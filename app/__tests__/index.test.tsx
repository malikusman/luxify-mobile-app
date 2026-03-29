import React from 'react';
import { render } from '@testing-library/react-native';
import Index from '../index';

jest.mock('expo-router', () => ({
  Redirect: ({ href }: any) => {
    const React = require('react');
    return React.createElement('View', { testID: 'redirect', href });
  },
}));

describe('Index', () => {
  it('should redirect to SplashScreen', () => {
    const { getByTestId } = render(<Index />);

    const redirect = getByTestId('redirect');
    expect(redirect).toBeTruthy();
    expect(redirect.props.href).toBe('/auth/SplashScreen');
  });
});

