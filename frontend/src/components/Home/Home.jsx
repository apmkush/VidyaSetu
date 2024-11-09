import React from 'react';
import img from '../../assets/imagelogo.jpg'

function Hero() {
  return (
    <div className='min-h-screen flex flex-col justify-center lg:flex-row lg:justify-between items-center lg:px-32 px-5 gap-10 bg-gradient-to-r from-[#FFDCAB] to-[#AB6B2E]' >
      <div className='w-full lg:w-full space-y-4 mt-14 lg:mt-0'>
        <h1 className='font-semibold text-5xl text-center lg:text-start leading-tight' >
        "Stay on Track, Stress Less"
          </h1>
        <h1 className='font-semibold text-1xl text-center lg:text-start leading-tight'>
          Your ultimate solution for managing college assignments, deadlines, and staying organized.
          </h1>


        <div className='relative'>
          <img className='w-2/5 h-50 '  src={img} alt="logo" />
          <div className='w-2/5  absolute bg-white px-8 py-2 top-28 right-10 rounded-full shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]'>
<p>"With this app, I’ve been able to handle my college workload so much better. My grades are up, and I feel way less stressed!"
— Ayush M., College Sophomore

</p>

           
            </div>
            <div className='w-2/5  absolute bg-white px-8 py-2 bottom-28 right-10 rounded-full shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]'>
<p>"Simple, effective, and really easy to use. It’s become an essential part of my study routine."
— Priya K., Graduate Student

</p>

           
            </div>

            <div className='absolute bg-white px-8 py-2 bottom-0 -left-10 rounded-full'>Welcome</div>
        </div>
      </div>
    </div>
  );
}

export default Hero;