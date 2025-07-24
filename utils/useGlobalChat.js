import { useEffect } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import { initiateSocket, subscribeToChatAccepted } from "./socket";
import { unmarkPending } from "./chatGuard";

export default function useGlobalChat() {
  const router = useRouter();

  useEffect(() => {
    const raw = typeof window !== "undefined" && localStorage.getItem("user");
    if (!raw) return;

    const me = JSON.parse(raw);
    const userId = me.id || me.user?.id;
    if (!userId) return;

    initiateSocket(userId);

    const unsub = subscribeToChatAccepted(({ senderId, receiverId }) => {
      if (senderId !== userId) return;

      // 1) Update LS so ChatList popup flips to "Accept"
      try {
        const stored = localStorage.getItem("selected_consultants");
        if (stored) {
          const arr = JSON.parse(stored).map((c) =>
            String(c.id) === String(receiverId)
              ? { ...c, astrologerAccepted: true }
              : c
          );
          localStorage.setItem("selected_consultants", JSON.stringify(arr));
        }
      } catch {}

      // 2) Clear local "pending" flag
      unmarkPending(receiverId);

      // 3) Broadcast to any page listening
      window.dispatchEvent(
        new CustomEvent("chatAccepted", { detail: { receiverId } })
      );

      // 4) SHOW POPUP ONLY IF WE ARE *NOT* ON CHATLIST
      const isChatList =
        router.pathname === "/astrologer" || router.asPath.startsWith("/astrologer");

      if (isChatList) return; // ChatList already shows its own accept UI

      Swal.fire({
        icon: "success",
        title: "Astrologer Accepted",
        text: "Click OK to open chat",
        showCancelButton: true,
        confirmButtonText: "Open Chat",
      }).then((res) => {
        if (res.isConfirmed) {
          router.push(`/chat/${receiverId}`);
        }
      });
    });

    return () => unsub && unsub();
  }, [router]);
}
