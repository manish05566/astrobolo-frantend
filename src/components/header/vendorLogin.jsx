import { useState } from "react";
import { endpoints } from "../../../utils/config";
import { fetchClient } from "../../../utils/fetchClient";

const VendorLogin = ({ onVendorLoginSuccess }) => {
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorOtp, setVendorOtp] = useState("");
  const [showVendorOtp, setShowVendorOtp] = useState(false);

  const [vendorError, setVendorError] = useState("");
  const [vendorSuccessMessage, setVendorSuccessMessage] = useState("");
  const [otpSentMessageVisible, setOtpSentMessageVisible] = useState(true);

  const handleOtpFocus = () => {
    setOtpSentMessageVisible(false);
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    console.log("handleVendorSubmit triggered"); // Log when submit is triggered

    if (vendorPhone.length !== 10) {
      setVendorError("Enter a valid 10-digit number.");
      console.log("Invalid phone number length"); // Log when phone number is invalid
    } else {
      setVendorError("");
      try {
        console.log("Sending OTP request to server..."); // Log before making the API call
        const response = await fetchClient(
          `${endpoints.base_url}authVendor/send-otp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ mobile: vendorPhone }),
          }
        );

        const data = await response.json();
        console.log("OTP Response Data:", data); // Log the response data

        if (response.ok && data.status && data.data) {
          console.log("OTP sent successfully"); // Log when OTP is successfully sent
          setShowVendorOtp(true);
          setVendorError("");
          setVendorSuccessMessage(data.message || "OTP has been sent.");
        } else {
          setVendorError(data.message || "Something went wrong");
          setVendorSuccessMessage("");
          console.log("OTP request failed", data.message); // Log failure message
        }
      } catch (error) {
        setVendorError("Something went wrong. Please try again.");
        setVendorSuccessMessage("");
        console.error("Error sending OTP:", error); // Log any error during the API call
      }
    }
  };

const handleVendorOtpSubmit = async (e) => {
  e.preventDefault();
  console.log("handleVendorOtpSubmit triggered");

  const otpAsNumber = parseInt(vendorOtp, 10);

  if (vendorOtp.length !== 4) {
    setVendorError("Please enter a 4-digit OTP.");
    console.log("Invalid OTP length");
  } else {
    try {
      console.log("Sending OTP verification request to server...");
      const response = await fetchClient(
        `${endpoints.base_url}authVendor/login-with-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mobile: vendorPhone, otp: otpAsNumber }),
        }
      );

      const data = await response.json();
      console.log("OTP Verification Response Data:", data);

      if (data.status && data.data) {
        console.log("OTP verified successfully");

        // Check if the data contains the expected fields before accessing them
        if (data.data.token && data.data.refreshToken) {
           
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("refreshToken", data.data.refreshToken);
          localStorage.setItem("user", JSON.stringify(data.data.user));


           console.log("Vendor login success payload vendor login:", data.data); // 👈 Add console here

           onVendorLoginSuccess(data.data);

          setVendorError("");
        } else {
          setVendorError(
            "Unexpected response format, missing token or refresh token."
          );
          console.log("Response missing token or refreshToken");
        }
      } else {
        setVendorError(data?.message || "OTP verification failed.");
        console.log("OTP verification failed", data.message);
      }
    } catch (error) {
      setVendorError("Something went wrong. Please try again.");
      console.error("Error verifying OTP:", error);
    }
  }
};



  return (
    <div className="container mt-4">
      <div className="card p-3 custom-card">
        <div className={`modal-container ${showVendorOtp ? "" : "inert"}`}>
          {!showVendorOtp ? (
            <form onSubmit={handleVendorSubmit}>
              <p className="text-center verification-title">
                You will receive a 4 digit code for verification (Astrologer)
              </p>

              <label className="form-label mt-2">Enter your phone number</label>
              <div className="input-group mb-4">
                <span className="input-group-text">+91</span>
                <input
                  type="text"
                  className="form-control"
                  maxLength={10}
                  value={vendorPhone}
                  onChange={(e) => setVendorPhone(e.target.value)}
                  placeholder="Enter Your Mobile Number"
                />
              </div>

              {vendorError && <p className="text-danger">{vendorError}</p>}

              <div className="text-center">
                <button type="submit" className="btn w-100 custom-btn">
                  GET OTP
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVendorOtpSubmit}>
              {otpSentMessageVisible && vendorSuccessMessage && (
                <p className="text-success">{vendorSuccessMessage}</p>
              )}

              <label className="form-label mt-2">Enter OTP</label>
              <input
                type="text"
                className="form-control mb-3"
                value={vendorOtp}
                maxLength={4}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  if (value.length <= 4) {
                    setVendorOtp(value);
                  }
                }}
                placeholder="Enter OTP"
                onFocus={handleOtpFocus}
              />

              {vendorError && <p className="text-danger">{vendorError}</p>}

              <div className="text-center">
                <button
                  type="submit"
                  className="btn w-100 custom-btn custom-btn-login"
                >
                  Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
