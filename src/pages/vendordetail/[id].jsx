"use client";

import { useRouter } from "next/router";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import DetailAbout from "../../components/pages/chat/VenderDetail/DetailAbout";
import Rating from "../../components/pages/chat/VenderDetail/Rating";
import Reviews from "../../components/pages/chat/VenderDetail/Reviews";
import { endpoints } from "../../../utils/config";
import { fetchClient } from "../../../utils/fetchClient";
import { initiateSocket, getRoomId } from "../../../utils/socket";
import Swal from "sweetalert2";
import { isBusyWith, markPending } from "../../../utils/chatGuard";

export default function AstrologerDetail() {
  const router = useRouter();
  const { id } = useRouter().query;
  const [astrologer, setAstrologer] = useState(null);

  // 1️⃣ Load the astrologer info
  useEffect(() => {
    if (!id) return;
    fetchClient(`${endpoints.base_url}vendors/${id}`)
      .then((res) => res.json())
      .then((j) => {
        const a = j.data;
        if (!a) return;
        setAstrologer({
          id: a.id,
          first_name: a.first_name,
          specialist: a.specialist,
          language: a.language,
          experience: `${a.experience} years`,
          chat_charge: `₹ ${a.chat_charge}/min`,
          image: a.image || "/images/userprofile.png",
          bio: a.bio,
          call_min: a.call_min,
          chat_min: a.chat_min,
        });
      })
      .catch((err) => console.error("Error fetching detail", err));
  }, [id]);

  if (!astrologer) return <p>Loading…</p>;

  // 2️⃣ Fire off a chat request & then go to your ChatList
  const handleStartChat = () => {
    // 1️⃣ grab your logged‐in user
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id || user?.user?.id;
    if (!userId) {
      Swal.fire("Please log in first", "", "warning");
      return;
    }

    // 2️⃣ seed the same array that ChatList reads on mount
    if (isBusyWith(astrologer.id)) {
  Swal.fire("Already requested", "Please finish or cancel current chat first.", "info");
  return;
}

localStorage.setItem("selected_consultants", JSON.stringify([astrologer]));
markPending(astrologer.id); // 👈

    // 3️⃣ init socket & send the chat request
    initiateSocket(userId, astrologer.id);
    const roomId = getRoomId(userId, astrologer.id);
    window.socket.emit("request_chat", {
      senderId:   userId,
      receiverId: astrologer.id,
      roomId,
    });

    // 4️⃣ push to your actual ChatList page
    router.push("/astrologer"); // ← adjust this to wherever ChatList lives
  };

  return (
    <div className="detail sectiontop-margin">
      <div className="container my-4">
        {/* Profile Section */}
        <div className="Profile-section">
          <div className="row align-items-center mb-4">
            <div className="col-md-2 col-4">
              <div className="profile-img-border">
                <img
                  src={astrologer.image}
                  alt={astrologer.first_name}
                  className="profile-img"
                />
              </div>
            </div>
            <div className="col-md-6 col-8">
              <h3 className="mb-1">{astrologer.first_name}</h3>
              <p className="text-muted mb-1">{astrologer.specialist}</p>
              <p className="text-muted mb-1">{astrologer.language}</p>
              <p className="text-muted mb-1">
                Exp: {astrologer.experience}
              </p>
              <p className="text-muted mb-1">{astrologer.chat_charge}</p>
              <p className="text-muted mb-0 d-flex align-items-center">
                <span className="me-3 d-flex align-items-center">
                  <img
                    src="/images/chat-offline.webp"
                    alt="Chat"
                    width={16}
                    height={16}
                    className="me-1"
                  />
                  {astrologer.chat_min}
                </span>
                <span className="d-flex align-items-center">
                  <img
                    src="/images/call-offline.webp"
                    alt="Call"
                    width={16}
                    height={16}
                    className="me-1"
                  />
                  {astrologer.call_min}
                </span>
              </p>
            </div>

            <div className="col-md-4 col-12 mt-3 mt-md-0 text-md-start text-center">
              <button
                className="btn btn-outline-success me-2 mb-2"
                onClick={handleStartChat}
              >
                Start Chat
              </button>
              <button
                className="btn btn-outline-success mb-2"
                onClick={() => router.push("/TalkAstrologer")}
              >
                Start Call
              </button>
            </div>
          </div>

          {/* Follow Button */}
          <div className="row mb-4">
            <div className="col-12">
              <button className="btn btn-warning">Follow</button>
            </div>
          </div>
        </div>

        {/* About Me */}
        <DetailAbout bio={astrologer.bio} />

        {/* Rating & Reviews */}
        <div className="row mb-4">
          <Rating />
          <Reviews />
        </div>
      </div>
    </div>
  );
}
