import AstrologerChatUI from "../components/pages/chatastrologer/chatui";
import ProfileLeftbar from "../components/pages/profile_page/Venderprofile/profileleftbar";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { endpoints } from "../../utils/config";
import { fetchClient } from "../../utils/fetchClient";
import useAuthGuard from "@/hooks/useAuthGuard";
import { isTokenExpired } from "../../utils/auth";

export default function VendorChatPage() {
  const { id } = useRouter().query;
  const [astrologer, setAstrologer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Local check to avoid rendering while logged out
  useEffect(() => {
    const token = localStorage.getItem("token");
    const astrologerData = JSON.parse(localStorage.getItem("user"));
    const AstrologerId = astrologerData?.user.id;
    const astrologerType = astrologerData?.type;

   

    if (!AstrologerId || !astrologerType) {
      console.error("Missing AstrologerId or astrologerType");
      return;
    }
    if (!token || isTokenExpired(token)) {
      return;
    }
    if (astrologerType === "vendor") {
      if (AstrologerId) {
        fetchClient(`${endpoints.base_url}vendors/${AstrologerId}`)
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

  return (
    <div className="bg-light sectiontop-margin">
      <div className="container-fluid pb-5 pt-0">
        <div className="row">
          {/* Main Content */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="row g-0">
                  {/* Sidebar */}
                  <div className="col-lg-3 border-end">
                    <ProfileLeftbar />
                  </div>

                  {/* Content Area */}
                  <div className="col-lg-9">
                    <AstrologerChatUI data={astrologer} />
                  </div>
                  {/* End Content Area */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
