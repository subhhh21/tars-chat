"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ChatBoxProps {
  selectedUser: {
    _id: Id<"users">;
    name: string;
    image: string;
  };
  currentUser: {
    _id: Id<"users">;
  };
}

// Requirement #4: Timestamp Formatting Helper
const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isDifferentYear = date.getFullYear() !== now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (isDifferentYear) {
    return date.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
};

export default function ChatBox({ selectedUser, currentUser }: ChatBoxProps) {
  const [newMessage, setNewMessage] = useState("");
  
  // Unique Conversation ID
  const conversationId = [currentUser._id, selectedUser._id].sort().join("_");

  // Requirement #3: Real-time message fetching (Defining 'messages' correctly here)
  const messages = useQuery(api.messages.list, { conversationId });
  const sendMessage = useMutation(api.messages.send);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage({
      body: newMessage,
      senderId: currentUser._id,
      conversationId: conversationId,
    });
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3 bg-gray-50/50">
        <img src={selectedUser.image} className="w-10 h-10 rounded-full object-cover border" alt="" />
        <div>
          <h3 className="font-bold text-gray-900">{selectedUser.name}</h3>
          <p className="text-[10px] text-green-600 font-medium uppercase">Active Now</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {/* Requirement #5: Empty State */}
        {!messages || messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
            No messages yet. Start the conversation! 👋
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                msg.senderId === currentUser._id
                  ? "bg-blue-600 text-white self-end rounded-tr-none"
                  : "bg-gray-100 text-gray-800 self-start rounded-tl-none"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.body}</p>
              {/* Requirement #4: Timestamps */}
              <span className={`text-[10px] block mt-1 opacity-70 ${
                msg.senderId === currentUser._id ? "text-right" : "text-left"
              }`}>
                {formatTimestamp(msg._creationTime)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write a message..."
          className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md"
        >
          Send
        </button>
      </form>
    </div>
  );
}