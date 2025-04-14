import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMaterialsByBranch } from '../../redux/slices/materialSlice';
import { Grid, Card, CardContent, Typography, Button, CircularProgress } from '@mui/material';
import MaterialCard from './MaterialCard';
import UploadMaterial from './UploadMaterial';

const MaterialList = () => {
  const { branch } = useParams();
  const dispatch = useDispatch();
  const { materials, loading } = useSelector((state) => state.materials);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMaterialsByBranch(branch));
  }, [branch, dispatch]);

  if (loading) return <CircularProgress />;

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {branch.toUpperCase()} Study Materials
      </Typography>

      {user?.userRole === 'teacher' && <UploadMaterial branch={branch} />}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {materials.map((material) => (
          <Grid item xs={12} sm={6} md={4} key={material._id}>
            <MaterialCard material={material} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default MaterialList;