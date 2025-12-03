"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getBusinessById, getAlerts, getAlertBySessionId, getUserByToken, getPermissionsAndRoles } from "@/services/apiService";
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
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserPermissions, setCurrentUserPermissions] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [userTypingSessions, setUserTypingSessions] = useState(new Set());
  const [ackSessions, setAckSessions] = useState(new Set());

  const addAckSession = (sessionId) => {
    setAckSessions(prev => new Set([...prev, sessionId]));
  };

  
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
        setCurrentUserRole(userData.role);
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

  useEffect(() => {
    if (!user) return;
    const fetchPermissions = async () => {
      const response = await getPermissionsAndRoles();
      const { permissions, roles } = response.data;
      // Get permissions for the logged-in user
      const userPermissions = roles[user.role] || [];
      setCurrentUserPermissions(userPermissions);
      setPermissions(permissions);
      setPermissionsLoaded(true);
    };
  
    fetchPermissions();
  }, [user]);
  
  const hasPermission = (permission) => {
    return currentUserPermissions?.includes(permission);
  };

  const setSession = (userData, tokenData) => {
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

  useEffect(() => {
    if (!user || business || pathname === '/setup') return;
  
    const fetchBusiness = async () => {
      try {
        if (!user.business) {
          router.push("/setup");
          return;
        }
  
        const { data } = await getBusinessById(user.business);
        
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
      const response = await getAlerts(business._id);
      setAlerts(response.data || [])
    };
    fetchAlerts();
  }, [business]);

 
  useEffect(() => {
    if (!business?._id) return;
  
    
    const socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      transports: ["websocket"],
    });
  
    socketInstance.on("connect", () => {
      socketInstance.emit("join_business_conversations", business._id);
      socketInstance.emit("join_alerts", business._id);
    });
  
    // Business conversations room confirmation
    socketInstance.on("joined_business_conversations", ({ room }) => {
    });

    socketInstance.on("joined_alerts", ({ room }) => {
    });

    socketInstance.on("new_conversation_message", (data) => {
      
      const { sessionId, message, sessionData } = data;
      const isInChatPage = pathname?.includes(`/support/chat/${sessionId}`);
      
      if (!isInChatPage && message.role === 'user') {
        window.dispatchEvent(new CustomEvent('show_message_notification', { 
          detail: { sessionId, message, sessionData }
        }));
      }
    })

    socketInstance.on("client_acknowledged_handoff", (data) => {
      addAckSession(data.sessionId)
    })
  
    socketInstance.on("new_alert", (alert) => {
      setAlerts((prev) => [alert, ...prev]);
      
      // Show toast notification
      toast.error(alert.message, {
        icon: '🚨',
        duration: 5000,
        position: 'top-right',
      });
    });

    // User typing indicator
    socketInstance.on("visitor_typing", ({ sessionId, isUserTyping }) => {
      setUserTypingSessions(prev => {
        const next = new Set(prev);
        if (isUserTyping) next.add(sessionId);
        else next.delete(sessionId);
        return next;
      });
    })

    socketInstance.on("user_stopped_typing", (data) => {
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
      }
    };
  }, [business, pathname, router, token])

  
  const sendMessage = useCallback((sessionId, message) => {
    if (socket && sessionId) {
      socket.emit("support_message", {
        sessionId,
        message
      });
    }
  }, [socket]);
  
  const sendTypingIndicator = useCallback((sessionId, isHumanAgentTyping) => {
    if (socket && sessionId) {
      socket.emit('human_agent_typing', {
        sessionId,
        isHumanAgentTyping
      });
    }
  }, [socket]);

  return (
    <AppContext.Provider
      value={{ user, 
        token, 
        currentUserRole,
        business, 
        alerts, 
        currentUserPermissions,
        permissions,
        permissionsLoaded,
        hasPermission,
        setSession, 
        setBusiness,
        logout, 
        sendMessage, 
        sendTypingIndicator,
        setCurrentUserRole,
        userTypingSessions,
        socket,
        ackSessions
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

