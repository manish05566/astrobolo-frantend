import React from "react";
import ProfileLeftbar from "../components/pages/profile_page/Venderprofile/profileleftbar";
import VenderProfileform from "../components/pages/profile_page/Venderprofile/uploadefile";

function vendor() {
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
                    <VenderProfileform />
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

export default vendor;
