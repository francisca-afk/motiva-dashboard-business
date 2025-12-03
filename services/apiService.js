import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + "/api" || "http://localhost:5002/api",
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getUserByToken = async (token) => {
  try {
    const response = await api.get(`/auth/user-by-token`, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching user by token:", error);
    throw error.response?.data || error;
  }
}

// Upload a knowledge file to the business
export const uploadKnowledgeFile = async (businessId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`/knowledge/business/${businessId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error uploading knowledge file:", error);
    throw error.response?.data || error;
  }
};

// Process a knowledge file
export const processKnowledgeFile = async (knowledgeId) => {
  try {
    const response = await api.post(`/knowledge/${knowledgeId}/process`);
    return response.data;
  } catch (error) {
    console.error("❌ Error processing knowledge file:", error);
    throw error.response?.data || error;
  }
};

// Get all knowledge files for a business
export const getKnowledgeFiles = async (businessId) => {
  try {
    const response = await api.get(`/knowledge/business/${businessId}/files`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching knowledge files:", error);
    throw error.response?.data || error;
  }
};

export const deleteKnowledgeFile = async (fileId) => {
    try {
      const response = await api.delete(`/knowledge/${fileId}/delete`);
      return response.data;
    } catch (error) {
      console.error("❌ Error deleting knowledge file:", error);
      throw error.response?.data || error;
    }
};

export const getBusinessByUserId = async (userId) => {
  try {
    const response = await api.get(`/business/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching business by user id:", error);
    throw error.response?.data || error;
  }
};

