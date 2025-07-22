import Link from "next/link";
import { Send, Smile, Camera } from "lucide-react";
import useChat from "../../../hooks/useChat";
import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { endpoints } from "../../../../utils/config";
import { fetchClient } from "../../../../utils/fetchClient";

function CustomerChatUi({ data }) {
  const {
    messages,
    input,
    setInput,
    balance,
    remainingTime,
    formatTime,
    sendMessage,
    sendImageMessage,
    handleEndChat,
    setEndClicked,
  } = useChat(data, "customer", () => {
    Swal.fire("Your chat balance has ended", "", "info");
    handleEndChat(true);
  });

  const profile = "/images/userprofile.png";
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);


  


  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const hasRefreshed = url.searchParams.get("r");
    if (!hasRefreshed) {
      url.searchParams.set("r", "1");
      window.location.replace(url.toString());
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetchClient(`${endpoints.base_url}chat/upload-image`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Image upload failed: ${errorText}`);
        }

        const result = await res.json();
        const imageUrl = `${endpoints.base_url.replace(/\/$/, "")}/${result?.url.replace(/^\//, "")}`;
        sendImageMessage(imageUrl);
      } catch (error) {
        console.error(error);
        Swal.fire("Upload Failed", error.message, "error");
      }
    }
  };

  return (
    <div className="chat-bg">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-9" style={{ marginTop: "122px" }}>
            <div className="chat-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <img
                  src={data?.image || profile}
                  alt="avatar"
                  className="rounded-circle border border-2 border-dark p-1"
                  style={{ width: "32px", height: "32px", objectFit: "cover" }}
                />
                <div className="user-info ms-2">
                  <h6 className="mb-0">{data?.first_name}</h6>
                  <small>Balance: ({formatTime(remainingTime)} mins)</small><br />
                  <small>Chat in progress.</small>
                </div>
              </div>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setEndClicked();
                  handleEndChat(false);
                }}
                className="btn btn-outline-info btn-sm"
              >
                End
              </Link>
            </div>

            <div className="chat-body">
              <div className="d-flex flex-column">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-2 ${
                      message.isSent ? "chat-message align-self-end" : "chat-message-left align-self-start"
                    } rounded`}
                  >
                    {message.isImage ? (
                      <img src={message.message} alt="sent" style={{ maxWidth: "200px", borderRadius: "10px" }} />
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
                <button className="btn btn-light" onClick={() => fileInputRef.current.click()}>
                  <Camera className="icon" />
                </button>
                <button className="btn btn-primary" onClick={sendMessage}>
                  <Send className="icon" />
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerChatUi;
