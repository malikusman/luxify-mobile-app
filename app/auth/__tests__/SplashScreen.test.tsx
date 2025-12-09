import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import SplashScreen from '../SplashScreen';

describe('SplashScreen', () => {
  const mockRouterReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    require('expo-router').useRouter.mockReturnValue({
      replace: mockRouterReplace,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render splash screen', () => {
    const { UNSAFE_getByType } = render(<SplashScreen />);
    const image = UNSAFE_getByType('Image');
    expect(image).toBeTruthy();
  });

  it('should navigate to login after 2 seconds', async () => {
    render(<SplashScreen />);

    expect(mockRouterReplace).not.toHaveBeenCalled();

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('should not navigate before 2 seconds', () => {
    render(<SplashScreen />);

    jest.advanceTimersByTime(1000);

    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});

