import React from 'react';
import { Card, CardContent, Typography, Button, CardActions, Avatar } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import GetAppIcon from '@mui/icons-material/GetApp';

const MaterialCard = ({ material }) => {
  const getFileIcon = () => {
    return material.fileType === 'pdf' ? (
      <PictureAsPdfIcon color="error" fontSize="large" />
    ) : (
      <ImageIcon color="primary" fontSize="large" />
    );
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" alignItems="center" mb={2}>
          {getFileIcon()}
          <Typography variant="h6" component="div" sx={{ ml: 2 }}>
            {material.title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          {material.description}
        </Typography>
        <Box display="flex" alignItems="center" mt={2}>
          <Avatar 
            src={material.uploadedBy.profilePic} 
            alt={material.uploadedBy.name}
            sx={{ width: 32, height: 32, mr: 1 }}
          />
          <Typography variant="caption">
            Uploaded by {material.uploadedBy.name}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          startIcon={<GetAppIcon />}
          href={material.fileUrl}
          download
          target="_blank"
        >
          Download
        </Button>
      </CardActions>
    </Card>
  );
};

export default MaterialCard;