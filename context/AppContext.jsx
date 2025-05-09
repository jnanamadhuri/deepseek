"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const createNewChat = async () => {
    try {
      if (!user) return null;

      const token = await getToken();

      await axios.post(
        "/api/chat/create",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchUsersChats(); // Ensure updated list after creation
    } catch (error) {
      toast.error(error.message || "Failed to create new chat");
    }
  };

  const fetchUsersChats = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/chat/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        const chatsList = [...data.data];

        // If no chats, create one and refetch
        if (chatsList.length === 0) {
          await createNewChat();
          return;
        }

        // Sort chats by recent update
        chatsList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        setChats(chatsList);
        setSelectedChat(chatsList[0]); // Select most recent chat
        console.log("Selected chat:", chatsList[0]);
      } else {
        toast.error(data.message || "Failed to fetch chats");
      }
    } catch (error) {
      toast.error(error.message || "Error fetching chats");
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsersChats();
    }
  }, [user]);

  const value = {
    user,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    fetchUsersChats,
    createNewChat,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
