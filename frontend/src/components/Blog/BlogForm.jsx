import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { CheckCircle2 } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import{backendUrl}from '../../service/url';

export default function BlogForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {

    const formData = new FormData();
    formData.append('coverImage', data.coverImage);
    formData.append('title', data.title);
    formData.append('body', data.body);

   

    try {
      const response = await axios.post(`${backendUrl}/createblogform`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      

      toast.success(
        <>
          <CheckCircle2 size={20} className="me-2" />
          Blog post created successfully!
        </>
      );

      reset();

      setTimeout(() => {
        navigate('/blog'); // Change to your blog list route
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to create blog post');
    }
  };

  return (
    <div className="container mt-3">
      <h2>Create Blog Post</h2>
      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <div className="mb-3">
          <label htmlFor="coverImage" className="form-label">Cover Image: </label>
          <input
            type="file"
            className="form-control"
            id="coverImage"
            {...register('coverImage')}
          />
          {errors.coverImage && (
            <p className="text-danger">{errors.coverImage.message}</p>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            className="form-control w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="title"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && (
            <p className="text-danger">{errors.title.message}</p>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="body" className="form-label">Body</label>
          <textarea
            id="body"
            className="form-control w-full px-4 py-2 border border-red rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="5"
            {...register('body', { required: 'Body content is required' })}
          ></textarea>
          {errors.body && (
            <p className="text-danger">{errors.body.message}</p>
          )}
        </div>

        <div className="mb-3">
          <button type="submit" className="btn btn-primary">Submit</button>
        </div>
      </form>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
