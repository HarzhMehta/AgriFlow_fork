'use client';
import { assets } from "@/assets/assets";
import Message from "@/components/Message";
import PromptBox from "@/components/PromptBox";
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { useAppContext } from "@/context/AppContext";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { selectedChat } = useAppContext();
  
  const [expand, setExpand] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  
  const containerRef = useRef(null);
  const userScrolledRef = useRef(false);
  const bottomRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const lastCheckedUserIdRef = useRef(null);

  // Authentication & profile check
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      lastCheckedUserIdRef.current = null;
      router.push('/sign-in');
      return;
    }

    // Skip if already checked this user
    if (lastCheckedUserIdRef.current === user.id) {
      setCheckingProfile(false);
      return;
    }

    // Check profile completion
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        lastCheckedUserIdRef.current = user.id;
        const isComplete = data.success && data.data?.profileCompleted === true;
        if (!isComplete) router.push('/onboarding');
      })
      .catch(() => router.push('/onboarding'))
      .finally(() => setCheckingProfile(false));
  }, [router, isLoaded, isSignedIn, user?.id]);

  // Load messages from selected chat
  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
      userScrolledRef.current = false;
    }
  }, [selectedChat]);

  // Auto-scroll to bottom
  useEffect(() => {
    // Don't auto-scroll if the user manually scrolled up
    if (userScrolledRef.current) return;

    // Robust scroll helper: ensure it runs after DOM updates / syntax highlighting
    const doScroll = () => {
      const behavior = isLoading ? 'auto' : 'smooth';
      try {
        if (bottomRef.current) {
          // use scrollIntoView on the sentinel — it's more reliable
          bottomRef.current.scrollIntoView({ behavior, block: 'end' });
        } else if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      } catch (e) {
        // fallback to direct assignment
        try { containerRef.current.scrollTop = containerRef.current.scrollHeight; } catch (_) {}
      }
    };

    // Run on next animation frames to wait for the DOM to settle
    let raf1 = requestAnimationFrame(() => requestAnimationFrame(doScroll));
    // Extra fallback in case RAF misses (e.g., heavy rendering)
    const t = setTimeout(doScroll, 100);

    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(t);
    };
  }, [messages, isLoading]);

  // Track user scrolling
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    userScrolledRef.current = scrollHeight - scrollTop - clientHeight >= 100;
  };

  // Normalize file data
  const normalizeFiles = (files = []) => {
    if (!files.length) return [];
    if (typeof files[0] === 'object') {
      return files.map(f => f.originalName || f.fileName || 'Unknown');
    }
    return files;
  };

  // Loading screen
  if (checkingProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#292a2d]">
        <div className="text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[0, 100, 200].map((delay, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-white animate-bounce" style={{ animationDelay: `${delay}ms` }} />
            ))}
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ThemeToggle />
      <div className="flex h-screen">
        <Sidebar expand={expand} setExpand={setExpand} />
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 bg-[#292a2d] text-white relative">
          
          {/* Mobile Header */}
          <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
            <Image onClick={() => setExpand(!expand)} className="rotate-180 sidebar-icon" src={assets.menu_icon} alt="Menu" />
            <Image className="opacity-70 sidebar-icon" src={assets.chat_icon} alt="Chat" />
          </div>

          {/* Welcome or Chat Display */}
          {messages.length === 0 ? (
            <div className="text-center">
              <div className="w-full max-w-3xl px-4 mt-16">
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Image src={assets.logo_icon} alt="Logo" className="w-12 h-auto" />
                <p className="text-2xl font-medium">Hi, I'm AgriFlow AI 🌾</p>
              </div>
              <p className="text-sm mt-2">Your Agriculture & Farming Assistant. How can I help you today?</p>
            </div>
          ) : (
            <div ref={containerRef} onScroll={handleScroll} className="relative flex flex-col items-center justify-start w-full mt-20 max-h-screen overflow-y-auto">
              <p className="fixed top-8 border border-transparent hover:border-gray-500/50 py-1 px-2 rounded-lg font-semibold mb-6">
                {selectedChat.name}
              </p>
              {messages.map((msg, index) => (
                <Message key={index} role={msg.role} content={msg.content} files={normalizeFiles(msg.files)} />
              ))}
              {isLoading && (
                <div className="flex gap-4 max-w-3xl w-full py-3">
                  <Image className="h-9 w-9 p-1 border border-white/15 rounded-full" src={assets.logo_icon} alt="Logo" />
                  <div className="flex gap-1">
                    {[0, 100, 200].map((delay, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-white animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              {/* sentinel element for reliable scrolling */}
              <div ref={bottomRef} />
            </div>
          )}

          <PromptBox isLoading={isLoading} setIsLoading={setIsLoading} isAnimatingRef={isAnimatingRef} />
          <p className="text-xs absolute bottom-1 text-gray-500">Feel free to ask....</p>
        </div>
      </div>
    </div>
  );
}
