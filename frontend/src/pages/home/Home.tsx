import SearchBar from "../../components/vendor/SearchBar";
import Footer from "../../layout/user/Footer";

const HotelBooking = () => {
  return (
    <div className="bg-gray-100 text-gray-800 mt-17">
      <section
        className="relative bg-cover bg-center"
        style={{
          backgroundImage: "url('/public/images/homeImg2.jpg')",
          height: "500px",
        }}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Content Section (Text) */}
        <div className="relative container mx-auto px-6 py-16 text-white">
          <h2 className="text-4xl font-bold mb-4">Your Luxury Stay Awaits</h2>
          <p className="text-lg">
            Discover comfort and elegance with our top-notch facilities and
            services.
          </p>
        </div>
      </section>

      {/* Check-in Form with Partial Overlay */}
      <div className="relative container mx-auto px-1 py-8  -mt-12 z-10 ">
        <SearchBar />
      </div>

      {/* Hotel Description Section */}
      {/* Hotel Description Section */}
      <section className="container mx-auto px-6 py-13">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <img
            src="/dist/imgs/homeImg1.jpg"
            alt="Hotel"
            className="rounded shadow-md"
          />
          <div>
            <h2 className="text-3xl font-bold mb-4">
              DreamNest -  Explore Our Luxury Hotels
            </h2>
            <p className="text-gray-600 mb-6">
              Experience the ultimate in luxury and comfort at our world-class
              hotel. Indulge in our exquisite rooms, gourmet dining, and
              rejuvenating wellness facilities. Experience the ultimate in
              luxury and comfort at our world-class hotel. Indulge in our
              exquisite rooms, gourmet dining, and rejuvenating wellness
              facilities. Experience the ultimate in luxury and comfort at our
              world-class hotel. Indulge in our exquisite rooms, gourmet dining,
              and rejuvenating wellness facilities. Experience the ultimate in
              luxury and comfort at our world-class hotel. Indulge in our
              exquisite rooms, gourmet dining, and rejuvenating wellness
              facilities.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-gray-900 px-4 py-2 text-white rounded hover:bg-gray-800"
              >
                Check out our room types
              </a>
              <a
                href="#"
                className="bg-gray-900 px-4 py-2 text-white rounded hover:bg-gray-800"
              >
                Watch Hotel
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HotelBooking;
