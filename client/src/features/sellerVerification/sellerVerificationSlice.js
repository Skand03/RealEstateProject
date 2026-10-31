import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sellerVerificationService } from '../../services/sellerVerification.service';

export const submitVerification = createAsyncThunk(
  'verification/submit',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await sellerVerificationService.submitVerification(formData);
      return res.data.data.verification;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Submission failed.');
    }
  }
);

export const fetchMyVerificationStatus = createAsyncThunk(
  'verification/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await sellerVerificationService.getMyStatus();
      return res.data.data.verification;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch status.');
    }
  }
);

export const fetchAllVerifications = createAsyncThunk(
  'verification/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await sellerVerificationService.getAllVerifications(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch verifications.');
    }
  }
);

export const approveVerification = createAsyncThunk(
  'verification/approve',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await sellerVerificationService.approveVerification(id, data);
      return res.data.data.verification;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Approval failed.');
    }
  }
);

export const rejectVerification = createAsyncThunk(
  'verification/reject',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await sellerVerificationService.rejectVerification(id, data);
      return res.data.data.verification;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Rejection failed.');
    }
  }
);

const sellerVerificationSlice = createSlice({
  name: 'verification',
  initialState: {
    myVerification: null,
    allVerifications: [],
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitVerification.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(submitVerification.fulfilled, (state, action) => {
        state.loading = false; state.myVerification = action.payload;
      })
      .addCase(submitVerification.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })

      .addCase(fetchMyVerificationStatus.fulfilled, (state, action) => {
        state.myVerification = action.payload;
      })

      .addCase(fetchAllVerifications.fulfilled, (state, action) => {
        state.allVerifications = action.payload.verifications;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })

      .addCase(approveVerification.fulfilled, (state, action) => {
        state.allVerifications = state.allVerifications.map((v) =>
          v._id === action.payload._id ? action.payload : v
        );
      })

      .addCase(rejectVerification.fulfilled, (state, action) => {
        state.allVerifications = state.allVerifications.map((v) =>
          v._id === action.payload._id ? action.payload : v
        );
      });
  },
});

export const { clearError } = sellerVerificationSlice.actions;
export const selectMyVerification = (state) => state.verification.myVerification;
export const selectAllVerifications = (state) => state.verification.allVerifications;
export const selectVerificationLoading = (state) => state.verification.loading;
export const selectVerificationError = (state) => state.verification.error;

export default sellerVerificationSlice.reducer;
