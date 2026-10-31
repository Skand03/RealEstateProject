import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';

const getAuthErrorMessage = (err, fallback) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.request) {
    return 'Unable to reach the server. Start the backend and check its MongoDB connection.';
  }
  return err.message || fallback;
};

// Load persisted auth state from localStorage
const storedUser = localStorage.getItem('hh_user');
const storedToken = localStorage.getItem('hh_token');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  verificationStatus: null,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.register(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getAuthErrorMessage(err, 'Registration failed.'));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.login(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getAuthErrorMessage(err, 'Login failed.'));
    }
  }
);

export const loginWithSupabase = createAsyncThunk(
  'auth/loginWithSupabase',
  async (accessToken, { rejectWithValue }) => {
    try {
      const res = await authService.loginWithSupabase(accessToken);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getAuthErrorMessage(err, 'Google login failed.'));
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.getMe();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile.');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await authService.updateProfile(formData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Profile update failed.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.verificationStatus = null;
      state.error = null;
      localStorage.removeItem('hh_token');
      localStorage.removeItem('hh_user');
    },
    setVerificationStatus: (state, action) => {
      state.verificationStatus = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('hh_token', action.payload.token);
        localStorage.setItem('hh_user', JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.verificationStatus = action.payload.verificationStatus;
        localStorage.setItem('hh_token', action.payload.token);
        localStorage.setItem('hh_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Me
    builder
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.verificationStatus = action.payload.verificationStatus;
        localStorage.setItem('hh_user', JSON.stringify(action.payload.user));
      });

    // Google login
    builder
      .addCase(loginWithSupabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithSupabase.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.verificationStatus = action.payload.verificationStatus;
        localStorage.setItem('hh_token', action.payload.token);
        localStorage.setItem('hh_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginWithSupabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Profile
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem('hh_user', JSON.stringify(action.payload.user));
      });
  },
});

export const { logout, setVerificationStatus, clearError } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => !!state.auth.token && !!state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectVerificationStatus = (state) => state.auth.verificationStatus;
export const selectUserRole = (state) => state.auth.user?.role;

export default authSlice.reducer;
