"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
// ✅ Step 1: UserButton import karo
import { UserButton } from "@clerk/nextjs";

interface SidebarProps {
  onSelectUser: (user: any) => void;
  selectedUserId?: string;
}

export default function Sidebar({ onSelectUser, selectedUserId }: SidebarProps) {
  const users = useQuery(api.users.getUsers);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users?.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (users === undefined) {
    return (
      <div className="w-80 border-r h-screen p-4 flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <aside className="w-80 border-r h-screen flex flex-col bg-white shrink-0">
      {/* Search Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search people..."
            className="w-full p-2 pl-8 border rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-2.5 top-2.5 text-gray-400 text-sm">🔍</span>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers?.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-sm">No users found for "{searchTerm}"</p>
          </div>
        ) : (
          filteredUsers?.map((user) => (
            <button
              key={user._id}
              className={`w-full p-4 flex items-center gap-3 border-b transition-colors text-left ${
                selectedUserId === user._id ? "bg-blue-50 border-r-4 border-r-blue-500" : "hover:bg-gray-50"
              }`}
              onClick={() => onSelectUser(user)}
            >
              <div className="relative">
                <img 
                  src={user.image} 
                  alt={user.name} 
                  className="w-12 h-12 rounded-full object-cover border shadow-sm" 
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                <p className={`text-xs truncate ${selectedUserId === user._id ? "text-blue-600" : "text-gray-400"}`}>
                  {selectedUserId === user._id ? "Chatting now..." : "Click to start messaging"}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* ✅ Step 2: Bottom mein Logout Button (Panga-free) */}
      <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-700">My Account</span>
            <span className="text-[10px] text-gray-500">Sign out here</span>
          </div>
        </div>
      </div>
    </aside>
  );
}