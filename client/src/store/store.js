import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import propertyReducer from '../features/property/propertySlice';
import favoriteReducer from '../features/favorite/favoriteSlice';
import bookingReducer from '../features/booking/bookingSlice';
import messageReducer from '../features/message/messageSlice';
import sellerVerificationReducer from '../features/sellerVerification/sellerVerificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    favorite: favoriteReducer,
    booking: bookingReducer,
    message: messageReducer,
    verification: sellerVerificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
