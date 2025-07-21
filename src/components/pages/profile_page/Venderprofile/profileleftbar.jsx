import React, { useEffect, useState } from "react";
import Link from "next/link";
import { endpoints } from "../../../../../utils/config";
import { fetchClient } from "../../../../../utils/fetchClient";
import { useRouter } from "next/router";
import ProfilePhoto from "./profilephoto";

function ProfilLeftbar() {
  const router = useRouter();
  const isChatPage = router.pathname === "/vendorchat";
  const [unreadCount, setUnreadCount] = useState(0);

 const fetchUnreadCount = async () => {
   const token = localStorage.getItem("token");
   const astrologerData = JSON.parse(localStorage.getItem("user"));
   const astrologerId = astrologerData?.user?.id;
   if (!astrologerId) return;

   // ✅ Stop polling if on chat page
   if (router.pathname === "/vendorchat") return;

   // ✅ Check session flag to prevent immediate re-fetch after chat
   if (sessionStorage.getItem("resetUnread") === "true") {
     sessionStorage.removeItem("resetUnread");
     return;
   }

   try {
     const res = await fetchClient(
       `${endpoints.base_url}chat/unread-count/${astrologerId}`,
       {
         method: "GET",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
         },
       }
     );
     const data = await res.json();
     if (typeof data?.data?.unreadCount === "number") {
       setUnreadCount(data.data.unreadCount);

       // Optional: Save first customerId to sessionStorage for redirect
       if (
         Array.isArray(data.data.customerIds) &&
         data.data.customerIds.length > 0
       ) {
         sessionStorage.setItem("latestCustomerId", data.data.customerIds[0]);
       }
     } else {
       console.warn("Unexpected unread count structure:", data?.data);
     }

   } catch (err) {
     console.error("Failed to fetch unread count", err);
   }
 };


  // Auto-refresh unread count every 5s
 useEffect(() => {
   if (router.pathname === "/vendorchat") {
     setUnreadCount(0);
     return;
   }

   fetchUnreadCount(); // Initial call

   const interval = setInterval(() => {
     fetchUnreadCount();
   }, 5000);

   return () => clearInterval(interval);
 }, [router.pathname]);


const handleNotificationClick = (e) => {
  e.preventDefault();
  router.push("/vendor-requests"); // just redirect to new requests page
};




  return (
    <div className="p-4 pt-0 Sidebar">
      <div className="nav flex-column nav-pills leftbar">
        <div className="profile-ph-part">
          <ProfilePhoto />
        </div>
        <div className="left-menu py-3">
          <Link href="vendor" className="nav-link border-bottom">
            Personal Info
          </Link>
          <Link href="/astrologerTransaction" className="nav-link border-bottom">
            Transaction
          </Link>
          <Link href="/vendorupload" className="nav-link border-bottom">
            Upload Documents
          </Link>
          <Link
            href="/vendor-requests"
            className="nav-link border-bottom d-flex justify-content-between align-items-center"
          >
            Notifications <span>{unreadCount}</span>
          </Link>

        </div>
      </div>
    </div>
  );
}

export default ProfilLeftbar;
