import React from 'react';

function Hero() {
  return (
    <section className="bg-blue-100 py-20 min-h-screen"> // Add min-h-screen class
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Our Platform</h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover our amazing features and track your growth with our leaderboard and insights.
        </p>
        <img src="/path/to/hero-image.jpg" alt="Hero Image" className="mx-auto w-full max-w-lg rounded-lg shadow-lg" />
      </div>
    </section>
  );
}

export default Hero;