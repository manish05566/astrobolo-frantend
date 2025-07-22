import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Send, Smile } from "lucide-react";
import { useRouter } from "next/router";
import useChat from "../../../hooks/useChat";
import Swal from "sweetalert2";
import { endpoints } from "../../../../utils/config";
import { fetchClient } from "../../../../utils/fetchClient";

function AstrologerChatUI({ data }) {
  const router = useRouter();
  const {
    messages,
    input,
    setInput,
    sendMessage,
    formatTime,
    remainingTime,
  } = useChat(data, "astrologer");

  const messagesEndRef = useRef(null);
  const customerImage = router.query.customerImage || "/images/userprofile.png";


  useEffect(() => {
  if (typeof window !== "undefined" && window.socket) {
    window.socket.on("chat_ended_by_customer", (payload) => {
      console.log("✅ Chat ended. Ready for next request.", payload);
    });
    return () => {
      window.socket.off("chat_ended_by_customer");
    };
  }
}, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const markMessagesAsRead = async () => {
      try {
        const token = localStorage.getItem("token");
        if (data?.id && token) {
          await fetchClient(`${endpoints.base_url}chat/mark-read/${data.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          sessionStorage.removeItem("fromNotif");
        }
      } catch (err) {
        console.error("Failed to mark messages as read", err);
      }
    };

    markMessagesAsRead();
  }, [data]);


  // Extract customer name from first customer message if available
let customerName = "customer";
if (messages.length) {
  const customerMsg = messages.find(msg => !msg.isSent);
  if (customerMsg?.message?.startsWith("Hi, I am ")) {
    customerName = customerMsg.message.split("\n")[0].replace("Hi, I am ", "");
  }
}


  return (
    <div className="chat-bg">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="chat-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <img
                  src={customerImage}
                  alt="avatar"
                  className="rounded-circle border border-2 border-dark p-1"
                  style={{ width: "32px", height: "32px", objectFit: "cover" }}
                />
                <div className="user-info ms-2">
                  <h6 className="mb-0">{customerName}</h6>

                  <small>Balance: ({formatTime(remainingTime)} mins)</small>
                  <br />
                  <small>Chat in progress.</small>
                </div>
              </div>
            </div>

            <div className="chat-body">
              <div className="d-flex flex-column">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-2 ${
                      message.isSent
                        ? "chat-message align-self-end"
                        : "chat-message-left align-self-start"
                    } rounded`}
                  >
                    {message.isImage ? (
                      <img
                        src={message.message}
                        alt="sent"
                        style={{ maxWidth: "200px", borderRadius: "10px" }}
                      />
                    ) : (
                      <p className="mb-0">{message.message}</p>
                    )}
                    <small className="d-block text-muted text-end text-offwhite">
                      {message.time}
                    </small>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="chat-footer">
              <div className="input-group">
                <span className="input-group-text">
                  <Smile className="icon" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="btn btn-primary" onClick={sendMessage}>
                  <Send className="icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AstrologerChatUI;
