import { assets } from "@/assets/assets";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";

const PromptBox = ({ isLoading, setIsLoading }) => {
  const [prompt, setPrompt] = useState("");
  const { user, chats, setChats, selectedChat, setSelectedChat } =
    useAppContext();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(e);
    }
  };

  const sendPrompt = async (e) => {
    const promptCopy = prompt;
    try {
      e.preventDefault();

      if (!user) return toast.error("Login to send message");
      if (!selectedChat || !selectedChat._id)
        return toast.error("No chat selected");
      if (isLoading) return toast.error("Wait for the previous prompt");

      setIsLoading(true);
      setPrompt("");

      const userPrompt = {
        role: "user",
        content: prompt,
        timestamp: Date.now(),
      };

      // Push user message
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, messages: [...chat.messages, userPrompt] }
            : chat
        )
      );

      setSelectedChat((prev) => ({
        ...prev,
        messages: [...prev.messages, userPrompt],
      }));

      // Send prompt to backend
      const { data } = await axios.post("/api/chat/ai", {
        chatId: selectedChat._id,
        prompt,
      });

      if (data.success) {
        const message = data.data.content;
        const messageTokens = message.split(" ");

        const newAssistant = {
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };

        setSelectedChat((prev) => ({
          ...prev,
          messages: [...prev.messages, newAssistant],
        }));

        let i = 0;
        const interval = setInterval(() => {
          if (i >= messageTokens.length) {
            clearInterval(interval);
            return;
          }

          const newContent = messageTokens.slice(0, i + 1).join(" ");
          setSelectedChat((prev) => {
            const updatedMessages = [...prev.messages];
            updatedMessages[updatedMessages.length - 1] = {
              ...newAssistant,
              content: newContent,
            };
            return { ...prev, messages: updatedMessages };
          });

          i++;
        }, 100);

        setChats((prev) =>
          prev.map((chat) =>
            chat._id === selectedChat._id
              ? {
                  ...chat,
                  messages: [...chat.messages, data.data],
                }
              : chat
          )
        );
      } else {
        toast.error(data.message || "Something went wrong");
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
      setPrompt(promptCopy);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={sendPrompt}
      className={`w-full ${
        selectedChat?.messages.length > 0 ? "max-w-3xl" : "max-w-2xl"
      }  bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
    >
      <textarea
        onKeyDown={handleKeyDown}
        onChange={(e) => setPrompt(e.target.value)}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
        rows={2}
        placeholder="Message DeepSeek"
        required
        value={prompt}
      />
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition ">
            <Image className="h-5" alt="" src={assets.deepthink_icon} />
            DeepThink (R1)
          </p>
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition ">
            <Image className="h-5" src={assets.search_icon} alt="" />
            search
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Image className="w-4 cursor-pointer" alt="" src={assets.pin_icon} />
          <button
            className={`${
              prompt ? "bg-primary" : "bg-[#71717a]"
            } rounded-full p-2 cursor-pointer`}
          >
            <Image
              className="w-3.5 aspect-square"
              alt=""
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
