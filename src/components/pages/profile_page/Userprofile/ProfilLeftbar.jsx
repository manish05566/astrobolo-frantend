import React from "react";
import Link from "next/link";
import "./leftbar.module.css";
import ProfilePhoto from "./ProfilePhoto";


function ProfilLeftbar() {
  return (
    <div className="p-4 pt-0 Sidebar">
        
      <div className="nav flex-column nav-pills leftbar">
        <div className="profile-ph-part">
            <ProfilePhoto />
        </div>
        <div className="left-menu py-3">
          <Link className="nav-link border-bottom" href="/profile">
            Personal Info 
          </Link>
          <Link className="nav-link border-bottom" href="/wallet-transation">
            Wallet Transation 
          </Link>
          <Link className="nav-link border-bottom d-flex justify-content-between align-items-center" href="/wallet-recharge">
          Wallet Recharge 
          </Link>
          
        </div>
      </div>
    </div>
  );
}

export default ProfilLeftbar;
