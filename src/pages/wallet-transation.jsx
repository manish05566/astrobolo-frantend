import useAuthGuard from "@/hooks/useAuthGuard";
import WalletTransation from "../components/pages/wallet/walletTranssction";
import ProfilLeftbar from "../components/pages/profile_page/Userprofile//ProfilLeftbar.jsx";


export default function WalletPage() {

  useAuthGuard(); // protect route


  

  return (
   <div className="bg-light " style={{ marginTop: "130px" }}>
        <div className="container-fluid pb-5 pt-0">
          <div className="row">
            {/* Main Content */}
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  <div className="row g-0">
                    {/* Sidebar */}
                    <div className="col-lg-3 border-end testClass">
                      <ProfilLeftbar />
                    </div>

                    {/* Content Area */}
                    <div className="col-lg-9">
                      <WalletTransation />
                    </div>
                    {/* End Content Area */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )

  //return <WalletTransation />;
}
