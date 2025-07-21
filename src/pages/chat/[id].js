import ChatUI from "../../components/pages/chatcustomer/chatui";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { endpoints } from "../../../utils/config";
import { fetchClient } from "../../../utils/fetchClient";
import useAuthGuard from "@/hooks/useAuthGuard";
import { isTokenExpired } from "../../../utils/auth";

const ChatCustomer = () => {
  const { id } = useRouter().query;
  const [astrologer, setAstrologer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Local check to avoid rendering while logged out
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.user.id;
    const userType = userData?.type;
    

    if (!userId || !userType) {
      console.error("Missing userId or userType");
      return;
    }
    if (!token || isTokenExpired(token)) {
      return;
    }
    if(userType === 'user'){
    if (id) {
      fetchClient(`${endpoints.base_url}vendors/${id}`)
        .then((res) => res.json())
        .then((data) => {
          const a = data?.data;
          if (!a) return;
          const formatted = {
            id: a.id,
            first_name: a.first_name,
            chat_charge: a.chat_charge,
            image: a.image || "/images/userprofile.png",
          };


          setAstrologer(formatted);
        })
        .catch((err) => console.error("Error fetching detail", err))
        .finally(() => setLoading(false));
    }
  }
  }, [id]);

  useAuthGuard(); // this will redirect if token is expired

  //console.log("astrologerrr", astrologer);
  return (
    <div className="chat-astrologer">
      <ChatUI data={astrologer} />
    </div>
  );
};

export default ChatCustomer;
