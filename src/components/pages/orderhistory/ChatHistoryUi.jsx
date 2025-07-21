import { useState } from "react";
import Link from "next/link";

function ChatHistoryUi() {
  const [messages, setMessages] = useState([
    {
      text: "It is a long established fact that a reader will be distracted...",
      time: "14:39",
      isSent: false,
      isImage: false,
    },
  ]);

  const [dragOver, setDragOver] = useState(false);
  const profile = "/images/userprofile.png";

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

      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            {/* Header */}
            <div className="chat-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <img
                  src={profile}
                  alt="avatar"
                  className="rounded-circle border border-2 border-dark p-1"
                  style={{ width: "32px", height: "32px", objectFit: "cover" }}
                />
                <div className="user-info ms-2">
                  <h6 className="mb-0">Astro Name</h6>
                  <small>Balance: (05:43 mins)</small>
                  <br />
                  <small>Typing...</small>
                </div>
              </div>
              {/* <Link to="/ChatList" className="btn btn-outline-info btn-sm">
                End
              </Link> */}
            </div>

            {/* Chat Body */}
            <div className="chat-body chat-body-history">
              <div className="d-flex flex-column">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`position-relative mb-2 p-2 ${
                      message.isSent
                        ? "chat-message align-self-end bg-primary text-white"
                        : "chat-message-left align-self-start bg-light"
                    } rounded`}
                  >
                    {message.isImage ? (
                      <img
                        src={message.text}
                        alt="sent-img"
                        style={{ maxWidth: "200px", borderRadius: "10px" }}
                      />
                    ) : (
                      <p className="mb-0">{message.text}</p>
                    )}
                    <small className="d-block text-muted text-end">
                      {message.time}
                    </small>
                  </div>
                ))}
              </div>

              {/* Chat Card */}
              
            </div>
            <div className="continue-caht">
                <div className="chat-card mt-0 p-1 bg-light rounded shadow-sm">
                <div className="d-flex align-items-center">
                  <div className="me-4 text-center">
                    <img
                      src="https://aws.astrotalk.com/consultant_pic/p-107281.jpg"
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
                    />
                    <p className="bg-light text-dark text-small mb-0">★ 5</p>
                    <small className="text-muted">Kritishanti</small>
                  </div>
                  <div>
                    <p className="mb-0">
                      Hi Sujeet, let's continue this chat at price of ₹20 / 0min
                    </p>
                    <small className="text-muted">Celebrity Astrologer</small>
                  </div>
                </div>
                <button className="btn bg-theme-dark text-white mt-3">
                  Continue Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatHistoryUi;
