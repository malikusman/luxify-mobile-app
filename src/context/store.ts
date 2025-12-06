import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import onboardingReducer from './slices/onboardingSlice';
import closetReducer from './slices/closetSlice';
import orderReducer from './slices/orderSlice';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['theme', 'closet'],
};

const rootReducer = combineReducers({
    theme: themeReducer,
    onboarding: onboardingReducer,
    closet: closetReducer,
    order: orderReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
