import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProfileLeftbar from "../components/pages/profile_page/Venderprofile/profileleftbar";
import { endpoints } from "../../utils/config";
import { fetchClient } from "../../utils/fetchClient";
import { initiateSocket, subscribeToChatRequests } from "../../utils/socket";

function VendorRequests() {
  const [requests, setRequests] = useState([]);
  const router = useRouter();

  // ―――――――――――――――――
  // 0️⃣ Rehydrate saved requests on mount
  useEffect(() => {
    const raw = localStorage.getItem("vendor_requests");
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) {
          setRequests(arr);
        }
      } catch (e) {
        console.error("Failed to parse saved requests:", e);
      }
    }
  }, []);
  // ―――――――――――――――――

  // Live socket incoming
  useEffect(() => {
    const astrologerData = JSON.parse(localStorage.getItem("user"));
    const astrologerId = astrologerData?.user?.id;
    if (!astrologerId) return;

    initiateSocket(astrologerId, "");
    const unsubscribe = subscribeToChatRequests((payload) => {
      setRequests((prev) => {
        if (prev.some((r) => r.roomId === payload.roomId) || prev.length >= 5) {
          return prev;
        }
        const next = [
          ...prev,
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
        localStorage.setItem("vendor_requests", JSON.stringify(next));
        return next;
      });
    });

    return () => unsubscribe?.();
  }, []);

  // Fetch unread‐count on mount
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
          // leave whatever we rehydrated
          return;
        }

        // 2️⃣ fetch each customer's details
        const detailed = await Promise.all(
          ids.map(async (custId) => {
            const roomId = `${custId}-${astrologerId}`;
            try {
              const userRes = await fetchClient(
                `${endpoints.base_url}users/${custId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const u = (await userRes.json()).data || {};
              return {
                customerId: custId,
                name: u.first_name || `Customer #${custId}`,
                customerImage: u.image || "/images/default-user.png",
                message: "You have a new request",
                roomId,
                receiverId: astrologerId,
                senderId: custId,
              };
            } catch {
              return {
                customerId: custId,
                name: `Customer #${custId}`,
                customerImage: "/images/default-user.png",
                message: "You have a new request",
                roomId,
                receiverId: astrologerId,
                senderId: custId,
              };
            }
          })
        );

        setRequests(detailed);
        localStorage.setItem("vendor_requests", JSON.stringify(detailed));
      } catch (err) {
        console.error("Failed to fetch requests", err);
      }
    };

    fetchRequests();
  }, []);

  const openChat = (customerId, customerImage) => {
    router.push({
      pathname: "/vendorchat",
      query: { customerId, customerImage },
    });
  };

  const acceptRequest = (req) => {
    window.socket.emit("accept_chat", {
      senderId: req.senderId,
      receiverId: req.receiverId,
      roomId: req.roomId,
    });
    // remove and persist
    setRequests((prev) => {
      const next = prev.filter((r) => r.roomId !== req.roomId);
      localStorage.setItem("vendor_requests", JSON.stringify(next));
      return next;
    });
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
                  <div className="col-lg-3 border-end">
                    <ProfileLeftbar />
                  </div>
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
