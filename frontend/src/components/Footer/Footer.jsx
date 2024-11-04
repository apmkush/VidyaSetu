import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Footer Section 1 */}
          <div className="flex flex-col items-center">
              <h1 className="text-3xl font-bold text-white">VidyaSetu</h1>
              <p className="text-sm text-gray-300 mt-1">Guiding Every Step to Success</p>

              <div className="mt-4">
                <h4 className="text-white font-semibold text-lg mb-2">Social Media</h4>
                <div className="flex space-x-2">
                  <a href="/" className="text-white text-2xl"><i className="fab fa-facebook"></i></a>
                  <a href="/" className="text-white text-2xl"><i className="fab fa-twitter"></i></a>
                  <a href="/" className="text-white text-2xl"><i className="fab fa-pinterest"></i></a>
                  <a href="/" className="text-white text-2xl"><i className="fab fa-instagram"></i></a>
                  <a href="/" className="text-white text-2xl"><i className="fab fa-linkedin"></i></a>
                </div>
              </div>
            </div>

          {/* Footer Section 2 */}
          <div>
            <h4 className="font-semibold text-2xl mb-2 text-white">Company</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline hover:text-maroon">Home</a></li>
                <li><a href="#" className="hover:underline hover:text-maroon">About Us</a></li>
                <li><a href="#" className="hover:underline hover:text-maroon">FAQ</a></li>
                <li><a href="#" className="hover:underline hover:text-maroon">Privacy Policy</a></li>
                <li><a href="#" className="hover:underline hover:text-maroon">Resources</a></li>
              </ul>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline hover:text-maroon">Your Timetable</a></li>
                <li><a href="#" className="hover:underline hover:text-maroon">Account Deletion</a></li>
                <li><a href="#" className="hover:underline hover:text-maroon">PYQ for 1st Year</a></li>
                <li><a href="#" className="hover:underline hover:text-maroon">PYQ for >= 2nd Year</a></li>
              </ul>
            </div>
          </div>


          {/* Footer Section 3 */}
          <div className="flex flex-col items-start">
            <h4 className="font-semibold text-2xl  text-white mb-4">Contact Us</h4>
            <p className="text-sm text-gray-300">
              <strong>E-Mail:</strong> 
              <a href="mailto:birjesh.20225024@mnnit.ac.in" className="hover:underline ml-1 text-gray-300">
                birjesh.20225024@mnnit.ac.in
              </a>
            </p>
            <p className="text-sm text-gray-300">
              <strong>Phone:</strong> 
              <a href="tel:+918081955858" className="hover:underline ml-1 text-gray-300">
                +91 8081955858
              </a>
            </p>
           {/*<br></br>*/}
            <p className="text-2sm text-white-400 mt-4">Get in touch through our social media channels or email.</p>
          </div>
        </div>
        <div className="text-center mt-8 text-sm">&copy; 2024 VidyaSetu. All rights reserved.</div>
      </div>
    </footer>
  );
}

export default Footer;