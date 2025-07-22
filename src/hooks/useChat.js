import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import {
  initiateSocket,
  disconnectSocket,
  subscribeToMessages,
  sendMessage as emitMessage,
  getRoomId,
} from "../../utils/socket";
import { endpoints } from "../../utils/config";
import { fetchClient } from "../../utils/fetchClient";

export default function useChat(data, role, onTimeUp) {
  const router = useRouter();
  const { customerId } = router.query;

  const chatEndedRef = useRef(false);
  const endClickedRef = useRef(false);
  const latestRequestRef = useRef([]);
  const hasSentCustomerInfoRef = useRef(false);
  const hasWelcomedRef = useRef(false);
  const welcomeShownRef = useRef(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [balance, setBalance] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const senderId = currentUser?.user?.id;
  const receiverId = role === "astrologer" ? customerId : data?.id;


  

  const sendCustomerDetails = () => {
    if (hasSentCustomerInfoRef.current || role !== "customer") return;
    hasSentCustomerInfoRef.current = true;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const user = currentUser?.user || {};
    const details = `Hi, I am ${user.name || "-"}\nGender: ${user.gender || "-"}\nDOB: ${user.birth_date || "-"}`;

    const message = {
      message: details,
      time,
      isSent: true,
      sender_id: senderId,
      receiver_id: receiverId,
    };

    emitMessage(message);
  };

  const sendWelcomeMessage = () => {
  if (hasWelcomedRef.current || role !== "astrologer") return;
  hasWelcomedRef.current = true;

  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const message = {
    message: "Welcome! How can I help you today? 😊",
    time,
    isSent: true,
    sender_id: senderId,
    receiver_id: receiverId,
  };

    emitMessage(message);
};


  const [chatStartTime, setChatStartTime] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ongoing_chat");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.timestamp) {
            return new Date(parsed.timestamp);
          }
        } catch (e) {
          console.warn("Invalid chat timestamp in localStorage");
        }
      }
    }
    return new Date();
  });

  useEffect(() => {
    if (senderId && receiverId && role === "customer") {
      localStorage.setItem("ongoing_chat", JSON.stringify({ astrologer: data, timestamp: chatStartTime.toISOString() }));
    }
  }, [senderId, receiverId, chatStartTime]);





