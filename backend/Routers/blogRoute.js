import express from 'express';
import multer from 'multer';
import path from 'path';
import { createBlogPost } from '../controller/blogController.js';
import cors from "cors";



const router = express.Router();

router.use(cors());

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

// POST /blog
router.post('/createblogform', upload.single('coverImage'), createBlogPost);

export default router;
