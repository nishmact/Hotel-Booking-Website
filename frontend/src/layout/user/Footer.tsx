const Footer = () => {
    return (
      <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Links */}
        <div>
          <h3 className="text-lg font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-gray-300">
                Rooms
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-300">
                Restaurant
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-300">
                Special Offers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-300">
                Gallery
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-bold mb-4">Contact Us</h3>
          <p>DreamNest Luxury Hotel</p>
          <p>Email: info@dreamNesthotel.com</p>
          <p>Phone: +123 456 789</p>
        </div>

        {/* Social Media Links */}
        <div>
          <h3 className="text-lg font-bold mb-4">Follow Us</h3>
          <div className="space-x-4">
            <a href="#" className="hover:text-gray-300">
              Facebook
            </a>
            <a href="#" className="hover:text-gray-300">
              Twitter
            </a>
            <a href="#" className="hover:text-gray-300">
              Instagram
            </a>
          </div>
        </div>
      </div>
      <div className="text-center mt-8">
        <p className="text-sm text-gray-400">
          &copy; 2024 DreamNest Luxury Hotel. All Rights Reserved.
        </p>
      </div>
    </footer>
    )
}

export default Footer