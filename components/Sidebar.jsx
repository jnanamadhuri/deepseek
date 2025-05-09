import { useAppContext } from "@/context/AppContext";
import ChatLabel from "./ChatLabel";
import { useState } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { useClerk, UserButton } from "@clerk/nextjs";

const Sidebar = ({ expand, setExpand }) => {
  const { openSignIn } = useClerk();
  const { user, chats, createNewChat, setSelectedChat } = useAppContext(); // Accessing setSelectedChat
  const [openMenu, setOpenMenu] = useState({ id: 0, open: false });

  const handleChatClick = (chat) => {
    setSelectedChat(chat); // Set selected chat when clicked
  };

  return (
    <div
      className={`flex flex-col justify-between bg-[#212327] pt-7
        transition-all z-50 max-md:absolute max-md:h-screen ${
          expand ? "p-4 w-64" : "md:w-20 w-0 max-md:overflow-hidden"
        }`}
    >
      <div className="">
        <div
          className={`flex ${
            expand ? "flex-row gap-10" : "flex-col items-center gap-8"
          }`}
        >
          <Image
            src={expand ? assets.logo_text : assets.logo_icon}
            alt=""
            className={expand ? "w-36" : "w-10"}
          />
          <div
            onClick={() => (expand ? setExpand(false) : setExpand(true))}
            className="group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 aspect-square rounded-lg cursor-pointer"
          >
            <Image src={assets.menu_icon} alt="" className="md:hidden" />
            <Image
              src={
                expand ? assets.sidebar_close_icon : assets.sidebar_close_icon
              }
              alt=""
              className="hidden md:block w-7 "
            />
          </div>
        </div>

        <button
          onClick={createNewChat}
          className={`mt-8 flex items-center justify-center cursor-pointer ${
            expand
              ? "bg-primary hover:opacity-90 rounded-2xl gap-2 p-2.5 w-max"
              : "group relative h-9 w-9 mx-auto hover:bg-gray-500/30 rounded-lg"
          }`}
        >
          <Image
            className={expand ? "w-6" : "w-7"}
            src={assets.chat_icon}
            alt=""
          />
          {expand && <p className="text-white text font-medium">New chat</p>}
        </button>

        <div
          className={`mt-8 text-white/25 text-sm ${
            expand ? "block" : "hidden"
          }`}
        >
          <p className="my-1">Recent</p>
          {chats?.filter(Boolean).map((chat, index) => (
            <div
              key={index}
              onClick={() => handleChatClick(chat)} // Call handleChatClick on chat click
            >
              <ChatLabel
                name={chat?.name ?? `Chat ${index + 1}`}
                id={chat?._id ?? index}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div
          onClick={user ? null : openSignIn}
          className={`flex items-center ${
            expand ? "hover:bg-white/10 rounded-lg" : "justify-center w-full"
          } gap-3 text-white/60 text-sm p-2 mt-2 cursor-pointer `}
        >
          {user ? (
            <UserButton />
          ) : (
            <Image src={assets.profile_icon} alt="" className="w-7 " />
          )}
          {expand && <span>My Profile</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
