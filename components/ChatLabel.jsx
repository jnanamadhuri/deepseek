import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";

const ChatLabel = ({ openMenu, setOpenMenu, id, name }) => {
  const { fetchUsersChats, chats, setSelectedChat } = useAppContext();

  const selectChat = () => {
    const chatData = chats.find((chat) => chat.id === id);
    setSelectedChat(chatData);
    console.log(chatData);
  };

  const renameHandler = async () => {
    try {
      const newName = prompt("Enter new name");
      if (!newName) return;
      const { data } = await axios.post("/api/chat/rename", {
        chatId: id,
        name: newName,
      });
      if (data.success) {
        fetchUsersChats();
        setOpenMenu({ id: 0, open: false });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteHandler = async () => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this chat "
      );
      if (!confirm) return;
      const { data } = await axios.post("/api/chat/delete", { chatId: id });
      if (data.success) {
        fetchUsersChats();
        setOpenMenu({ id: 0, open: false });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div
      onClick={selectChat}
      className="flex items-center justify-between p-2 text-white/80
       hover:bg-white/10 rounded-lg text-sm group cursor-pointer"
    >
      <p className="group-hover:max-w-5/6 truncate">{name}</p>
      <div className="group relative flex items-center justify-center h-6 w-6 aspect-square hover:bg-black/80 rounded-lg">
        {/* Three dots button - always visible */}
        <Image
          src={assets.three_dots}
          alt="Menu"
          className="w-4 opacity-70 hover:opacity-100 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu({ id: id, open: !openMenu.open });
          }}
        />

        {/* Dropdown menu */}
        <div
          className={`absolute ${
            openMenu.id === id && openMenu.open ? "block" : "hidden"
          } right-0 top-full mt-1 bg-gray-700 rounded-xl w-max p-2 z-10 shadow-lg`}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              renameHandler();
              setOpenMenu({ id: null, open: false });
            }}
            className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer"
          >
            <Image src={assets.pencil_icon} alt="Rename" className="w-4" />
            <p>Rename</p>
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              deleteHandler();
              setOpenMenu({ id: null, open: false });
            }}
            className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer"
          >
            <Image src={assets.delete_icon} alt="Delete" className="w-4" />
            <p>Delete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatLabel;
