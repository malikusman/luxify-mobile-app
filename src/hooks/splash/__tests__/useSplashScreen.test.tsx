import { renderHook } from '@testing-library/react-hooks';
import { useSplashScreen } from '../useSplashScreen';
import * as SplashScreen from 'expo-splash-screen';

jest.mock('expo-splash-screen');

describe('useSplashScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (SplashScreen.hideAsync as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should hide splash screen after delay', async () => {
    renderHook(() => useSplashScreen());

    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1500);

    await Promise.resolve();

    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
  });

  it('should wait 1500ms before hiding splash screen', async () => {
    renderHook(() => useSplashScreen());

    jest.advanceTimersByTime(1000);
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    
    await Promise.resolve();

    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
  });
});

