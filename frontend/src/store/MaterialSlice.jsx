import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import{backendUrl}from '../../service/url';

export const fetchMaterialsByBranch = createAsyncThunk(
  'materials/fetchByBranch',
  async (branch, { getState }) => {
    const { token } = getState().auth;
    const response = await axios.get(`${backendUrl}/materials/${branch}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.materials;
  }
);

export const uploadMaterial = createAsyncThunk(
  'materials/upload',
  async (formData, { getState }) => {
    const { token } = getState().auth;
    const response = await axios.post('/api/materials', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.material;
  }
);

const materialSlice = createSlice({
  name: 'materials',
  initialState: {
    materials: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterialsByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterialsByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = action.payload;
      })
      .addCase(fetchMaterialsByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(uploadMaterial.fulfilled, (state, action) => {
        state.materials.unshift(action.payload);
      });
  }
});

export default materialSlice.reducer;