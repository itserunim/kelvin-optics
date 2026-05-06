"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import NeuCard from '@/components/NeuCard';
import mqtt from 'mqtt';

interface ChatMessage {
  id: number;
  user: string;
  text: string;
  isSelf: boolean;
  createdAt: string;
}

export default function WorldChat() {
  // ----- Auth state -----
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ----- Chat state -----
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isUserNearBottomRef = useRef(true);

  // ----- MQTT live messages -----
  const mqttClient = useRef<any>(null);

  // ----- Auto‑login -----
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('username');
    if (token && storedUser) {
      setIsLoggedIn(true);
      setCredentials(prev => ({ ...prev, username: storedUser }));
    }
  }, []);

  // ----- REST fetch messages -----
  const fetchMessages = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/chat/messages?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setMessages(data.messages);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [isLoggedIn, fetchMessages]);

  // ----- MQTT subscription (live chat) -----
  useEffect(() => {
    if (!isLoggedIn) return;
    const client = mqtt.connect('ws://broker.hivemq.com:8000/mqtt', {
      clientId: 'chat_' + Math.random().toString(16).substr(2, 8),
    });
    mqttClient.current = client;

    client.on('connect', () => {
      client.subscribe('kelvin/chat/in');
      client.subscribe('kelvin/chat/out');   // to see replies from glasses
    });

    client.on('message', (topic: string, message: Buffer) => {
      const data = JSON.parse(message.toString());
      // Create a message object matching ChatMessage
      const newMsg: ChatMessage = {
        id: Date.now(),
        user: data.user || 'kelvin_optics',
        text: data.text || '',
        isSelf: false,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMsg]);
    });

    return () => {
      client.end();
    };
  }, [isLoggedIn]);

  // ----- Auto‑scroll -----
  useEffect(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 50;
    if (isUserNearBottomRef.current || nearBottom) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ----- Auth API calls -----
  const loginOrRegister = async (endpoint: 'register' | 'login') => {
    setErrorMsg("");
    try {
      const res = await fetch(`/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.username.trim(),
          password: credentials.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      setIsLoggedIn(true);
      setCredentials({ username: "", password: "" });
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username.trim() || !credentials.password.trim() || !confirmPassword.trim()) {
      setErrorMsg("All fields are required.");
      return;
    }
    if (credentials.password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    await loginOrRegister('register');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setErrorMsg("Username and password are required.");
      return;
    }
    await loginOrRegister('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setCredentials({ username: "", password: "" });
    setMessageInput("");
    setMessages([]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: messageInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setMessages(prev => [...prev, data]);
      setMessageInput("");
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          isUserNearBottomRef.current = true;
        }
      }, 0);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ========================
  // AUTH SCREEN
  // ========================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#e0e5ec] flex flex-col items-center justify-center p-6 relative">
        <Link
          href="/"
          className="absolute top-6 left-6 w-12 h-12 flex items-center justify-center bg-[#e0e5ec] rounded-full shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] transition-all text-slate-500 hover:text-slate-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>

        <NeuCard className="p-8 w-full max-w-md">
          {authMode === 'register' ? (
            <>
              <h2 className="text-2xl font-bold text-slate-600 mb-6 text-center">Create Account</h2>
              <form onSubmit={handleRegister} className="flex flex-col gap-6">
                <input
                  type="text"
                  placeholder="Username"
                  required
                  className="bg-[#e0e5ec] px-4 py-3 rounded-xl shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] outline-none text-slate-600"
                  value={credentials.username}
                  onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  className="bg-[#e0e5ec] px-4 py-3 rounded-xl shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] outline-none text-slate-600"
                  value={credentials.password}
                  onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  required
                  className="bg-[#e0e5ec] px-4 py-3 rounded-xl shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] outline-none text-slate-600"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                {errorMsg && (
                  <div className="text-red-500 text-sm font-semibold bg-[#e0e5ec] p-2 rounded-xl shadow-inner text-center">
                    {errorMsg}
                  </div>
                )}
                <button type="submit" className="bg-[#e0e5ec] font-bold text-slate-600 py-3 rounded-xl shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] transition-all">
                  Register
                </button>
                <p className="text-center text-sm text-slate-500">
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setAuthMode('login'); setErrorMsg(''); setConfirmPassword(''); }} className="underline text-slate-600 font-semibold hover:text-slate-800">
                    Sign In
                  </button>
                </p>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-600 mb-6 text-center">Global Comms Login</h2>
              <form onSubmit={handleLogin} className="flex flex-col gap-6">
                <input
                  type="text"
                  placeholder="Username"
                  required
                  className="bg-[#e0e5ec] px-4 py-3 rounded-xl shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] outline-none text-slate-600"
                  value={credentials.username}
                  onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  className="bg-[#e0e5ec] px-4 py-3 rounded-xl shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] outline-none text-slate-600"
                  value={credentials.password}
                  onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                />
                {errorMsg && (
                  <div className="text-red-500 text-sm font-semibold bg-[#e0e5ec] p-2 rounded-xl shadow-inner text-center">
                    {errorMsg}
                  </div>
                )}
                <button type="submit" className="bg-[#e0e5ec] font-bold text-slate-600 py-3 rounded-xl shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] transition-all">
                  Connect to Network
                </button>
                <p className="text-center text-sm text-slate-500">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => { setAuthMode('register'); setErrorMsg(''); setCredentials({ username: '', password: '' }); }} className="underline text-slate-600 font-semibold hover:text-slate-800">
                    Register
                  </button>
                </p>
              </form>
            </>
          )}
        </NeuCard>
      </div>
    );
  }

  // ========================
  // CHAT SCREEN
  // ========================
  return (
    <div className="min-h-screen bg-[#e0e5ec] p-4 md:p-6 flex flex-col items-center relative">
      <div className="w-full max-w-2xl flex flex-col h-[90vh] mt-12 md:mt-8">
        <NeuCard className="p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="px-4 py-2 flex items-center gap-2 bg-[#e0e5ec] rounded-full shadow-[4px_4px_8px_#a3b1c6,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] transition-all text-sm font-bold text-slate-500 hover:text-red-400">
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

        <NeuCard className="flex-1 mb-6 overflow-hidden p-4">
          <div
            ref={chatContainerRef}
            className="h-full overflow-y-auto flex flex-col gap-4 p-4 custom-scrollbar"
            onScroll={() => {
              if (!chatContainerRef.current) return;
              const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
              const nearBottom = scrollTop + clientHeight >= scrollHeight - 50;
              isUserNearBottomRef.current = nearBottom;
            }}
          >
            {filteredMessages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-slate-400 font-semibold mb-1 ml-1">{msg.user}</span>
                <NeuCard className="px-5 py-3 text-slate-600 max-w-[80%]" pressed={!msg.isSelf}>
                  {msg.text}
                </NeuCard>
              </div>
            ))}
            {filteredMessages.length === 0 && (
              <p className="text-center text-slate-400 mt-10">No messages yet. Say something!</p>
            )}
          </div>
        </NeuCard>

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