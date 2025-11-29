"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getBusinessById, getAlerts, getAlertBySessionId, getUserByToken } from "@/services/apiService";
import { io } from "socket.io-client";
import { useRouter, usePathname } from "next/navigation";
import { getValidToken, saveSession, clearSession } from "@/services/authService";
import MessageNotificationToast from '@/components/notifications/MessageNotificationToast'
import toast from "react-hot-toast";


const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [business, setBusiness] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acknowledgedSessions, setAcknowledgedSessions] = useState(new Set());
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = getValidToken();
    if (!token) {
      setLoading(false);
      return;
    }

    setToken(token);

    const fetchUser = async () => {
      try {
        const response = await getUserByToken(token);
        const userData = response.data;
        console.log("userData", userData);

        setUser(userData);
        saveSession(userData, token);
      } catch (err) {
        if (err?.response?.status === 401) {
          clearSession();
          setUser(null);
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const setSession = (userData, tokenData) => {
    console.log("setting session", userData, tokenData);
    setUser(userData);
    setToken(tokenData);
    saveSession(userData, tokenData);
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setToken(null);
    setBusiness(null);  
    router.push("/signin");
  };

  const addAcknowledgedSession = (sessionId) => {
    setAcknowledgedSessions(prev => new Set([...prev, sessionId]))
  }
  
  useEffect(() => {
    if (!user || business || pathname === '/setup') return;
  
    const fetchBusiness = async () => {
      try {
        console.log("user", user);
        if (!user.business) {
          console.log("no business found, redirecting to setup");
          router.push("/setup");
          return;
        }
  
        const { data } = await getBusinessById(user.business);
        console.log("data business", data);
        
        if (!data) {
          router.push("/setup");
          return;
        }
  
        setBusiness(data);
        localStorage.setItem("business", JSON.stringify(data));
      } catch (error) {
        console.error("Error loading business:", error);
      }
    };
  
    fetchBusiness();
  }, [user, pathname]);
  

  useEffect(() => {
    if (!business?._id) return;
    const fetchAlerts = async () => {
      console.log("fetching alerts for business", business._id);
      const response = await getAlerts(business._id);
      console.log("alerts", response.data);
      setAlerts(response.data || [])
    };
    fetchAlerts();
  }, [business]);

 
  useEffect(() => {
    if (!business?._id) return;
  
    console.log(`Connecting to alerts via ws for business ${business._id}`);
    
    const socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      transports: ["websocket"],
    });
  
    socketInstance.on("connect", () => {
      socketInstance.emit("join_business_conversations", business._id);
      socketInstance.emit("join_alerts", business._id);
    });
  
    // Business conversations room confirmation
    socketInstance.on("joined_business_conversations", ({ room }) => {
      console.log(`✅ Joined business conversations room: ${room}`);
    });

    socketInstance.on("joined_alerts", ({ room }) => {
      console.log(`✅ Successfully joined room: ${room}`);
    });

    socketInstance.on("new_conversation_message", (data) => {
      console.log("💬 New message in conversation:", data);
      
      const { sessionId, message, sessionData } = data;
      const isInChatPage = pathname?.includes(`/support/chat/${sessionId}`);
      
      if (!isInChatPage && message.role === 'user') {
        window.dispatchEvent(new CustomEvent('show_message_notification', { 
          detail: { sessionId, message, sessionData }
        }));
      }
    })

    socketInstance.on("client_acknowledged_handoff", (data) => {
      console.log("Client acknowledged handoff from app context:", data);
      setAcknowledgedSessions(prev => new Set([...prev, data.sessionId]));
    })
  
    socketInstance.on("new_alert", (alert) => {
      console.log("🔔 New alert received:", alert);
      setAlerts((prev) => [alert, ...prev]);
      
      // Show toast notification
      toast.error(alert.message, {
        icon: '🚨',
        duration: 5000,
        position: 'top-right',
      });
    });

    // User typing indicator
    socketInstance.on("user_typing", (data) => {
      console.log("⌨️ User typing:", data);
      // Handle typing indicator
    });

    socketInstance.on("user_stopped_typing", (data) => {
      console.log("⌨️ User stopped typing:", data);
      // Handle stopped typing
    });
  
    socketInstance.on("disconnect", () => {
      console.log(`🔴 Socket disconnected`);
    });

    socketInstance.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    setSocket(socketInstance);
  
    return () => {
      if (socketInstance) {
        socketInstance.emit("leave_alerts", business._id);
        socketInstance.emit("leave_business_conversations", business._id);
        socketInstance.disconnect();
        console.log(`👋 Disconnected from WebSocket for business ${business._id}`);
      }
    };
  }, [business, pathname, router, token])

  
  const sendMessage = useCallback((sessionId, message) => {
    if (socket && sessionId) {
      console.log(`📤 Sending message to conversation: ${sessionId}`);
      socket.emit("support_message", {
        sessionId,
        message
      });
    }
  }, [socket]);
  
  const sendTypingIndicator = useCallback((sessionId, isTyping) => {
    if (socket && sessionId) {
      socket.emit(isTyping ? "support_typing" : "support_stopped_typing", {
        sessionId
      });
    }
  }, [socket]);

  return (
    <AppContext.Provider
      value={{ user, 
        token, 
        business, 
        alerts, 
        setSession, 
        setBusiness,
        logout, 
        sendMessage, 
        sendTypingIndicator,
        socket,
        acknowledgedSessions,
        addAcknowledgedSession
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

