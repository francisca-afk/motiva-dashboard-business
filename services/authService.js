import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const url = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/auth";

const api = axios.create({
  baseURL: url,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getValidToken = () => {
  const token = localStorage.getItem("jwt");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      // Token expired
      localStorage.removeItem("jwt");
      localStorage.removeItem("user");
      return null;
    }

    return token;
  } catch (e) {
    // Token corrupted
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    return null;
  }
};

export const saveSession = (user, token) => {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("jwt", token);
};

export const clearSession = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("jwt");
};


const createApi = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("jwt") : null;
  
  if (typeof window !== 'undefined' && !token) {
    window.location.href = "/login?message=notLoggedIn";
    return null;
  }

  return axios.create({
    baseURL: url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  });
};

const signUp = async (email, firstName, lastName, password) => {
  try {
    console.log(url, "url")
    const response = await api.post('/signup', {
      firstName,
      lastName,
      email,
      password
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with an error
      console.log("error", error.response);
      throw error.response.data;
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server');
    } else {
      // Error in request setup
      throw new Error('Error setting up request');
    }
  }
};

const login = async (email, password) => {
  try {
    const response = await api.post('/login', {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with an error
      throw error.response.data;
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server');
    } else {
      // Error in request setup
      throw new Error('Error setting up request');
    }
  }
};

const forgotPassword = async (email) => {
  try {
    const response = await api.post('/forgot-password', {
      email
    })

    return response.data;
  }
  catch (error) {
    if (error.response) {
      // Server responded with an error
      throw error.response.data;
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server');
    } else {
      // Error in request setup
      throw new Error('Error setting up request');
    }
  }
}

const resetPassword = async (newPassword, token) => {
  try {
    const response = await api.post('/reset-password', {
      newPassword,
      token
    })

    return response.data;
  }
  catch (error) {
    if (error.response) {
      // Server responded with an error
      throw error.response.data;
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server');
    } else {
      // Error in request setup
      throw new Error('Error setting up request');
    }
  }
}

export { signUp, login, resetPassword, forgotPassword };