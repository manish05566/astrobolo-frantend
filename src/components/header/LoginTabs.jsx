import { useState } from "react";
import { endpoints } from "../../../utils/config";
//import styles from "./LoginTabs.module.css"; 
import { fetchClient } from "../../../utils/fetchClient";


const LoginTabs = ({ onLoginSuccess }) => {

  // Customer State
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerOtp, setCustomerOtp] = useState("");
  const [showCustomerOtp, setShowCustomerOtp] = useState(false);

  const [customerError, setCustomerError] = useState("");
  const [customerSuccessMessage, setCustomerSuccessMessage] = useState("");
  const [otpSentMessageVisible, setOtpSentMessageVisible] = useState(true); // State to track OTP sent message visibility

  const handleOtpFocus = () => {
      // Hide OTP sent message when OTP field is clicked
      setOtpSentMessageVisible(false);
    };
  

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();

    if (customerPhone.length !== 10) {
      setCustomerError("Enter a valid 10-digit number.");
    } else {
      setCustomerError("");

      try {
        const response = await fetchClient(`${endpoints.base_url}auth/send-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mobile: customerPhone }),
        });

        const data = await response.json();
        console.log("Response data:", data);

        if (response.ok && data.status && data.data) {
          // If status is true and data is present, show OTP input form
          setShowCustomerOtp(true);
          setCustomerError(""); // Reset error if successful
          setCustomerSuccessMessage(data.message || "OTP has been sent."); // Set success message
        } else {
          // If the status is false or data is missing, show error message
          setCustomerError(data.message || "Something went wrong");
          setCustomerSuccessMessage(""); // Reset success message
        }
      } catch (error) {
        // Catch any network or server-side errors
        setCustomerError("Something went wrong. Please try again.");
        setCustomerSuccessMessage(""); // Reset success message
      }
    }
  };



  const handleCustomerOtpSubmit = async (e) => {
    e.preventDefault();

    const otpAsNumber = parseInt(customerOtp, 10);

    if (customerOtp.length !== 4) {
      setCustomerError("Please enter a 4-digit OTP.");
    } else {
      try {
        const response = await fetchClient(
          `${endpoints.base_url}auth/login-with-otp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ mobile: customerPhone, otp: otpAsNumber }),
          }
        );

        const data = await response.json();

        

        if (data.status && data.data) {
          // Save token and refreshToken in localStorage
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("refreshToken", data.data.refreshToken);
          localStorage.setItem("user", JSON.stringify(data.data.user));
          window.dispatchEvent(new Event("userLoggedIn"));
          // If status is true and data is present, show OTP input form
          onLoginSuccess(data.data);
          setCustomerError(""); // Reset error if successful
          //setIsOtpPopupVisible(false);
        } else {
          // If the status is false or data is missing, show error message
          setCustomerError(data.message || "Something went wrong");
        }
      } catch (error) {
        // Catch any network or server-side errors
        setCustomerError("Something went wrong. Please try again.");
      }
    }
  };



  return (
    <div className="container mt-4">
     

      {/* Customer Login */}
        <div className="card p-3 custom-card">
          {!showCustomerOtp ? (
            <form onSubmit={handleCustomerSubmit}>
              <p className="text-center verification-title">
                You will receive a 4 digit code for verification (customer)
              </p>

              <label className="form-label mt-2">Enter your phone number</label>
              <div className="input-group mb-4">
                <span className="input-group-text">+91</span>
                <input
                  type="text"
                  className="form-control"
                  maxLength={10}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter Your Mobile Number"
                />
              </div>

              {customerError && <p className="text-danger">{customerError}</p>}

              <div className="text-center">
                <button type="submit" className="btn w-100 custom-btn">
                  GET OTP
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCustomerOtpSubmit}>
              {/* Display OTP sent message if it's not hidden */}
              {otpSentMessageVisible && customerSuccessMessage && (
                <p className="text-success">{customerSuccessMessage}</p>
              )}

              <label className="form-label mt-2">Enter OTP</label>
              <input
                type="text"
                className="form-control mb-3"
                value={customerOtp}
                maxLength={4} // Limit input to 4 digits
                onChange={(e) => {
                  // Ensure only numeric values are entered
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  if (value.length <= 4) {
                    setCustomerOtp(value); // Set OTP if it's 4 or fewer characters
                  }
                }}
                placeholder="Enter OTP"
                onFocus={handleOtpFocus} // Hide the OTP sent message on focus
              />

              {/* Show error message if OTP is incorrect */}
              {customerError && <p className="text-danger">{customerError}</p>}

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
  );
};

export default LoginTabs;