useEffect(() => {
  if (!senderId || !receiverId) return;

  const fetchMessages = async () => {
    console.log("📡 here fetch data");
    const url = `${endpoints.base_url}chat/messages?senderId=${senderId}&receiverId=${receiverId}`;
    console.log("→ fetching:", url);
    try {
      const response = await fetchClient(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("📥 response", response);
      const result = await response.json();
      console.log("📑 result", result);

     
      // 1) render the history you just fetched
    
      if (result?.status && Array.isArray(result.data)) {
        const history = result.data.map((msg) => ({
          ...msg,
          isSent: msg.sender_id === senderId,
          isImage:
            msg.isImage === true ||
            /\.(jpeg|jpg|gif|png|webp)$/i.test(msg.message),
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour:   '2-digit',
            minute: '2-digit'
          }), 
        }));
        setMessages(history);
        // cache if you still need it
        localStorage.setItem("chat_messages", JSON.stringify(history));
      }

     
      // 2) then subscribe to the gateway’s “initialMessages”
      //    (the two startup messages created by the server)
     
      window.socket.on("initialMessages", (initialMsgs) => {
        const formatted = initialMsgs.map((msg) => ({
          ...msg,
          isSent: msg.sender_id === senderId,
          isImage:
            msg.isImage === true ||
            /\.(jpeg|jpg|gif|png|webp)$/i.test(msg.message),
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour:   '2-digit',
            minute: '2-digit'
          }),
        }));
        setMessages((prev) => {
          const updated = [...prev, ...formatted];
          localStorage.setItem("chat_messages", JSON.stringify(updated));
          return updated;
        });
      });
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  // always re‑fetch on mount
  fetchMessages();

  if (role === "astrologer" && customerId) {
    markMessagesAsRead(customerId);
    refetchUnreadCount();
  }

  // cleanup the listener so we don’t double‐subscribe on re‑render
  return () => {
    window.socket.off("initialMessages");
  };
}, [senderId, receiverId, role, customerId]);






    useEffect(() => {
    if (typeof window === "undefined") return;

    const cachedMessages = localStorage.getItem("chat_messages");
    if (cachedMessages) {
      try {
        const parsed = JSON.parse(cachedMessages);
        setMessages(parsed);
      } catch (e) {
        console.error("Error parsing cached chat messages:", e);
      }
    }
  }, []);


  useEffect(() => {
    if (role !== "customer" || !senderId) return;
    const fetchBalance = async () => {
      try {
        const res = await fetchClient(`${endpoints.base_url}payment/${senderId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const result = await res.json();
        setBalance(result.data?.amount || 0);
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };
    fetchBalance();
  }, [role, senderId]);

  useEffect(() => {
    if (role === "customer" && data?.chat_charge && balance > 0 && chatStartTime) {
      const total = Math.floor((balance / data.chat_charge) * 60);
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - chatStartTime.getTime()) / 1000);
      const remaining = Math.max(total - elapsed, 0);
      setRemainingTime(remaining);
    }
  }, [data?.chat_charge, balance, role, chatStartTime]);

  useEffect(() => {
    if (remainingTime <= 0) return;
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!chatEndedRef.current) {
            chatEndedRef.current = true;
            onTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingTime]);

  const handleIncomingMessage = (message) => {
    console.log("📩 Incoming message:", message);
    const isSelfSent = message.sender_id === senderId;

    const formattedMessage = {
      ...message,
      isSent: isSelfSent,
      time: new Date(message.createdAt).toLocaleTimeString([], {
            hour:   '2-digit',
            minute: '2-digit'
          }),

          
      isImage: message.isImage === true || /\.(jpeg|jpg|gif|png|webp)$/i.test(message.message),
    };

    setMessages((prev) => {
      const updated = [...prev, formattedMessage];
      localStorage.setItem("chat_messages", JSON.stringify(updated));
      return updated;
    });


    if (!isSelfSent) {
      markMessagesAsRead(message.sender_id);
      refetchUnreadCount();
    }

    if (!welcomeShownRef.current && message.message?.includes("Welcome") && role === "customer") {
      welcomeShownRef.current = true;
    }
  };


  

  const handleEndChat = async (redirectToRecharge = false) => {
    const durationSeconds = Math.floor((new Date() - chatStartTime) / 1000);

    if (durationSeconds < 20 && endClickedRef.current && !redirectToRecharge) {
      Swal.fire("You can end the chat only after 1 minute.", "", "info");
      return;
    }

    if (chatEndedRef.current) return;
    chatEndedRef.current = true;

    localStorage.removeItem("ongoing_chat");

    if (!data) {
      console.error("Missing astrologer data while ending chat.");
      return;
    }

    const durationMinutesDecimal = durationSeconds / 60;
    const chargePerMinute = data.chat_charge || 5;
    const maxMinutes = balance / chargePerMinute;
    const finalDuration = Math.min(durationMinutesDecimal, maxMinutes);
    const totalCharge = parseFloat((finalDuration * chargePerMinute).toFixed(2));

    const token = localStorage.getItem("token");

    const payload = {
      user_id: String(senderId),
      astrologer_id: String(data.id),
      chat_id: String(data.id),
      duration_minutes: finalDuration,
      total_charge: totalCharge,
    };

    try {
      const res = await fetchClient(`${endpoints.base_url}chat/chat_transation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok || !result?.status) {
        Swal.fire("Failed to save chat transaction", "", "error");
        return;
      }

      const balanceResponse = await fetchClient(`${endpoints.base_url}payment/update-balance/${senderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: totalCharge }),
      });

      const balanceResult = await balanceResponse.json();
      if (!balanceResponse.ok || !balanceResult?.status) {
        Swal.fire("Chat saved, but balance update failed", "", "warning");
      }

      if (window?.socket) {
        window.socket.emit("end_chat_by_customer", {
          senderId,
          receiverId: data.id,
          roomId: `${getRoomId(senderId, data.id)}`,
        });
      }

      Swal.fire("Chat ended", "", "success").then(() => {
        localStorage.removeItem("chat_messages"); // ✅ clear cached messages
        router.push(redirectToRecharge ? "/wallet-recharge" : "/astrologer");
      });
    } catch (err) {
      console.error("Transaction failed", err);
      Swal.fire("Something went wrong", "", "error");
    }
  };


useEffect(() => {
  if (typeof window === "undefined" || !senderId || !receiverId) return;

  let unsubscribe;
  const roomId = getRoomId(senderId, receiverId);

  initiateSocket(senderId, receiverId)
    .then(() => {
      // 1. Subscribe to live incoming messages
      unsubscribe = subscribeToMessages(handleIncomingMessage);

      // 2. Listen for the saved “details” + “welcome” payload
      window.socket.on("initialMessages", (initialMsgs) => {
          console.log("📥 Received initialMessages:", initialMsgs);
          const transformed = initialMsgs.map((msg) => ({
          ...msg,
          isSent: msg.sender_id === senderId,
          // Use the DB‑stored timestamp instead of "new Date()"
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour:   '2-digit',
            minute: '2-digit'
          }),
          // Carry over any image flag, or detect based on URL
          isImage:
            msg.isImage === true ||
            /\.(jpeg|jpg|gif|png|webp)$/i.test(msg.message),
          }));
          // Replace your current messages with these first two
          setMessages((prev) => [...transformed, ...prev]);
          localStorage.setItem("chat_messages", JSON.stringify(transformed));
      });

      // 3. Join the room
      console.log("➡️ Emitting join_room:", roomId);
      window.socket.emit("join_room", roomId);

      // 4. Role‑based logic...
      const cached = localStorage.getItem("chat_messages");
      const isFresh = !cached || JSON.parse(cached).length === 0;

      if (role === "customer" && isFresh) {
        window.socket.on("chat_accepted", ({ receiverId }) =>
          router.push(`/chat/${receiverId}`)
        );
        window.socket.on("chat_rejected", () =>
          Swal.fire("Sorry!", "Astrologer rejected the request.", "info")
        );
      }

      if (role === "astrologer") {
        window.socket.on("request_chat", (payload) => {
          latestRequestRef.current.push(payload);
        });
        window.socket.on("chat_ended_by_customer", () => {
          localStorage.removeItem("chat_messages");
          localStorage.removeItem("ongoing_chat");
          Swal.fire("Chat ended", "The customer has ended the chat.", "info").then(() => {
            const next = latestRequestRef.current.shift();
            // if (next) {
            //   window.socket.emit("accept_chat", {
            //     senderId: next.senderId,
            //     receiverId: next.receiverId,
            //     roomId: next.roomId,
            //   });
            // }
            router.push("/vendor-requests");
          });
        });
      }
    })
    .catch((err) => console.error("Socket init failed", err));

  return () => {
    unsubscribe?.();
    window.socket.off("initialMessages");
    disconnectSocket();
  };
}, [data?.id, role, customerId, senderId, receiverId]);




  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const receiver_id = role === "astrologer" ? customerId : data?.id;
    const message = {
      message: input,
      time,
      isSent: true,
      sender_id: senderId,
      receiver_id,
    };
    setInput("");
    emitMessage(message);
  };

  const sendImageMessage = (imageUrl) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const receiver_id = role === "astrologer" ? customerId : data?.id;

    const message = {
      message: imageUrl,
      time,
      isSent: true,
      isImage: true,
      sender_id: senderId,
      receiver_id,
    };

    emitMessage(message);
  };

  const markMessagesAsRead = async (customerId) => {
    try {
      const token = localStorage.getItem("token");
      await fetchClient(`${endpoints.base_url}chat/mark-read/${customerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("\u274C Failed to mark messages as read", error);
    }
  };

  const refetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const astrologerId = currentUser?.user?.id;
      await fetchClient(`${endpoints.base_url}chat/unread-count/${astrologerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("\u274C Failed to fetch unread count", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return {
    messages,
    input,
    setInput,
    setMessages,
    sendMessage,
    sendImageMessage,
    remainingTime,
    formatTime,
    handleEndChat,
    setEndClicked: () => (endClickedRef.current = true),
  };
}
