"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Filter from "./Filter";
import { endpoints } from "../../../../utils/config";
import LoginTabs from "../../../components/header/LoginTabs";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { fetchClient } from "../../../../utils/fetchClient";


import { subscribeToChatAccepted, initiateSocket , getRoomId} from "../../../../utils/socket";

function ChatList() {
  const router = useRouter();

  // State variables
  const [consultants, setConsultants] = useState([]); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [data, setData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 

  const [showWaitingPopup, setShowWaitingPopup] = useState(false); 
  const [astrologerAccepted, setAstrologerAccepted] = useState(false); 

  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [showModal, setShowModal] = useState(false); 
  const [showWaitingModal, setShowWaitingModal] = useState(false); 
  const [chatStatuses, setChatStatuses] = useState({}); 


  const [balance, setBalance] = useState(0); 
  const [selectedConsultant, setSelectedConsultant] = useState([]);
  const [waitTimes, setWaitTimes] = useState({});
  const [resumeChat, setResumeChat] = useState(null);


useEffect(() => {
  const stored = localStorage.getItem("ongoing_chat");
  if (stored) {
    const { astrologer } = JSON.parse(stored);
    setResumeChat(astrologer);
  }
}, []);


 useEffect(() => {
  const stored = localStorage.getItem("selected_consultants");
  if (stored) {
    console.log('storedstoredstoredstored', stored)
    try {
      setSelectedConsultant(JSON.parse(stored));
      setShowWaitingPopup(true);
    } catch (e) { console.error(e) }
  }
}, []);


useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.user?.id || user?.id;
  if (!userId) return;

  initiateSocket(userId);

  const unsub = subscribeToChatAccepted((data) => {
    console.log(" under subscribeToChatAccepted function in chat list");
    console.log('✅ Astrologer accepted the chat request:', data);

    Swal.fire({
  icon: 'success',
  title: 'Astrologer Accepted',
  text: 'You can now start chatting!',
  timer: 8000,
  showConfirmButton: false,
});

    if (data.senderId === userId) {
      setSelectedConsultant((prev) => {
        const updated = prev.map((c) =>
          c.id === data.receiverId ? { ...c, astrologerAccepted: true } : c
        );
        
        localStorage.setItem("selected_consultants", JSON.stringify(updated));
        console.log("✅ Updated selectedConsultant after astrologer accepted:", updated);
        return updated;
      });
    }
  });

  return () => unsub(); // clean up
}, []);

