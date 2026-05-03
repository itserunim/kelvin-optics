"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useWebSocket } from '@/lib/useWebSocket';
import NeuCard from '@/components/NeuCard';

export default function WorldChat() {
  const { chatLog, sendMessage } = useWebSocket("192.168.x.x");
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  
  // Chat State
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username.trim().length > 0) setIsLoggedIn(true);
  };

  // NEW: Logout function to reset state
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCredentials({ username: "", password: "" });
    setMessageInput("");
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessage(credentials.username, messageInput);
    setMessageInput("");
  };

  const filteredChat = chatLog.filter(msg => 
    msg.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
    msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#e0e5ec] flex flex-col items-center justify-center p-6 relative">
        
        {/* Absolute Back Button for Login Screen (Goes to Main Menu) */}
        <Link 
          href="/" 
          className="absolute top-6 left-6 w-12 h-12 flex items-center justify-center bg-[#e0e5ec] rounded-full shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] transition-all text-slate-500 hover:text-slate-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>

        <NeuCard className="p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-600 mb-6 text-center">Global Comms Login</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <input 
              type="text" placeholder="Username" required
              className="bg-[#e0e5ec] px-4 py-3 rounded-xl shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] outline-none text-slate-600 focus:ring-2 ring-slate-300"
              onChange={e => setCredentials({...credentials, username: e.target.value})}
            />
            <input 
              type="password" placeholder="Password" required
              className="bg-[#e0e5ec] px-4 py-3 rounded-xl shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] outline-none text-slate-600 focus:ring-2 ring-slate-300"
              onChange={e => setCredentials({...credentials, password: e.target.value})}
            />
            <button type="submit" className="bg-[#e0e5ec] font-bold text-slate-600 py-3 rounded-xl shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] transition-all">
              Connect to Network
            </button>
          </form>
        </NeuCard>
      </div>
    );
  }

  // ACTIVE CHAT SCREEN
  return (
    <div className="min-h-screen bg-[#e0e5ec] p-4 md:p-6 flex flex-col items-center relative">
      
      <div className="w-full max-w-2xl flex flex-col h-[90vh] mt-12 md:mt-8">
        
        {/* Header & Search */}
        <NeuCard className="p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
                {/* NEW: Logout Button */}
                <button 
                    onClick={handleLogout}
                    className="px-4 py-2 flex items-center gap-2 bg-[#e0e5ec] rounded-full shadow-[4px_4px_8px_#a3b1c6,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] transition-all text-sm font-bold text-slate-500 hover:text-red-400 focus:outline-none"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-slate-600">Global Comms</h1>
            </div>
          
          <input 
            type="text" 
            placeholder="Search users or messages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-[#e0e5ec] px-4 py-2 rounded-xl shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] outline-none text-sm text-slate-600"
          />
        </NeuCard>

        {/* Chat Area */}
        <NeuCard className="flex-1 p-4 mb-6 overflow-y-auto flex flex-col gap-4">
          {filteredChat.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-slate-400 font-semibold mb-1 ml-1">{msg.user}</span>
              <NeuCard className="px-5 py-3 text-slate-600 max-w-[80%]" pressed={!msg.isSelf}>
                {msg.text}
              </NeuCard>
            </div>
          ))}
          {filteredChat.length === 0 && <p className="text-center text-slate-400 mt-10">No messages found.</p>}
        </NeuCard>

        {/* Input Area */}
        <form onSubmit={handleSend} className="flex gap-4">
          <input 
            type="text" 
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            placeholder="Broadcast to network..." 
            className="flex-1 bg-[#e0e5ec] px-4 py-3 rounded-xl shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] outline-none text-slate-600"
            maxLength={40}
          />
          <button type="submit" className="bg-[#e0e5ec] font-bold text-slate-600 px-6 py-3 rounded-xl shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] transition-all">
            Send
          </button>
        </form>

      </div>
    </div>
  );
}