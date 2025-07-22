import { io } from "socket.io-client";

let socket = null;

// ✅ export so other modules (e.g., useChat) can import it
export const getRoomId = (id1, id2) => [id1, id2].sort().join("-");

export const initiateSocket = (userId, receiverId) => {
  const roomId = getRoomId(userId, receiverId);
  console.log("🟡 [initiateSocket] userId:", userId, "receiverId:", receiverId, "roomId:", roomId);

  return new Promise((resolve) => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
        transports: ["websocket"],
        query: { userId },
        withCredentials: true,
      });

      if (typeof window !== "undefined") {
        window.socket = socket;
      }
    }

    socket.on("connect", () => {
      console.log("✅ [Socket Connected] ID:", socket.id);
      socket.emit("join_room", roomId);
      console.log("📩 [Join Room] roomId:", roomId);
      resolve(socket);
    });

    socket.on("disconnect", () => {
      console.log("🔴 [Socket Disconnected]");
    });
  });
};

export const sendMessage = (message) => {
  if (!socket) {
    console.log("❌ [sendMessage] Socket not initialized.");
    return;
  }

  const roomId = getRoomId(message.sender_id, message.receiver_id);
  console.log("📤 [sendMessage] Emitting to room:", roomId, "Message:", message);
  socket.emit("sendMessage", { message, roomId });
};

export const subscribeToMessages = (callback) => {
  if (!socket) return;

  const handler = (message) => {
    console.log("📬 [subscribeToMessages] Received message:", message);
    callback(message); // 👉 let the component decide if it's self-sent
  };

  socket.on("receiveMessage", handler);

  return () => {
    socket.off("receiveMessage", handler);
  };
};


export const requestChat = (senderId, receiverId) => {
  if (!socket) return;
  const roomId = getRoomId(senderId, receiverId);
  console.log("📥 [requestChat] From:", senderId, "To:", receiverId, "Room:", roomId);
  socket.emit("request_chat", { senderId, receiverId, roomId });
};

export const subscribeToChatRequests = (callback) => {
  if (!socket) return;

  const handler = (data) => {
    console.log("📨 [subscribeToChatRequests] Incoming:", data);
    callback(data);
  };

  socket.on("request_chat", handler);

  return () => {
    socket.off("request_chat", handler);
  };
};

export const acceptChatRequest = (senderId, receiverId) => {
  if (!socket) return;
  const roomId = getRoomId(senderId, receiverId);
  console.log("✅ [acceptChatRequest] Accepting chat Room:", roomId);
  socket.emit("accept_chat", { senderId, receiverId, roomId });
};

// export const rejectChatRequest = (senderId, receiverId) => {
//   if (!socket) return;
//   console.log("❌ [rejectChatRequest] Rejecting chat.");
//   socket.emit("reject_chat", { senderId, receiverId });
// };

export const subscribeToChatAccepted = (callback) => {
  console.log(" under subscribeToChatAccepted function in socket");
  if (!socket) return;

  const handler = (data) => {
    console.log("✅ [subscribeToChatAccepted] Chat accepted by astrologer:", data);
    callback(data);
  };

  socket.on("chat_accepted", handler);
   console.log("socket chat accepted 1");
  return () => {
     console.log("socket chat accepted 2");
    socket.off("chat_accepted", handler);
  };
};

export const subscribeToChatRejected = (callback) => {
  if (!socket) return;

  const handler = () => {
    console.log("❌ [subscribeToChatRejected] Chat rejected");
    callback();
  };

  socket.on("chat_rejected", handler);

  return () => {
    socket.off("chat_rejected", handler);
  };
};

export const disconnectSocket = () => {
  if (!socket) return;
  console.log("🔌 [disconnectSocket] Disconnecting...");
  socket.disconnect();
  socket = null;
};
