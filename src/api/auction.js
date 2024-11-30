import { io } from "socket.io-client";
import axios from "axios";
import { getToken } from "./token";
// require('dotenv').config()

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL; 

const API_URL = process.env.REACT_APP_API_URL; 

const socket = io(SOCKET_URL);

// Place a bid
export const placeBid = (bidAmount, token) => {
  socket.emit("bid", { bidAmount, token });
};

// Listen for real-time updates
export const onUpdate = (callback) => {
  socket.on("update", callback);
};

// Listen for auction end
export const onAuctionEnd = (callback) => {
  socket.on("end", callback);
};

// Disconnect socket
export const disconnectSocket = () => {
  socket.disconnect();
};



export const fetchAuctions = async () => {
  try {
    const token = getToken(); 
    if (!token) {
      throw new Error("You need to login to view the auction.");
    }

    const response = await axios.get(`${API_URL}/auction`, {
      headers: {
        Authorization: `Bearer ${token}`, // Pass token in Authorization header
      },
    });

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch auction data.");
  }
};

