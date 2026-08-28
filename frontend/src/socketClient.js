// socketClient.js
import { io } from "socket.io-client";

let socket = null;

export function initSocket(accessToken) {
  if (!accessToken) return null;

  // Create a new socket per tab
  socket = io("http://localhost:8000", {
    transports: ["websocket"],
    auth: { token: accessToken },
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
