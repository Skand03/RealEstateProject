import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingService } from '../../services/booking.service';

export const createBooking = createAsyncThunk(
  'booking/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await bookingService.createBooking(data);
      return res.data.data.booking;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Failed to create booking.'
      );
    }
  }
);

export const fetchBuyerBookings = createAsyncThunk(
  'booking/fetchBuyer',
  async (params, { rejectWithValue }) => {
    try {
      const res = await bookingService.getBuyerBookings(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch bookings.');
    }
  }
);

export const fetchSellerBookings = createAsyncThunk(
  'booking/fetchSeller',
  async (params, { rejectWithValue }) => {
    try {
      const res = await bookingService.getSellerBookings(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch booking requests.');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const res = await bookingService.cancelBooking(id);
      return res.data.data.booking;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to cancel booking.');
    }
  }
);

export const acceptBooking = createAsyncThunk(
  'booking/accept',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await bookingService.acceptBooking(id, data);
      return res.data.data.booking;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to accept booking.');
    }
  }
);

export const rejectBooking = createAsyncThunk(
  'booking/reject',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await bookingService.rejectBooking(id, data);
      return res.data.data.booking;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reject booking.');
    }
  }
);

export const completeBooking = createAsyncThunk(
  'booking/complete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await bookingService.completeBooking(id);
      return res.data.data.booking;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to complete booking.');
    }
  }
);

const updateBookingInList = (list, updatedBooking) =>
  list.map((b) => (b._id === updatedBooking._id ? updatedBooking : b));

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    buyerBookings: [],
    sellerBookings: [],
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuyerBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchBuyerBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.buyerBookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBuyerBookings.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })

      .addCase(fetchSellerBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchSellerBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerBookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSellerBookings.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })

      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.buyerBookings = updateBookingInList(state.buyerBookings, action.payload);
      })
      .addCase(acceptBooking.fulfilled, (state, action) => {
        state.sellerBookings = updateBookingInList(state.sellerBookings, action.payload);
      })
      .addCase(rejectBooking.fulfilled, (state, action) => {
        state.sellerBookings = updateBookingInList(state.sellerBookings, action.payload);
      })
      .addCase(completeBooking.fulfilled, (state, action) => {
        state.sellerBookings = updateBookingInList(state.sellerBookings, action.payload);
      });
  },
});

export const { clearError } = bookingSlice.actions;
export const selectBuyerBookings = (state) => state.booking.buyerBookings;
export const selectSellerBookings = (state) => state.booking.sellerBookings;
export const selectBookingLoading = (state) => state.booking.loading;
export const selectBookingError = (state) => state.booking.error;

export default bookingSlice.reducer;
