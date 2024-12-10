const Loader = ({ message = "Booking your stay..." }) => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="relative">
        {/* Simple Spinner */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-4 border-t-blue-500 bg-transparent">
          {/* Spinner centered inside with icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M5 9l7 7 7-7"></path>
            </svg>
          </div>
        </div>
        <p className="text-center text-lg font-medium text-gray-700 mt-4">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
