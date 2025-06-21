import path from 'path';
import Blog from '../models/blog.js';



export const createBlogPost = async (req, res) => {



  try {
    const { title, body } = req.body;

    console.log('Uploaded file:', req.file);

   

    
    const blog = await Blog.create({
        body,
        title,
        coverImageURL: `/uploads/1234`,
      });

    await blog.save();


    res.status(201).json({
      message: 'Blog post saved!',
      blog,
    });
  } catch (err) {
    console.error('Error creating blog post:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
