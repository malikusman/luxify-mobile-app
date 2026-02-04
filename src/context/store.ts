import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import profileReducer from './slices/profileSlice';
import closetReducer from './slices/closetSlice';
import orderReducer from './slices/orderSlice';
import authReducer from './slices/authSlice';
import awarenessReducer from './slices/awarenessSlice';
import styleProfileReducer from './slices/styleProfileSlice';
const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['theme', 'closet', 'auth', 'awareness'],
};

const rootReducer = combineReducers({
    theme: themeReducer,
    profile: profileReducer,
    closet: closetReducer,
    order: orderReducer,
    auth: authReducer,
    awareness: awarenessReducer,
    styleProfile: styleProfileReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PURGE'],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
