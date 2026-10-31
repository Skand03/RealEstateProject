import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { propertyService } from '../../services/property.service';

export const fetchProperties = createAsyncThunk(
  'property/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await propertyService.getProperties(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch properties.');
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  'property/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await propertyService.getPropertyById(id);
      return res.data.data.property;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Property not found.');
    }
  }
);

export const fetchMyProperties = createAsyncThunk(
  'property/fetchMine',
  async (params, { rejectWithValue }) => {
    try {
      const res = await propertyService.getMyProperties(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch your properties.');
    }
  }
);

export const createProperty = createAsyncThunk(
  'property/create',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await propertyService.createProperty(formData);
      return res.data.data.property;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Failed to create property.'
      );
    }
  }
);

export const updateProperty = createAsyncThunk(
  'property/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await propertyService.updateProperty(id, formData);
      return res.data.data.property;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update property.');
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'property/delete',
  async (id, { rejectWithValue }) => {
    try {
      await propertyService.deleteProperty(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete property.');
    }
  }
);

const propertySlice = createSlice({
  name: 'property',
  initialState: {
    properties: [],
    currentProperty: null,
    myProperties: [],
    pagination: null,
    filters: {},
    loading: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearCurrentProperty: (state) => {
      state.currentProperty = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.properties;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })

      .addCase(fetchPropertyById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false; state.currentProperty = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })

      .addCase(fetchMyProperties.pending, (state) => { state.loading = true; })
      .addCase(fetchMyProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.myProperties = action.payload.properties;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyProperties.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })

      .addCase(createProperty.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.myProperties.unshift(action.payload);
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })

      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.myProperties.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.myProperties[idx] = action.payload;
        if (state.currentProperty?._id === action.payload._id) {
          state.currentProperty = action.payload;
        }
      })

      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.myProperties = state.myProperties.filter((p) => p._id !== action.payload);
      });
  },
});

export const { setFilters, clearCurrentProperty, clearError } = propertySlice.actions;
export const selectProperties = (state) => state.property.properties;
export const selectCurrentProperty = (state) => state.property.currentProperty;
export const selectMyProperties = (state) => state.property.myProperties;
export const selectPropertyPagination = (state) => state.property.pagination;
export const selectPropertyLoading = (state) => state.property.loading;
export const selectPropertyError = (state) => state.property.error;

export default propertySlice.reducer;