export const getBusinessById = async (businessId) => {
  try {
    const response = await api.get(`/business/${businessId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching business by id:", error);
    throw error.response?.data || error;
  }
};

export const createBusiness = async (businessData) => {
  try {
    const response = await api.post(`/business`, businessData);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating business:", error);
    throw error.response?.data || error;
  }
};

export const updateBusiness = async (businessId, businessData) => {
  try {
    const response = await api.put(`/business/${businessId}`, businessData);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating business:", error);
    throw error.response?.data || error;
  }
}

// Generate chat response
export const generateChatResponse = async (payload) => {
    try {
      const response = await api.post(`/chat`, payload);
      return response.data;
    } catch (error) {
      console.error("❌ Error generating chat response:", error);
      throw error.response?.data || error;
    }
  };
  
  // Get session history
  export const getSessionHistory = async (sessionId) => {
    try {
      const response = await api.get(`/chat/${sessionId}/history`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching session history:", error);
      throw error.response?.data || error;
    }
  };
  
  // Email conversation summary
  export const emailConversationSummary = async (sessionId, emailData) => {
    try {
      const response = await api.post(`/chat/${sessionId}/email`, emailData);
      return response.data;
    } catch (error) {
      console.error("❌ Error emailing conversation summary:", error);
      throw error.response?.data || error;
    }
  };
  
  // Get all conversations for a business
  export const getBusinessConversations = async (businessId) => {
    try {
      const response = await api.get(`/chat/business/${businessId}/conversations`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching business conversations:", error);
      throw error.response?.data || error;
    }
  };
  
  //  Get messages for one conversation
  export const getConversationMessages = async (sessionId) => {
    try {
      const response = await api.get(`/chat/${sessionId}/messages`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching conversation messages:", error);
      throw error.response?.data || error;
    }
  };
  
  // Get summary of one conversation
  export const getConversationSummary = async (sessionId) => {
    try {
      const response = await api.get(`/chat/${sessionId}/summary`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching conversation summary:", error);
      throw error.response?.data || error;
    }
  };

  export const generateConversationSummary = async (sessionId) => {
    try {
      const response = await api.get(`/chat/session/${sessionId}/generate-summary`);
      return response.data;
    } catch (error) {
      console.error("❌ Error generating conversation summary:", error);
      throw error.response?.data || error;
    }
  };

  export const getMoodCountBySessionId = async (sessionId) => {
    try {
      const response = await api.get(`/chat/session/${sessionId}/moods`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching mood count by session id:", error);
      throw error.response?.data || error;
    }
  };
  
  // Delete chat session
  export const deleteSession = async (sessionId) => {
    try {
      const response = await api.delete(`/chat/${sessionId}/delete`);
      return response.data;
    } catch (error) {
      console.error("❌ Error deleting chat session:", error);
      throw error.response?.data || error;
    }
  };
  
  /* Alerts */
  export const getAlerts = async (businessId) => {
    try {
        console.log("fetching alerts for business", businessId);
      const response = await api.get(`/alert/business/${businessId}`);
      console.log("alerts", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching alerts:", error);
      throw error.response?.data || error;
    }
  };

  export const getAlertBySessionId = async (sessionId, businessId) => {
    try {
      const response = await api.get(`/alert/business/${businessId}/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching alert by session id:", error);
      throw error.response?.data || error;
    }
  };

  export const getAlertById = async (alertId) => {
    try {
      const response = await api.get(`/alert/${alertId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching alert by id:", error);
      throw error.response?.data || error;
    }
  };

  export const markAlertAsRead = async (alertId) => {
    try {
      const response = await api.post(`/alert/${alertId}/mark-as-read`);
      return response.data;
    } catch (error) {
      console.error("❌ Error marking alert as read:", error);
      throw error.response?.data || error;
    }
  };

  export const markAlertAsResolved = async (alertId) => {
    try {
      const response = await api.post(`/alert/${alertId}/mark-as-resolved`);
      return response.data;
    } catch (error) {
      console.error("❌ Error marking alert as resolved:", error);
      throw error.response?.data || error;
    }
  };

  export const deleteAlert = async (alertId) => {
    try {
      const response = await api.delete(`/alert/${alertId}/delete`);
      return response.data;
    } catch (error) {
      console.error("❌ Error deleting alert:", error);
      throw error.response?.data || error;
    }
  };

  export const takeOverSession = async (sessionId) => {
    try {
      const response = await api.post(`/chat/session/${sessionId}/takeover`);
      return response.data;
    } catch (error) {
      console.error("❌ Error taking over session:", error);
      throw error.response?.data || error;
    }
  };

  export const updateBusinessTheme = async (businessId, themeColors) => {
    console.log('themeColors from api service', themeColors);
    try {
      const response = await api.patch(`/business/${businessId}/theme`, themeColors);
      return response.data;
    } catch (error) {
      console.error("❌ Error updating business theme:", error);
      throw error.response?.data || error;
    }
  };

  export const resetBusinessTheme = async (businessId) => {
    try {
      const response = await api.patch(`/business/${businessId}/theme/reset`);
      return response.data;
    } catch (error) {
      console.error("❌ Error resetting business theme:", error);
      throw error.response?.data || error;
    }
  };


  export const getBusinessUsers = async (businessId) => {
    try {
      const response = await api.get(`/business-users/${businessId}/users`);
      console.log("business users");
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching business users:', error);
      throw error.response?.data || error;
    }
  };
  
  // Invitar usuario
  export const inviteUser = async (businessId, inviteData) => {
    try {
      const response = await api.post(`/business-users/${businessId}/invite`, inviteData);
      return response.data;
    } catch (error) {
      console.error('❌ Error inviting user:', error);
      throw error.response?.data || error;
    }
  };
  
  // Actualizar rol de usuario
  export const updateUserRole = async (businessId, userId, role) => {
    try {
      const response = await api.patch(`/business-users/${businessId}/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      throw error.response?.data || error;
    }
  };
  
  // Eliminar usuario del business
  export const removeUser = async (businessId, userId) => {
    try {
      const response = await api.delete(`/business-users/${businessId}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error removing user:', error);
      throw error.response?.data || error;
    }
  };
  
  // Reenviar invitación
  export const resendInvitation = async (businessId, invitationId) => {
    try {
      const response = await api.post(`/business-users/${businessId}/invite/${invitationId}/resend`);
      return response.data;
    } catch (error) {
      console.error('❌ Error resending invitation:', error);
      throw error.response?.data || error;
    }
  };
  
  // Cancelar invitación
  export const cancelInvitation = async (businessId, invitationId) => {
    try {
      const response = await api.delete(`/business-users/${businessId}/invite/${invitationId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error canceling invitation:', error);
      throw error.response?.data || error;
    }
  };
  
  // Obtener permisos y roles
  export const getPermissionsAndRoles = async () => {
    try {
      const response = await api.get('/auth/permissions');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching permissions:', error);
      throw error.response?.data || error;
    }
  }