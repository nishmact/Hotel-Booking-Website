import Footer from "../../layout/user/Footer";
import Layout from "../../layout/user/Layout";

const AboutPage = () => {
  return (
    <div>
      <Layout>
        <div className="container mx-auto px-4 py-16 mt-7">
          <section className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800">
              About DreamNest
            </h1>
            <p className="mt-7 text-lg text-gray-600">
              DreamNest is your gateway to discovering exceptional hotels and
              accommodations around the world. Whether you're planning a quick
              getaway, a luxury retreat, or a business trip, DreamNest is here
              to make your travel experience effortless and enjoyable. We
              connect travelers with a wide variety of stays, from
              budget-friendly hotels to luxury resorts, all in one convenient
              platform.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
              Why Choose DreamNest?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <img
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1080&fit=crop"
                  alt="Variety of Hotels"
                  className="rounded-lg mb-4 object-cover h-48 w-full"
                />
                <h3 className="text-lg font-medium text-gray-800">
                  Wide Variety of Options
                </h3>
                <p className="text-gray-600 text-center">
                  From budget-friendly stays to luxury resorts, DreamNest offers
                  an extensive range of accommodations for every traveler.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src="/dist/imgs/booking.webp"
                  alt="Secure Booking"
                  className="rounded-lg mb-4 object-cover h-48 w-full"
                />
                <h3 className="text-lg font-medium text-gray-800">
                  Safe & Secure Booking
                </h3>
                <p className="text-gray-600 text-center">
                  We prioritize your safety with secure payment options and
                  verified hotels to ensure peace of mind when booking.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src="https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?q=80&w=1080&fit=crop"
                  alt="Special Offers"
                  className="rounded-lg mb-4 object-cover h-48 w-full"
                />
                <h3 className="text-lg font-medium text-gray-800">
                  Exclusive Deals
                </h3>
                <p className="text-gray-600 text-center">
                  Enjoy exclusive discounts and offers, giving you the best
                  value for your travel budget.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src="/dist/imgs/review.jpg"
                  alt="Reviews and Ratings"
                  className="rounded-lg mb-4 object-cover h-48 w-full"
                />
                <h3 className="text-lg font-medium text-gray-800">
                  Trusted Reviews
                </h3>
                <p className="text-gray-600 text-center">
                  Make informed choices with authentic reviews from fellow
                  travelers, helping you find the best stay.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src="/dist/imgs/customer.jpg"
                  alt="Customer Support"
                  className="rounded-lg mb-4 object-cover h-48 w-full"
                />
                <h3 className="text-lg font-medium text-gray-800">
                  24/7 Customer Support
                </h3>
                <p className="text-gray-600 text-center">
                  Our dedicated support team is available around the clock to
                  help you with any booking-related queries.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src="/dist/imgs/userfriendly.jpg"
                  alt="Easy to Use"
                  className="rounded-lg mb-4 object-cover h-48 w-full"
                />
                <h3 className="text-lg font-medium text-gray-800">
                  User-Friendly Platform
                </h3>
                <p className="text-gray-600 text-center">
                  Our platform is designed with ease-of-use in mind, allowing
                  you to find, compare, and book hotels in just a few clicks.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Join the DreamNest Community
            </h2>
            <p className="text-gray-600">
              Become part of a community of travelers who trust DreamNest for
              their travel accommodations. From quick trips to long stays, we’re
              here to provide you with the best booking experience possible.
              Start exploring today!
            </p>
          </section>
        </div>
      </Layout>
      <Footer />
    </div>
  );
};

export default AboutPage;
