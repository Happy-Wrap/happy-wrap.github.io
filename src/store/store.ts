import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import presentationReducer from './presentationSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['presentation', 'defaultItem'], // Specify which reducer states to persist
};

const persistedReducer = persistReducer(persistConfig, presentationReducer);

export const store = configureStore({
  reducer: {
    presentation: persistedReducer,
  },
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