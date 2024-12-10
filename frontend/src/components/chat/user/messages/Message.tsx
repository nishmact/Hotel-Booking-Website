/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { format } from "timeago.js";
import React, { useState } from "react";

import {
  axiosInstance,
  axiosInstanceMsg,
} from "../../../../config/api/axiosinstance";
import { toast } from "react-toastify";
import UserRootState from "../../../../redux/rootstate/UserState";
import { useSelector } from "react-redux";
import { Messages } from "../../../../types/commonTypes";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface MessageProps {
  own: boolean;
  message: Partial<Messages>
  setIsUpdated:React.Dispatch<React.SetStateAction<boolean>>;
}

const Message:React.FC<MessageProps>=({ message, own, setIsUpdated }) => {
  const user = useSelector((state: UserRootState) => state.user.userdata);
  const [openRight, setOpenRight] = React.useState(false);
  const [messageIdToDelete, setMessageIdToDelete] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const emojis = ["😀", "😂", "❤️", "👍", "👎"];
  const handleOpenRight = (msgId: string) => {
    setOpenRight(!openRight);
    setMessageIdToDelete(msgId);
  };

  const [openLeft, setOpenLeft] = React.useState(false);

  const handleOpenLeft = (msgId: string) => {
    setOpenLeft(!openLeft);
    setMessageIdToDelete(msgId);
  };

  const handleDeleteEveryone = async () => {
    axiosInstance
      .patch(
        `${BASE_URL}/api/user/delete-for-everyone`,
        { msgId: messageIdToDelete },
        { withCredentials: true }
      )
      .then((response) => {
        console.log(response);
        setIsUpdated(true);
        handleOpenRight("");
      })
      .catch((error) => {
        handleOpenRight("");
        toast.error(error.response);
        console.log("here", error);
      });
  };

  const handleDeleteForMe = async (side: string) => {
    axiosInstance
      .patch(
        `${BASE_URL}/api/user/delete-for-me`,
        { msgId: messageIdToDelete, id: user?._id },
        { withCredentials: true }
      )
      .then((response) => {
        console.log(response);
        setIsUpdated(true);
        if (side == "right") {
          handleOpenRight("");
        } else {
          handleOpenLeft("");
        }
      })
      .catch((error) => {
        if (side == "right") {
          handleOpenRight("");
        } else {
          handleOpenLeft("");
        }
        toast.error(error.response);
        console.log("here", error);
      });
  };

  const handleEmoji = async (msgId: string, emoji: string) => {
    axiosInstanceMsg
      .patch(`${BASE_URL}/api/messages/add-emoji`, { msgId, emoji }, { withCredentials: true })
      .then((response) => {
        console.log(response);
        setIsUpdated(true);
        setShowEmojis(false);
      })
      .catch((error) => {
        setShowEmojis(false);
        toast.error(error.response);
        console.log("here", error);
      });
  };

  return (
    <>
      {own ? (
        <div>
          <div className="flex items-end justify-end">
            <div className="relative flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-end">
              <div>
                {message?.isDeleted ? (
                  <span
                    style={{ fontStyle: "italic" }}
                    className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-pink-200 text-gray-800"
                  >
                    You deleted this message
                  </span>
                ) : message?.deletedIds?.includes(user?._id!) ? (
                  ""
                ) : message?.imageUrl ? (
                  <img
                    className="w-40 h-30 rounded-lg"
                    src={message?.imageUrl}
                    alt="Bonnie Green image"
                  ></img>
                ) : (
                  <>
                    <span
                      className="inline-block bg-gray-200 rounded-full px-1 m-1 cursor-pointer"
                      onClick={() => setShowEmojis(!showEmojis)}
                    >
                      <i className="fa-regular fa-face-smile text-gray-500 text-sm"></i>
                    </span>
  
                    <span
                      style={{ fontSize: "14px" }}
                      className="relative px-5 py-2 rounded-lg inline-block rounded-bl-none bg-pink-500 text-white"
                      onClick={() => handleOpenRight(message?._id!)}
                    >
                      {message?.text}
  
                      {message?.isRead ? (
                        <i
                          className="fa-solid fa-check-double absolute bottom-0 right-0"
                          style={{ padding: "4px", fontSize: "10px" }}
                        ></i>
                      ) : (
                        <i
                          className="fa-solid fa-check absolute bottom-0 right-0"
                          style={{ padding: "2px", fontSize: "10px" }}
                        ></i>
                      )}
                    </span>
                  </>
                )}
              </div>
              {message?.deletedIds?.includes(user?._id!) ? (
                ""
              ) : (
                <div style={{ fontSize: "16px" }}>{message?.emoji}</div>
              )}
              {showEmojis && (
                <div className="flex absolute bottom-10 right-0 w-40 justify-between bg-white border border-gray-200 p-2 rounded-lg">
                  {emojis.map((emoji, index) => (
                    <span
                      key={index}
                      onClick={() => handleEmoji(message?._id!, emoji)}
                      style={{ fontSize: "16px", cursor: "pointer" }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {message?.deletedIds?.includes(user?._id!) ? (
            ""
          ) : (
            <p className="flex items-end justify-end text-xs text-gray-500 mr-2">
              {format(message.createdAt!)}
            </p>
          )}
        </div>
      ) : (
        <div className="chat-message flex flex-col">
          <div className="flex items-end">
            <div className="relative flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
              <div>
                {message?.isDeleted ? (
                  <span
                    style={{ fontStyle: "italic" }}
                    className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-100 text-gray-600"
                  >
                    This message was deleted
                  </span>
                ) : message?.deletedIds?.includes(user?._id!) ? (
                  ""
                ) : message?.imageUrl ? (
                  <img
                    className="w-40 h-30 rounded-lg"
                    src={message?.imageUrl}
                    alt="Bonnie Green image"
                  ></img>
                ) : (
                  <>
                    <span
                      className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-200 text-gray-600"
                      onClick={() => handleOpenLeft(message?._id!)}
                      style={{ fontSize: "14px" }}
                    >
                      {message.text}
                    </span>
                    <span
                      className="inline-block bg-gray-200 rounded-full px-1 m-1 cursor-pointer"
                      onClick={() => setShowEmojis(!showEmojis)}
                    >
                      <i className="fa-regular fa-face-smile text-gray-500 text-sm"></i>
                    </span>
                  </>
                )}
              </div>
              {message?.deletedIds?.includes(user?._id!) ? (
                ""
              ) : (
                <div style={{ fontSize: "16px" }}>{message?.emoji}</div>
              )}
              {showEmojis && (
                <div className="flex justify-between absolute bottom-10  w-40 bg-white border border-gray-200 p-2 rounded-lg">
                  {emojis.map((emoji, index) => (
                    <span
                      key={index}
                      onClick={() => handleEmoji(message?._id!, emoji)}
                      style={{ fontSize: "16px", cursor: "pointer" }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {message?.deletedIds?.includes(user?._id!) ? (
            ""
          ) : (
            <p className="text-xs text-gray-500 ml-2">
              {format(message?.createdAt!)}
            </p>
          )}
        </div>
      )}
  
      {/* Right Side Modal */}
      {openRight && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-96">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete message?</h3>
          <p className="text-gray-600 text-sm mb-6">
            Are you sure you want to delete this message? This action cannot be undone.
          </p>
          <div className="flex flex-col space-y-4">
            <button
              className="bg-gray-500 text-white rounded-lg py-2 hover:bg-red-600 transition duration-300"
              onClick={handleDeleteEveryone}
            >
              Delete for everyone
            </button>
            <button
              className="bg-gray-500 text-white rounded-lg py-2 hover:bg-red-600 transition duration-300"
              onClick={() => handleDeleteForMe("right")}
            >
              Delete for me
            </button>
          </div>
          <button
            className="mt-6 w-full bg-green-500 text-white rounded-lg py-2 hover:bg-green-600 transition duration-300"
            onClick={() => handleOpenRight("")}
          >
            Cancel
          </button>
        </div>
      </div>
      
      )}
  
      {/* Left Side Modal */}
      {openLeft && (
       <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
       <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-96">
         <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete message?</h3>
         <p className="text-gray-600 text-sm mb-4">
           Are you sure you want to delete this message? This action cannot be undone.
         </p>
         <div className="flex justify-between space-x-4 mt-4">
           <button
             className="w-full bg-red-500 text-white rounded-lg py-2 hover:bg-red-600 transition-all duration-300"
             onClick={() => handleDeleteForMe("left")}
           >
             Delete for me
           </button>
           <button
             className="w-full bg-green-500 text-white rounded-lg py-2 hover:bg-green-600 transition-all duration-300"
             onClick={() => handleOpenLeft("")}
           >
             Cancel
           </button>
         </div>
       </div>
     </div>
      )}
    </>
  );
  
};

export default Message;
