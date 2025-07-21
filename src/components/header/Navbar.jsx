import React, { useState, useEffect } from "react"; // Make sure useEffect 
import Link from "next/link";
import LoginTabs from "./LoginTabs";
import VendorLogin from "./vendorLogin";
import { useRouter } from "next/router";
import { endpoints } from "../../../utils/config";
import { fetchClient } from "../../../utils/fetchClient";
//import "./navbar.css";

const Navbar = () => {

  const router = useRouter();

  const [showNavbar, setShowNavbar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [vendorShowModal, setVendorShowModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userMobile, setUserMobile] = useState("");
  const [userType, setUserType] = useState(null);


  const logo = "/images/logo.png";
  const profile = "/images/userprofile.png";
  const user = "/images/userprofile.png";


   const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState(0);
  
    useEffect(() => {
      const fetchWalletData = async () => {
        const token = localStorage.getItem("token");
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = userData?.user?.id;
  
        if (!token || !userId) return;
  
        try {
          const res = await fetchClient(`${endpoints.base_url}payment/${userId}/transactions`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          const json = await res.json();
  
          if (json.status && json.data) {
            setBalance(json.data.balance || 0);
            setTransactions(json.data.transactions || []);
          } else {
            setBalance(0);
            setTransactions([]);
          }
        } catch (err) {
          console.error("Failed to fetch wallet data", err);
          setBalance(0);
          setTransactions([]);
        }
      };
  
      fetchWalletData();
    }, []);

  // Function to toggle the modal visibility
  const toggleModal = () => {
    setShowModal(!showModal);
  };

   const vendorToggleModal = () => {
     setVendorShowModal(!vendorShowModal);
   };


  useEffect(() => {
  const openVendorLogin = () => {
    setVendorShowModal(true);
  };

  // Listen for custom event
  window.addEventListener("openVendorLoginModal", openVendorLogin);

  // Cleanup
  return () => {
    window.removeEventListener("openVendorLoginModal", openVendorLogin);
  };
}, []);

   

useEffect(() => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  //const storedData = storedUser || storedVendor;

  if (token && storedUser) {
    try {
      const parsedData = JSON.parse(storedUser);
      const { type, user } = parsedData;

      setIsLoggedIn(true);
      setUserType(type);

      const activeUser = type === "user" ? user : user;

      if (activeUser) {
        setUserName(activeUser.name);
        setUserMobile(activeUser.mobile);
      }
    } catch (error) {
      console.error("Failed to parse stored data from localStorage", error);
    }
  }
}, []);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const handleLogout = () => {
    // Get user type BEFORE removing from localStorage
    const storedUser = localStorage.getItem("user");
    let type = null;

    try {
      if (storedUser) {
        const parsedData = JSON.parse(storedUser);
        type = parsedData.type;
      }
    } catch (error) {
      console.error("Error parsing user data during logout:", error);
    }

    // Now clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userLoggedOut"));

    setIsLoggedIn(false);
    setUserName("");
    setUserMobile("");
    setUserType(null);

    // Redirect based on user type and current path
    if (type === "vendor") {
      console.log("Redirecting vendor");
      if (
        router.pathname === "/vendor" ||
        router.pathname === "/vendorupload"
      ) {
        router.push("/");
      }
    } else if (type === "user") {
      console.log("Redirecting user");
      if (
        router.pathname === "/profile" ||
        router.pathname.startsWith("/chat/")
      ) {
        router.push("/");
      }
    }
  };


  return (
    <div className={`main-header ${scrolled ? "App-header" : ""}`}>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top my-hearder p-0 ">
        <div className="container-fluid px-4 top-menu my-top-header">
          {/* Logo */}

          {/* Hamburger Menu (Mobile) */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setShowNavbar(!showNavbar)}
            aria-controls="navbarNav"
            aria-expanded={showNavbar}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navbar Content */}
          <div
            className={`collapse navbar-collapse ${showNavbar ? "show" : ""}`}
            id="navbarNav"
          >
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <Link className="nav-link" href="/profile">
                  Free Kundli
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/vendor">
                  Kundli Matching
                </Link>
              </li>
              {/* <li className="nav-item">
                <button onClick={vendorToggleModal} className="nav-link">
                  Vendor Login
                </button>
              </li> */}
              <li className="nav-item">
                <select className="form-select form-select-sm">
                  <option value="">Choose a country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                </select>
              </li>
              {!isLoggedIn ? (
                <li className="nav-item me-2">
                  <button onClick={toggleModal} className="btn px-4 py-2 ms-2">
                    Login
                  </button>
                </li>
              ) : (
                <li className="nav-item dropdown">
  <div
    className="d-flex align-items-center"
    id="profileDropdown"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    <img
      src={profile}
      alt="avatar"
      className="rounded-circle border border-2 border-dark p-1"
      style={{ width: "32px", height: "32px", objectFit: "cover" }}
    />
  </div>
  <ul
    className="dropdown-menu dropdown-menu-end shadow p-3"
    aria-labelledby="profileDropdown"
  >
    <li className="dropdown-item text-center profile-icon">
      <img
        src={user}
        alt="Profile"
        className="rounded-circle mx-auto d-block mb-2"
        style={{ width: "72px", height: "72px" }}
      />
      <Link
        href={userType === "vendor" ? "/vendor-requests" : "/wallet-transation"}
        className="d-block"
      >
        {userName || (userType === "vendor" ? "Astrologer" : "User")}
      </Link>
      <p className="text-muted small mb-0">
        {userMobile || "**********"}
      </p>
    </li>
    <li>
      <hr className="dropdown-divider" />
    </li>

    {userType === "user" && (
      <>
        <li className="dropdown-item d-flex justify-content-between align-items-center">
          <Link href="/wallet-transation">Wallet</Link>
          <span className="text-success">₹ {balance}</span>
        </li>
        <li>
          <Link className="dropdown-item" href="/customerOrderHistory">
            Order History
          </Link>
        </li>
      </>
    )}

    <li>
      <Link className="dropdown-item" href="/customer-support">
        Customer Support Chat
      </Link>
    </li>
    <li>
      <button
        className="dropdown-item w-100 text-start"
        onClick={handleLogout}
      >
        Logout
      </button>
    </li>
  </ul>
</li>

              )}
            </ul>
          </div>
        </div>
        {/* Secondary Menu */}
        <div className="container-fluid px-4 justify-content-between main-menu">
          <Link className="navbar-brand" href="/">
            <img
              src={logo}
              alt="Logo"
              className="img-fluid"
              style={{ height: "40px" }}
            />
          </Link>

          <ul className="nav">
            <li className="nav-item">
              <Link className="nav-link " href="/astrologer">
                Chat With Astrologer
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link " href="/TalkAstrologer">
                Talk to Astrologer
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link " href="/Book-Pooja">
                Book a Pooja New
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link " href="/Astromall">
                Astromall
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link " href="/Astrotalk-Store">
                Astrotalk Store
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link " href="/Blog">
                Blog
              </Link>
            </li>
          </ul>
        </div>

        {/* Login Modal */}
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
                  <h5
                    className="modal-title w-100 text-center"
                    id="loginModalLabel"
                  >
                    Continue Login with Phone
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={toggleModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <LoginTabs
                    onLoginSuccess={(userData) => {
                      localStorage.clear(); // Clear existing session
                      localStorage.setItem("token", userData.token);
                      localStorage.setItem(
                        "user",
                        JSON.stringify({ ...userData, type: "user" })
                      );
                      setIsLoggedIn(true);
                      setUserType("user");
                      setUserName(userData.name);
                      setUserMobile(userData.mobile);
                      setShowModal(false);
                    }}
                  />

                  <p className="text-muted small text-center mt-3 term-policy">
                    By Signing up, you agree to our
                    <Link href="#"> Terms of </Link> Use{" "}
                    <Link href="#" className="me-1">
                      and Privacy
                    </Link>
                    Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vendor Modal */}
        {vendorShowModal && (
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
                  <h5
                    className="modal-title w-100 text-center"
                    id="loginModalLabel"
                  >
                    Continue Login with Phone
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={vendorToggleModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <VendorLogin
                    onVendorLoginSuccess={(vendorData) => {
                      console.log("Vendor login success data:", vendorData);
                      const { token, refreshToken, user } = vendorData;
                       
                      console.log("Vendor login token:", token);
                      console.log("Vendor login token:", refreshToken);
                      console.log("Vendor login token:", user);
                      localStorage.clear();
                      localStorage.setItem("token", token);
                      localStorage.setItem("refreshToken", refreshToken);
                      localStorage.setItem(
                        "user",
                        JSON.stringify({ user, type: "vendor" })
                      );

                      setIsLoggedIn(true);
                      setUserType("vendor");
                      setUserName(user.name || "Vendor"); // fallback if name is null
                      setUserMobile(user.mobile);
                      setVendorShowModal(false);
                    }}
                  />

                  <p className="text-muted small text-center mt-3 term-policy">
                    By Signing up, you agree to our
                    <Link href="#"> Terms of </Link> Use{" "}
                    <Link href="#" className="me-1">
                      and Privacy
                    </Link>
                    Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
