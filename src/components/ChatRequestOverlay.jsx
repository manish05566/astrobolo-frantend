import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { cancelChatRequest } from "../../utils/socket";
import { unmarkPending } from "../../utils/chatGuard";

export default function ChatRequestOverlay() {
  const router = useRouter();
  const [pending, setPending] = useState([]);

  // load LS + subscribe to events
  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem("selected_consultants");
      setPending(raw ? JSON.parse(raw) : []);
    };
    load();

    window.addEventListener("storage", load);
    window.addEventListener("pendingUpdated", load);
    window.addEventListener("chatAccepted", load);

    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("pendingUpdated", load);
      window.removeEventListener("chatAccepted", load);
    };
  }, []);

  if (!pending.length) return null;

  return (
    <div
      className="position-fixed d-flex justify-content-center"
      style={{ bottom: 20, left: 0, right: 0, zIndex: 1055, gap: 10 }}
    >
      {pending.map((c) => (
        <div key={c.id} style={{ width: 300 }}>
          <div className="modal-content shadow">
            <div className="modal-body p-0">
              <div className="card d-flex flex-row align-items-center p-2">
                <img
                  src={c.image}
                  alt={c.first_name}
                  className="rounded-circle border border-secondary me-3"
                  style={{ width: 50, height: 50, objectFit: "cover" }}
                />
                <div className="flex-grow-1">
                  <div className="fw-bold">{c.first_name}</div>
                  <div className="text-muted">{c.chat_charge}</div>
                  <div className="small text-secondary">
                    {c.astrologerAccepted
                      ? "You can now start chatting."
                      : "Waiting for astrologer..."}
                    <span
                      className="ms-2 d-inline-block rounded-circle"
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor: c.astrologerAccepted
                          ? "blue"
                          : "green",
                      }}
                    />
                  </div>
                </div>

                {c.astrologerAccepted ? (
                  <button
                    className="btn btn-outline-primary btn-sm ms-1"
                    onClick={() => {
                      // remove from pending
                      const next = pending.filter((x) => x.id !== c.id);
                      localStorage.setItem(
                        "selected_consultants",
                        JSON.stringify(next)
                      );
                      window.dispatchEvent(new CustomEvent("pendingUpdated"));
                      unmarkPending(c.id);

                      // save ongoing
                      localStorage.setItem(
                        "ongoing_chat",
                        JSON.stringify({
                          astrologer: c,
                          timestamp: new Date().toISOString(),
                        })
                      );
                      router.push(`/chat/${c.id}`);
                    }}
                  >
                    Accept
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-danger btn-sm ms-1"
                    onClick={() => {
                      const user = JSON.parse(
                        localStorage.getItem("user") || "{}"
                      );
                      const userId = user.id || user.user?.id;
                      cancelChatRequest(userId, c.id);

                      // remove from pending
                      const next = pending.filter((x) => x.id !== c.id);
                      localStorage.setItem(
                        "selected_consultants",
                        JSON.stringify(next)
                      );
                      window.dispatchEvent(new CustomEvent("pendingUpdated"));
                      unmarkPending(c.id);
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
  );
}