useEffect(() => {
  const stored = localStorage.getItem("selected_consultants");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const hasAccepted = parsed.some(c => c.astrologerAccepted);
        if (hasAccepted) {
          console.log("♻️ Restoring accepted state from localStorage");
          setSelectedConsultant(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to rehydrate consultant data:", e);
    }
  }
}, []);




  

 const updateWaitTimes = () => {
  const newTimes = {};

  if (Array.isArray(selectedConsultant)) {
    selectedConsultant.forEach((consultant) => {
      const random = Math.floor(Math.random() * 5) + 2; // 2 to 6 min
      newTimes[consultant.id] = random;
    });
  }

  setWaitTimes(newTimes);
};




  // Check if user is logged in when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);


     useEffect(() => {
  const stored = localStorage.getItem("selected_consultants");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setSelectedConsultant(parsed);
      }
    } catch (e) {
      console.error("Failed to parse stored consultants:", e);
    }
  }
}, []);

  // Toggle login modal
  const toggleModal = () => setShowModal(!showModal);

  // Generate a random wait time string like "Wait ~ 5 min"
  const getRandomWaitTime = () =>
    `Wait ~ ${Math.floor(Math.random() * 10) + 1} min`;

  // Fetch consultants from API and update wait times every 30 seconds
  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const res = await fetchClient(`${endpoints.base_url}vendors`, {
          method: "GET",
        });
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];

        setConsultants((prevConsultants) => {
          // Format each consultant's data
          const formatted = data.map((item) => {
            const prev = prevConsultants.find((c) => c.id === item.id);

            const baseCharge = item.chat_charge || 0;
            const adminCharge = item.admin_chat_charge || 0;
            const totalCharge = baseCharge + (baseCharge * adminCharge / 100);
            return {
              id: item.id,
              first_name: item.first_name,
              specialist: item.specialist,
              language: item.language,
              gender: item.gender,
              experience: `${item.experience} Years`,
              image: item.image,
              chat_charge: `₹ ${Math.round(totalCharge)}/min`,
              rating: "★★★★★",
              orders: "1000+ orders",
              is_login: item.is_login,
              celebrity: item.specialist === "Psychic" ? "Celebrity" : null,
              waitTime: item.is_login
                ? null
                : prev?.waitTime || getRandomWaitTime(),
            };
          });

          setData(formatted); // For filter use
          return formatted;
        });
      } catch (err) {
        console.error("Failed to fetch consultants", err);
      }
    };

    // Initial fetch
    fetchConsultants();

    // Interval to update wait times for offline consultants every 30 seconds
    const waitInterval = setInterval(() => {
      setConsultants((prevConsultants) => {
        return prevConsultants.map((consultant) => {
          if (consultant.is_login) return consultant; // If online, keep same
          return { ...consultant, waitTime: getRandomWaitTime() };
        });
      });
    }, 30000);

    // Interval to refresh the full consultant list from API every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchConsultants();
    }, 30000);

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(waitInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  // Fetch user balance from API and listen for login/logout events to update balance
  useEffect(() => {
    const fetchBalance = async () => {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.id || userData?.user?.id;

      if (!token || !userId) {
        setBalance(0);
        return;
      }

      try {
        const response = await fetchClient(`${endpoints.base_url}payment/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        setBalance(result.data?.amount || 0);
      } catch (error) {
        console.error("Balance fetch error:", error);
        setBalance(0);
      }
    };

    fetchBalance();

    // Update balance on user login event
    const handleLogin = () => {
      fetchBalance();
    };

    // Reset balance on logout event
    const handleLogout = () => {
      setBalance(0);
    };


   

    // Listen to login/logout custom events and storage changes (for multiple tabs)
    window.addEventListener("userLoggedIn", handleLogin);
    window.addEventListener("userLoggedOut", handleLogout);
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "user") {
        fetchBalance();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener("userLoggedIn", handleLogin);
      window.removeEventListener("userLoggedOut", handleLogout);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Function to initiate a chat request via socket
  const startChatRequest = async (consultant) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.id || user?.user?.id;

      if (!token || !userId || !consultant?.id) return;

      // Initialize socket if not already
      if (!window.socket) {
        initiateSocket(userId, consultant.id);
      }

      // Emit chat request event after small delay to ensure socket connection
      setTimeout(() => {
        window.socket.emit("request_chat", {
          senderId: userId,
          receiverId: consultant.id,
          roomId: getRoomId(userId, consultant.id)
        });
      }, 500);
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };




  // Listen for chat accepted events via socket for selected consultant
//   useEffect(() => {
//   const userData = JSON.parse(localStorage.getItem("user") || "{}");
//   const userId = userData?.id || userData?.user?.id;
//   if (!userId) return;

//   initiateSocket(userId).then(() => {
//     subscribeToChatAccepted((data) => {
//       console.log('datadatadatadata', data)
//       if (data.senderId === userId) {
//         setSelectedConsultant((prev) =>
//           prev.map((astrologer) =>
//             astrologer.id === data.receiverId
//               ? { ...astrologer, astrologerAccepted: true }
//               : astrologer
//           )
//         );
        
//       }
//     });
//   });

  
// }, []);


  // Automatically start chat request when waiting popup shows
  useEffect(() => {
    if (showWaitingPopup && selectedConsultant?.id) {
      startChatRequest(selectedConsultant);
    }
  }, [showWaitingPopup, selectedConsultant]);

  // Filter consultants by search query (case insensitive)
  const filteredConsultants = (
    filteredData.length ? filteredData : consultants
  ).filter((consultant) =>
    consultant.first_name.toLowerCase().includes(searchQuery.toLowerCase())
  );


useEffect(() => {
  if (typeof window === "undefined" || !window.socket || !window.socket.connected) return;

  const handler = ({ roomId }) => {
    console.log("✅ Chat accepted by astrologer for room:", roomId);
    setChatStatuses((prev) => ({ ...prev, [roomId]: "accepted" }));
  };

  window.socket.on("chat_accepted", handler);

  return () => {
    window.socket.off("chat_accepted", handler);
  };
}, [typeof window !== "undefined" && window.socket?.connected]);






useEffect(() => {
  if (typeof window === "undefined" || !window.socket || !window.socket.connected) return;

  const handler = ({ roomId }) => {
    console.log("✅ [Global Socket Listener] Chat accepted in room:", roomId);
  };

  window.socket.on("chat_accepted", handler);
  return () => {
    window.socket.off("chat_accepted", handler);
  };
}, [typeof window !== "undefined" && window.socket?.connected]);


  return (
    <div className="main-card-section mb-5 mt-5">
      <div className="container">

        {/* Filter/Search component */}
        <div className="row">
          <div className="col-12">
            <Filter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              data={data}
              setFilteredData={setFilteredData}
              balance={balance}
            />
          </div>
        </div>

        {/* Consultant cards */}
        <div className="row g-4">
          {filteredConsultants.map((consultant) => (
            <div className="col-12 col-sm-6 col-lg-4" key={consultant.id}>
              <div className="card border shadow-sm position-relative p-3">

                {/* Verified icon */}
                <img
                  src="https://d1gcna0o0ldu5v.cloudfront.net/fit-in/24x24/assets/images/Chat_with_astrologers/webp/tick_icon.webp"
                  alt="Verified"
                  className="position-absolute top-0 end-0 m-2"
                  width="16"
                  height="16"
                />

                {/* Consultant image and basic info */}
                <div className="d-flex align-items-center mb-1">
                  <div className="me-3">
                    <Link href={`/vendordetail/${consultant.id}`}>
                      <img
                        src={consultant.image}
                        alt={consultant.first_name}
                        className="rounded-circle border border-secondary"
                        style={{
                          width: "70px",
                          height: "70px",
                          objectFit: "cover",
                        }}
                      />
                    </Link>
                  </div>
                  <div className="text-astro">
                    <h5>{consultant.first_name}</h5>
                    <p className="mb-0 text-muted small">{consultant.specialist}</p>
                    <p className="mb-0 text-muted small">{consultant.language}</p>
                  </div>
                </div>

                {/* Ratings, experience, charge and chat button */}
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div>
                    <div className="text-warning mb-1">
                      <strong>{consultant.rating}</strong>
                      <span className="text-muted ms-2 text-12">
                        Exp: {consultant.experience}
                      </span>
                    </div>
                    <div className="fw-bold text-danger text-12">
                      {consultant.chat_charge}
                    </div>
                  </div>

                     <button
                        onClick={() => {
                          const token = localStorage.getItem("token");
                          if (!token) {
                            setShowModal(true);
                            return;
                          }

                          const chargePerMin = parseFloat(
                            consultant.chat_charge.replace(/[^\d.]/g, "")
                          );
                          const requiredBalance = chargePerMin * 2;

                          if (balance < requiredBalance) {
                            setSelectedConsultant({
                              name: consultant.first_name,
                              requiredAmount: requiredBalance,
                            });
                            setShowWaitingModal(true);
                            return;
                          }

                          // 👇 Limit check here (maximum 3 astrologers)
                          if (selectedConsultant.length >= 3) {
                            Swal.fire("Limit Reached", "You can request a maximum of 3 astrologers at once.", "warning");
                            return;
                          }

                          setSelectedConsultant((prev) => {
                          const safePrev = Array.isArray(prev) ? prev : [];
                          const updated = [...safePrev, consultant];
                          localStorage.setItem("selected_consultants", JSON.stringify(updated));
                          return updated;
                        });


                          startChatRequest(consultant);
                        }}
                        className={`btn px-3 ${
                          consultant.is_login ? "btn-outline-success" : "btn-outline-danger"
                        } btn-sm mb-1`}
                      >
                        Chat
                      </button>


                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for insufficient balance */}
        {showWaitingModal && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            aria-labelledby="waitingLabel"
            aria-hidden={!showWaitingModal}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.28)" }}
          >
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content">
                <div className="modal-body">
                  <p className="massage-text text-center">
                    Minimum balance of 2 minutes (₹
                    {selectedConsultant.requiredAmount.toFixed(2)}) is required
                    to start chat with {selectedConsultant.name}
                  </p>
                  <div className="d-flex justify-content-center">
                    <button
                      className="btn btn-outline-success m-2"
                      onClick={() => setShowWaitingModal(false)}
                    >
                      Cancel
                    </button>
                    <Link className="btn btn-outline-success m-2" href="/wallet-recharge">
                      Recharge
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for login prompt */}
        {showModal && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            aria-labelledby="loginModalLabel"
            aria-hidden={!showModal}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.28)" }}
          >
            <div className="modal-dialog modal-dialog-centered custom-modal">
              <div className="modal-content">
                <div className="modal-header custom-header-pop">
                  <h5 className="modal-title w-100 text-center" id="loginModalLabel">
                    Continue Login with Phone
                  </h5>
                  <button
                    className="btn-close btn-close-white"
                    onClick={toggleModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <LoginTabs
                    onLoginSuccess={(userData) => {
                      localStorage.clear();
                      localStorage.setItem("token", userData.token);
                      localStorage.setItem(
                        "user",
                        JSON.stringify({ ...userData, type: "user" })
                      );
                      setIsLoggedIn(true);
                      setShowModal(false);
                    }}
                  />
                  <p className="text-muted small text-center mt-3 term-policy">
                    By Signing up, you agree to our <Link href="#">Terms & Conditions</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Waiting popup shown while connecting with astrologer */}
        {selectedConsultant.length > 0 && (
        <div
          className="position-fixed d-flex justify-content-center"
          style={{
            bottom: "20px",
            left: 0,
            right: 0,
            zIndex: 1055,
            gap: "10px",
          }}
        >
          {selectedConsultant.map((consultant) => (
            <div
              key={consultant.id}
              style={{
                width: "300px",
              }}
            >
              <div className="modal-content shadow">
                <div className="modal-body p-0">
                  <div className="card d-flex flex-row align-items-center p-2">
                    
                    {/* Image + CHAT label vertically aligned */}
                    <div className="d-flex flex-column align-items-center me-3">
                      <img
                        src={consultant.image}
                        alt={consultant.first_name}
                        className="rounded-circle border border-secondary"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          marginTop: "4px",
                          color: "#007bff",
                        }}
                      >
                        CHAT
                      </span>
                    </div>

                    <div className="flex-grow-1">
                      <div className="fw-bold">{consultant.first_name}</div>
                      <div className="text-muted">{consultant.chat_charge}</div>
                      <div className="small text-secondary">
                        {consultant.astrologerAccepted
                          ? "You can now start chatting."
                          : `Wait time - ${waitTimes[consultant.id] || "..."} min`}
                        <span
                          className="ms-2 d-inline-block rounded-circle"
                          style={{
                            width: "10px",
                            height: "10px",
                            backgroundColor: consultant.astrologerAccepted
                              ? "blue"
                              : "green",
                          }}
                        ></span>
                      </div>
                    </div>

                    {consultant.astrologerAccepted ? (
                      <button
                        className="btn btn-outline-primary btn-sm ms-1"
                        onClick={() => {
                          setSelectedConsultant((prev) => {
                            const updated = prev.filter((c) => c.id !== consultant.id);
                            localStorage.setItem(
                              "selected_consultants",
                              JSON.stringify(updated)
                            );
                            return updated;
                          });

                          const existing = localStorage.getItem("ongoing_chat");

                          // Only save if not already saved for this astrologer
                          if (
                            !existing ||
                            (JSON.parse(existing)?.astrologer?.id !== consultant.id)
                          ) {
                            localStorage.setItem(
                              "ongoing_chat",
                              JSON.stringify({
                                astrologer: consultant,
                                timestamp: new Date().toISOString(),
                              })
                            );
                          }


                          router.push(`/chat/${consultant.id}`);
                        }}
                      >
                        Accept
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline-danger btn-sm ms-1"
                        onClick={() => {
                          setSelectedConsultant((prev) => {
                            const updated = prev.filter((c) => c.id !== consultant.id);
                            localStorage.setItem(
                              "selected_consultants",
                              JSON.stringify(updated)
                            );
                            return updated;
                          });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      </div>

            {resumeChat && (
            <div
              className="position-fixed d-flex justify-content-center"
              style={{
                bottom: "20px",
                left: 0,
                right: 0,
                zIndex: 1055,
              }}
            >
              <div style={{ width: "300px" }}>
                <div className="modal-content shadow">
                  <div className="modal-body p-0">
                    <div className="card d-flex flex-row align-items-center p-2">
                      {/* Image + CHAT label */}
                      <div className="d-flex flex-column align-items-center me-3">
                        <img
                          src={JSON.parse(localStorage.getItem("ongoing_chat"))?.astrologer?.image}
                          alt="astrologer"
                          className="rounded-circle border border-secondary"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            marginTop: "4px",
                            color: "#007bff",
                          }}
                        >
                          CHAT
                        </span>
                      </div>

                      {/* Astrologer details and Resume button */}
                      <div className="flex-grow-1">
                        <div className="fw-bold">
                          {JSON.parse(localStorage.getItem("ongoing_chat"))?.astrologer?.first_name}
                        </div>
                        <div className="text-muted small">
                          You have an ongoing chat session.
                        </div>
                        <div className="small text-secondary d-flex align-items-center mt-1">
                          <span className="me-2">Tap to resume</span>
                          <span
                            className="d-inline-block rounded-circle"
                            style={{
                              width: "10px",
                              height: "10px",
                              backgroundColor: "blue",
                            }}
                          ></span>
                        </div>
                      </div>

                      <button
                        className="btn btn-outline-primary btn-sm ms-1"
                        onClick={() => {
                          const chat = JSON.parse(localStorage.getItem("ongoing_chat"));
                          if (chat?.astrologer?.id) {
                            router.push(`/chat/${chat.astrologer.id}`);
                          }
                        }}
                      >
                        Resume
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

    </div>
  );
}

export default ChatList;
