import React, { useEffect, useState } from "react";
import ProfileLeftbar from "../components/pages/profile_page/Venderprofile/profileleftbar";
import { endpoints } from "../../utils/config";
import { fetchClient } from "../../utils/fetchClient";
import { useRouter } from "next/router";
import { initiateSocket, subscribeToChatRequests } from "../../utils/socket"; // adjust path if needed

function VendorRequests() {
  const [requests, setRequests] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const astrologerData = JSON.parse(localStorage.getItem("user"));
    const astrologerId = astrologerData?.user?.id;

    if (!astrologerId) return;

    initiateSocket(astrologerId, "");

    // Subscribe to live incoming chat requests
    const unsubscribe = subscribeToChatRequests((payload) => {

      // Add new request if not already present
      setRequests((prevRequests) => {
        const exists = prevRequests.some(
            (req) => req.roomId === payload.roomId
        );


        if (exists || prevRequests.length >= 5) return prevRequests;

        return [
            ...prevRequests,
            {
            customerId: payload.senderId,
            name: payload.customerName || `Customer #${payload.senderId}`,
            message: "You have a new request",
            roomId: payload.roomId,
            receiverId: payload.receiverId,
            senderId: payload.senderId,
            customerImage: payload.customerImage,
            },
        ];
        });

        console.log('')

    });

    return () => {
      unsubscribe?.();
    };
  }, []);


  // Fetch unread requests on mount
useEffect(() => {
  const fetchRequests = async () => {
    const token = localStorage.getItem("token");
    const astrologerRaw = localStorage.getItem("user");
    const astrologer = astrologerRaw ? JSON.parse(astrologerRaw) : null;
    const astrologerId = astrologer?.user?.id;
    if (!astrologerId || !token) return;

    try {
      // 1️⃣ get list of unread sender IDs
      const res = await fetchClient(
        `${endpoints.base_url}chat/unread-count/${astrologerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const body = await res.json();
      const ids = body.data?.customerIds;
      if (!Array.isArray(ids) || ids.length === 0) {
        setRequests([]); 
        return;
      }

      // 2️⃣ fetch each customer's details in parallel
      const detailed = await Promise.all(
        ids.map(async (custId) => {
          try {
            const userRes = await fetchClient(
              `${endpoints.base_url}users/${custId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const userBody = await userRes.json();
            const u = userBody.data || {};
            return {
              customerId: custId,
              name: u.first_name || `Customer #${custId}`,
              customerImage: u.image || "/images/default-user.png",
              message: "You have a new request",
              roomId: `${custId}-${astrologerId}`,
              receiverId: astrologerId,
              senderId: custId,
            };
          } catch {
            // fallback if user fetch fails
            return {
              customerId: custId,
              name: `Customer #${custId}`,
              customerImage: "/images/default-user.png",
              message: "You have a new request",
              roomId: `${custId}-${astrologerId}`,
              receiverId: astrologerId,
              senderId: custId,
            };
          }
        })
      );

      setRequests(detailed);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  fetchRequests();
}, []);




  const openChat = (customerId, customerImage) => {
    router.push({
      pathname: "/vendorchat",
      query: { customerId , customerImage},
    });
  };

  // Accept request handler
  const acceptRequest = (req) => {
    window.socket.emit("accept_chat", {
      senderId: req.senderId,
      receiverId: req.receiverId,
      roomId: req.roomId,
    });

    // Remove request from list after accepting
    setRequests((prev) => prev.filter((r) => r.roomId !== req.roomId));
    
    // Optionally, open chat immediately
    openChat(req.customerId, req.customerImage);
  };

  return (
    <div className="bg-light sectiontop-margin">
      <div className="container-fluid pb-5 pt-0">
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="row g-0">
                  {/* Sidebar */}
                  <div className="col-lg-3 border-end">
                    <ProfileLeftbar />
                  </div>

                  {/* Content */}
                  <div className="col-lg-9 p-4">
                        <h4 className="mb-4">Customer Requests</h4>

                    {requests.length === 0 ? (
                      <p>No pending requests right now.</p>
                    ) : (
                      <div className="row">
                        {requests.map((req) => (
                          <div className="col-md-3 mb-3" key={req.roomId}>
                            <div className="card d-flex flex-row align-items-center p-2">
                                <div className="waiting-img text-center">
                                <img
                                    src={req.customerImage || "/images/userprofile.png"}
                                    className="rounded-circle img-thumbnail"
                                    alt="Profile"
                                    width="40"
                                    height="40"
                                />
                                <span className="badge bg-secondary mt-1">Chat</span>
                                </div>
                                <div className="flex-grow-1 ms-2">
                                <div className="fw-bold">{req.name}</div>
                                <div className="text-muted">{req.message}</div>
                                
                                </div>
                                <button
                                className="btn btn-outline-success btn-sm ms-2"
                                onClick={() => acceptRequest(req)}
                                >
                                Accept
                                </button>
                            </div>
                        </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* End Content */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorRequests;
