import { Link, useLocation } from "react-router-dom";
import { USER } from "../../../config/constants/constants";

const MessageSkeleton = () => {
  const path = useLocation();

  return (
    <div
      className={`${
        path.pathname === USER.CHAT
          ? "flex items-center justify-center pt-50 gap-4 md:flex-col flex-row"
          : "flex items-center justify-center -ml-40 pt-20 gap-4 md:flex-col flex-row"
      }`}
    >
      <img src="/dist/imgs/chat-default.svg" alt="Chat Default" className="w-32 h-32 md:w-48 md:h-48" />
      {path.pathname === `${USER.CHAT}` ? (
        <>
          <p className="text-gray-700 text-sm md:text-base">
            Find Vendors to start the chat...
          </p>
          <Link to={USER.SEARCH}>
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm md:text-base">
              Find Vendors
            </button>
          </Link>
        </>
      ) : (
        <p className="text-gray-700 text-sm md:text-base">
          No conversations yet!
        </p>
      )}
    </div>
  );
};

export default MessageSkeleton;
