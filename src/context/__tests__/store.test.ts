import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../slices/themeSlice';
import onboardingReducer from '../slices/onboardingSlice';
import closetReducer from '../slices/closetSlice';
import orderReducer from '../slices/orderSlice';
import { toggleTheme } from '../slices/themeSlice';
import { addImage } from '../slices/closetSlice';

describe('Store Configuration', () => {
  it('should create store with all reducers', () => {
    const store = configureStore({
      reducer: {
        theme: themeReducer,
        onboarding: onboardingReducer,
        closet: closetReducer,
        order: orderReducer,
      },
    });

    expect(store.getState()).toHaveProperty('theme');
    expect(store.getState()).toHaveProperty('onboarding');
    expect(store.getState()).toHaveProperty('closet');
    expect(store.getState()).toHaveProperty('order');
  });

  it('should dispatch actions correctly', () => {
    const store = configureStore({
      reducer: {
        theme: themeReducer,
        onboarding: onboardingReducer,
        closet: closetReducer,
        order: orderReducer,
      },
    });

    store.dispatch(toggleTheme());
    expect(store.getState().theme.isDarkMode).toBe(true);

    store.dispatch(addImage('file://test.jpg'));
    expect(store.getState().closet.images).toHaveLength(1);
  });

  it('should have correct initial state', () => {
    const store = configureStore({
      reducer: {
        theme: themeReducer,
        onboarding: onboardingReducer,
        closet: closetReducer,
        order: orderReducer,
      },
    });

    const state = store.getState();
    expect(state.theme.isDarkMode).toBe(false);
    expect(state.onboarding.currentStep).toBe(1);
    expect(state.closet.images).toEqual([]);
    expect(state.order.selectedProduct).toBeNull();
  });
});

