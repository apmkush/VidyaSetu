import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Button } from '@mui/material';
import{backendUrl}from '../../service/url';

const branches = [
  { id: 'ece', name: 'Electronics & Communication' },
  { id: 'civil', name: 'Civil Engineering' },
  { id: 'electrical', name: 'Electrical Engineering' },
  { id: 'csit', name: 'Computer Science & IT' }
];

const BranchSelection = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Typography variant="h4" gutterBottom>Select Branch</Typography>
      <Grid container spacing={3}>
        {branches.map((branch) => (
          <Grid item xs={12} sm={6} md={3} key={branch.id}>
            <Card 
              sx={{ cursor: 'pointer', height: '100%' }}
              onClick={() => navigate(`/materials/${branch.id}`)}
            >
              <CardContent>
                <Typography variant="h5" component="div">
                  {branch.name}
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/materials/${branch.id}`);
                  }}
                >
                  View Materials
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default BranchSelection;