"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { endpoints } from "../../../utils/config";
import { initiateSocket, getRoomId } from "../../../utils/socket";
import Swal from "sweetalert2";

import { fetchClient } from "../../../utils/fetchClient";

function ChatHistoryUi() {
  const router = useRouter();
  const { userId, astrologerId } = router.query;
  const [messages, setMessages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [userName, setUserName] = useState("");
  const [chatDurtion, setChatDurtion] = useState("");
  const profile = "/images/userprofile.png";

  

  useEffect(() => {
    const fetchChatData = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

  const parsedData = JSON.parse(storedUser);
      const { type, user } = parsedData;
      const activeUser = type === "user" ? user : user;
      if (activeUser) {
        setUserName(activeUser.name);
      }
      
      if (!userId || !astrologerId || !token) return;

      try {
        const res = await fetchClient(`${endpoints.base_url}chat/conversations?userId=${userId}&astrologerId=${astrologerId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        const chatData = data?.data;
        console.log('chatData', chatData)

        if (!chatData || !Array.isArray(chatData)) return;

        const formatted = chatData.map((msg) => ({
        text: msg.message,
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isSent: msg.sender_id === userId,
        isImage: msg.message_type === "image" || /\.(jpeg|jpg|gif|png|webp)$/i.test(msg.message),
      }));


        setMessages(formatted);
        setChatDurtion(chatData.chat_transaction)

        const firstVendor = chatData.find((msg) => msg.astrologer);
        if (firstVendor?.astrologer) setVendor(firstVendor.astrologer);
      } catch (err) {
        console.error("Error fetching chat detail", err);
      }
    };

    fetchChatData();
  }, [userId, astrologerId]);


//   const handleContinueChat = () => {
//   const userRaw = localStorage.getItem("user");
//   if (!userRaw) {
//     Swal.fire("Please log in first", "", "warning");
//     return;
//   }
//   const u = JSON.parse(userRaw);
//   const userId = u.id || u.user?.id;
//   // seed ChatList
//   localStorage.setItem("selected_consultants", JSON.stringify([vendor]));
//   // fire socket request
//   initiateSocket(userId, vendor.id)
//     .then(() => {
//       const roomId = getRoomId(userId, vendor.id);
//       window.socket.emit("request_chat", {
//         senderId: userId,
//         receiverId: vendor.id,
//         roomId,
//       });
//     })
//     .catch(console.error);
//   // navigate into your ChatList
//   router.push("/astrologer"); // or wherever ChatList lives
// };

// 2️⃣ Fire off a chat request & then go to your ChatList
  const handleStartChata = () => {
    // 1️⃣ grab your logged‐in user
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id || user?.user?.id;
    if (!userId) {
      Swal.fire("Please log in first", "", "warning");
      return;
    }

    // 2️⃣ seed the same array that ChatList reads on mount
    localStorage.setItem(
      "selected_consultants",
      JSON.stringify([vendor])
    );

    // 3️⃣ init socket & send the chat request
    initiateSocket(userId, vendor.id);
    const roomId = getRoomId(userId, vendor.id);
    window.socket.emit("request_chat", {
      senderId:   userId,
      receiverId: vendor.id,
      roomId,
    });

    // 4️⃣ push to your actual ChatList page
    router.push("/astrologer"); // ← adjust this to wherever ChatList lives
  };


  const getCurrentTime = () => {
    const currentDate = new Date();
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMessages((prev) => [
            ...prev,
            {
              text: reader.result,
              time: getCurrentTime(),
              isSent: true,
              isImage: true,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  return (
  <div
    className="chat-bg"
    onDragOver={(e) => {
      e.preventDefault();
      setDragOver(true);
    }}
    onDragLeave={() => setDragOver(false)}
    onDrop={handleDrop}
    style={{ position: "relative" }}
  >
    {dragOver && (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontSize: "1.5rem",
        }}
      >
        Drop image here to send
      </div>
    )}

    {/* Tab header */}
    <div className="container " style={{ marginTop: "130px" }}>
      <ul className="nav nav-pills nav-justified mb-4" id="Chathistory" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className="nav-link active"
            id="pills-chat-tab"
            data-bs-toggle="pill"
            data-bs-target="#pills-chat"
            type="button"
            role="tab"
            aria-controls="pills-chat"
            aria-selected="false"
          >
            Chat
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link "
            id="pills-call-tab"
            data-bs-toggle="pill"
            data-bs-target="#pills-call"
            type="button"
            role="tab"
            aria-controls="pills-call"
            aria-selected="true"
          >
            Call
          </button>
        </li>
      </ul>
    </div>

    <div className="container " >
      <div className="row justify-content-center">
        <div className="col-lg-9">
          {/* Header */}
          <div className="chat-header d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <img
                src={vendor?.image || profile}
                alt="avatar"
                className="rounded-circle border border-2 border-dark p-1"
                style={{ width: "32px", height: "32px", objectFit: "cover" }}
              />
              <div className="user-info ms-2">
                <h6 className="mb-0">{vendor?.first_name || "Astro Name"}</h6>
                {/* <small>Duration: {chatDurtion}</small> */}
                <small>Chat has ended</small>
              </div>
            </div>
          </div>

          {/* Chat Body */}
          <div className="chat-body chat-body-history d-flex flex-column">
            <div className="d-flex flex-column flex-grow-1 mb-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`position-relative mb-2 p-2 shadow-sm rounded ${
                    message.isSent ? "chat-bubble-sent" : "chat-bubble-received"
                  }`}
                >
                  {message.isImage ? (
                    <img
                      src={message.text}
                      alt="sent-img"
                      style={{ maxWidth: "200px", borderRadius: "10px" }}
                    />
                  ) : (
                    <p className="mb-1">{message.text}</p>
                  )}
                  <small className="d-block text-end text-muted">
                    {message.time}
                  </small>
                </div>
              ))}
            </div>

            {/* Continue Chat Box */}
            <div
              className="chat-card p-3 bg-white rounded shadow-sm"
              style={{
                margin: "auto",
                maxWidth: "480px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
              }}
            >
              <div className="d-flex align-items-center">
                <div className="me-3 text-center">
                  <img
                    src={vendor?.image || profile}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                  <p className="text-dark mb-0 mt-1">★ 5</p>
                  <small className="text-muted">{vendor?.first_name || "Kritishanti"}</small>
                </div>
                <div>
                  <p className="mb-0" style={{ fontSize: "15px" }}>
                    Hi {userName}, let's continue this chat at price of ₹{vendor?.total_charge || 20} / min
                  </p>
                  <small className="text-muted">Celebrity Astrologer</small>
                </div>
              </div>

              <div className="d-flex justify-content-center mt-3">
                <button
                  className="btn text-white"
                  style={{
                    backgroundColor: "#81689D",
                    borderRadius: "6px",
                    fontWeight: 500,
                    padding: "6px 20px",
                  }}
                  onClick={handleStartChata}
                >
                  Continue Chat
                </button>
              </div>
            </div>
            {/* End Continue Chat */}
          </div>
        </div>
      </div>
    </div>
  </div>
);

}

export default ChatHistoryUi;
