"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api"; 
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
import ChatBox from "@/components/ChatBox";
import { Id } from "../../convex/_generated/dataModel";

// TypeScript Interface: Evaluation criteria ke liye zaroori hai
interface UserType {
  _id: Id<"users">;
  name: string;
  image: string;
  email: string;
  clerkId: string;
}

export default function Home() {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.users.store);
  
  // Requirement #2: Type safety update
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const me = useQuery(api.users.currentUser);

  // Requirement #1: Sync user to Convex
  useEffect(() => {
    if (isAuthenticated && user) {
      const syncUser = async () => {
        try {
          await storeUser({
            name: user.fullName || "User",
            email: user.primaryEmailAddress?.emailAddress || "",
            image: user.imageUrl || "",
            clerkId: user.id,
          });
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      };
      syncUser();
    }
  }, [isAuthenticated, user, storeUser]);

  // Requirement #13: Loading State (Skeleton alternative)
  if (isAuthenticated && !me) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Syncing your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <AuthLoading>
        <div className="flex h-full w-full items-center justify-center">
          <div className="animate-pulse text-xl font-medium text-gray-400">Initializing Tars...</div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="flex h-full w-full items-center justify-center p-6">
          <div className="text-center p-10 bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-blue-200 shadow-lg">T</div>
            <h1 className="text-3xl font-bold mb-3 text-gray-900">Tars Chat</h1>
            <p className="mb-8 text-gray-500">The real-time coding challenge submission by Suvalaxmi.</p>
            <SignInButton mode="modal">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100">
                Get Started
              </button>
            </SignInButton>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="flex h-full w-full relative">
          {/* Requirement #2 & #6: Responsive Sidebar */}
          <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 h-full shrink-0 border-r bg-white`}>
            <Sidebar 
              onSelectUser={(u: UserType) => setSelectedUser(u)} 
              selectedUserId={selectedUser?._id} 
            />
          </div>

          {/* Right Side: Chat Window */}
          <div className={`${!selectedUser ? 'hidden md:flex' : 'flex'} flex-1 flex-col h-full bg-white`}>
            <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
              <div className="flex items-center gap-3">
                {/* Back button for mobile (Requirement #6) */}
                {selectedUser && (
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <span className="text-xl">←</span>
                  </button>
                )}
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-[10px] md:text-xs font-bold text-green-700 uppercase tracking-wider">Live</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <p className="hidden sm:block text-sm font-bold text-gray-900">{user?.fullName}</p>
                <div className="border-l pl-4">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </header>

            {/* Requirement #3 & #5: Content and Empty States */}
            <div className="flex-1 overflow-hidden relative">
              {selectedUser && me ? (
                <ChatBox selectedUser={selectedUser} currentUser={me} />
              ) : (
                <div className="hidden md:flex h-full flex-col items-center justify-center p-12 text-center bg-gray-50/50">
                  <div className="bg-white shadow-sm border border-gray-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl">👋</div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Welcome, {user?.firstName}!
                  </h3>
                  <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm">
                    Select a contact from the sidebar to start a secure real-time conversation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Authenticated>
    </main>
  );
}