import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { uploadMaterial } from '../../redux/slices/materialSlice';
import { Button, TextField, Box, Paper, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const UploadMaterial = ({ branch }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setUploading(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('branch', branch);
    formData.append('file', file);

    dispatch(uploadMaterial(formData))
      .unwrap()
      .then(() => {
        setTitle('');
        setDescription('');
        setFile(null);
      })
      .finally(() => setUploading(false));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>Upload New Material</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{ mt: 2, mr: 2 }}
        >
          Select File
          <input
            type="file"
            hidden
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </Button>
        {file && <Typography sx={{ mt: 1 }}>{file.name}</Typography>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={uploading}
          sx={{ mt: 2 }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </Box>
    </Paper>
  );
};

export default UploadMaterial;