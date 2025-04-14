import express from 'express';
import { Material } from '../models/Material.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload material (Teacher only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.userRole !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Only teachers can upload materials' });
    }

    const { title, description, branch } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
      folder: `study_materials/${branch}`
    });

    const material = new Material({
      title,
      description,
      fileUrl: result.secure_url,
      fileType: file.mimetype.includes('pdf') ? 'pdf' : 'image',
      branch,
      uploadedBy: req.user._id
    });

    await material.save();
    res.status(201).json({ success: true, material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get materials by branch
router.get('/:branch', authMiddleware, async (req, res) => {
  try {
    const materials = await Material.find({ branch: req.params.branch })
      .populate('uploadedBy', 'name profilePic')
      .sort({ createdAt: -1 });

    res.json({ success: true, materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;