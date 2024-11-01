import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Footer Section 1 */}
          <div>
            <h4 className="font-semibold text-lg mb-2">About Us</h4>
            <p className="text-sm">Learn more about our mission and values.</p>
          </div>

          {/* Footer Section 2 */}
          <div>
            <h4 className="font-semibold text-lg mb-2">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>Leaderboard</li>
              <li>Your Growth</li>
              <li>Insights</li>
            </ul>
          </div>

          {/* Footer Section 3 */}
          <div>
            <h4 className="font-semibold text-lg mb-2">Contact Us</h4>
            <p className="text-sm">Get in touch through our social media channels or email.</p>
          </div>
        </div>
        <div className="text-center mt-8 text-sm">&copy; 2024 BrandName. All rights reserved.</div>
      </div>
    </footer>
  );
}

export default Footer;