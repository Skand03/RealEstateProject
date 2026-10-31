import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { favoriteService } from '../../services/favorite.service';

export const fetchFavorites = createAsyncThunk(
  'favorite/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await favoriteService.getFavorites(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch favorites.');
    }
  }
);

export const addFavorite = createAsyncThunk(
  'favorite/add',
  async (propertyId, { rejectWithValue }) => {
    try {
      const res = await favoriteService.addFavorite(propertyId);
      return res.data.data.favorite;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add favorite.');
    }
  }
);

export const removeFavorite = createAsyncThunk(
  'favorite/remove',
  async (propertyId, { rejectWithValue }) => {
    try {
      await favoriteService.removeFavorite(propertyId);
      return propertyId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove favorite.');
    }
  }
);

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState: {
    favorites: [],
    favoriteIds: [],
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload.favorites;
        state.favoriteIds = action.payload.favorites.map((f) => f.property?._id);
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.favorites.unshift(action.payload);
        if (action.payload.property?._id) {
          state.favoriteIds.push(action.payload.property._id);
        }
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(
          (f) => f.property?._id !== action.payload
        );
        state.favoriteIds = state.favoriteIds.filter((id) => id !== action.payload);
      });
  },
});

export const { clearError } = favoriteSlice.actions;
export const selectFavorites = (state) => state.favorite.favorites;
export const selectFavoriteIds = (state) => state.favorite.favoriteIds;
export const selectFavoriteLoading = (state) => state.favorite.loading;

export default favoriteSlice.reducer;
