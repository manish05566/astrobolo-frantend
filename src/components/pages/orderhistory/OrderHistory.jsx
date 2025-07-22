import React, { useEffect, useState } from "react";
import Link from "next/link";
import { endpoints } from "../../../../utils/config";
import { fetchClient } from "../../../../utils/fetchClient";
const user = "/images/userprofile.png";




function OrderHistory() {


const [conversation, setConversation] = useState([]);

useEffect(() => {
  const fetchConversationData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.user?.id;

      if (!token || !userId) return;

      const res = await fetchClient(`${endpoints.base_url}chat/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      console.log('jsonnnnnnn', json)

      setConversation(json.status ? json.data || [] : []);
    } catch (err) {
      console.error("❌ Failed to fetch conversation data", err);
      setConversation([]);
    }
  };

  fetchConversationData();
}, []);


  return (
    <div className="sectopn-m-top mb-5">
      <div className="container mt-4">
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

        <div className="tab-content" id="ChathistoryContent">
          {/* Call Tab */}
          <div className="tab-pane fade " id="pills-call" role="tabpanel" aria-labelledby="pills-call-tab">
            <div className="row">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div className="col-md-3" key={item}>
                  <div className="card mb-3">
                    <Link href={`/customerChatConversations/`} passHref legacyBehavior>
                      <a className="text-decoration-none text-dark">
                        <div className="card-body chathistory">
                          <div className="d-flex justify-content-between align-items-top mb-2">
                            <p className="card-title">Order Id #174611510480</p>
                            <p className="mb-1 text-danger text-decoration-none">HELP</p>
                          </div>
                          <div className="d-flex justify-content-between align-items-top">
                            <div className="text-center">
                              <p className="mb-1"><strong>Kritishanti</strong></p>
                              <p className="text-muted mb-1">01 May 25, 09:28 PM</p>
                              <p className="text-success mb-1">Completed</p>
                              <p className="mb-1">Chat type: Free session</p>
                              <p className="mb-1">Rate: ₹0/min</p>
                              <p className="mb-1">Duration: 2 minutes</p>
                              <p className="mb-1">Deduction: ₹0</p>
                            </div>
                            <div className="text-center">
                              <img src={user} alt="Profile" className="rounded-circle" />
                              <p className="text-center mt-2 text-danger font-small">₹20/min</p>
                              <button className="btn px-3 btn-outline-success btn-sm mb-1">Call</button>
                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Tab */}
          <div className="tab-pane fade show active" id="pills-chat" role="tabpanel" aria-labelledby="pills-chat-tab">
            <div className="row">
              {conversation.length === 0 ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 250, width: "100%" }}>
                <div className="text-center w-100 text-muted fs-5">
                    No previous conversations found.
                </div>
                </div>
                ) : (
                
                 conversation.map((item, index) => (
                    
                    <div className="col-md-3" key={index}>
                        <div className="card mb-3">
                    <Link href={{
                        pathname: "/customerChatConversations",
                        query: { userId: item.user_id, astrologerId: item.astrologer.id },
                      }} passHref legacyBehavior>
                        <a className="text-decoration-none text-dark">
                        <div className="card-body chathistory">
                        <div className="d-flex justify-content-between align-items-top mb-2">
                        <p className="card-title">Order ID: #{item.id}</p>
                        <p className="mb-1 text-danger text-decoration-none">HELP</p>
                        </div>
                        <div className="d-flex justify-content-between align-items-top">
                        <div className="text-center">
                            <p className="mb-1"><strong>{item.astrologer?.first_name}</strong></p>
                            <p className="text-muted mb-1">{new Date(item.createdAt).toLocaleString()}</p>
                            <p className="text-success mb-1">{item.status}</p>
                            {(() => {
                            const base = item.astrologer?.chat_charge || 0;
                            
                            const admin = item.astrologer?.admin_chat_charge || 0;
                            const total = Math.round(base + (base * admin / 100));
                            
                            return (
                                <p className="mb-1">Rate: ₹{total}/min</p>
                            );
                            })()}
                            <p className="mb-1">Duration: {item.duration_minutes} mins</p>
                            <p className="mb-1">Deduction: ₹{item.total_charge}</p>
                        </div>
                        <div className="text-center">
                            <img src={item.astrologer?.image || user} alt="Profile" className="rounded-circle" />

                             {(() => {
                                const base = item.astrologer?.chat_charge || 0;
                                const admin = item.astrologer?.admin_chat_charge || 0;
                                const total = Math.round(base + (base * admin / 100));
                                return (
                                <p className="text-center mt-2 text-danger font-small">₹{total}/min</p>
                                );
                            })()}
                            <button className="btn px-3 btn-outline-success btn-sm mb-1">Chat</button>
                        </div>
                        </div>
                    </div>
                    </a>
                </Link>
                </div>
            </div>

             ))
            )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderHistory;
