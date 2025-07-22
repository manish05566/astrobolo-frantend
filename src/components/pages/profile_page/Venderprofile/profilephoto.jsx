import React, { useState, useEffect } from "react";
import { endpoints } from "../../../../../utils/config";
import { fetchClient } from "../../../../../utils/fetchClient";

function ProfilePhoto() {
  const [userData, setUserData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [previewImage, setPreviewImage] = useState("/images/userprofile.png");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedData = JSON.parse(storedUser);
        const user = parsedData?.user;
        const type = parsedData?.type;
  
        // Check if user ID and type exist
        if (user?.id && type === "vendor") {
          setUserId(user.id);
          fetchUserProfile(user.id);
        } else {
          console.warn("User type is not 'user' or ID is missing");
        }
      }
    }, []);


    const fetchUserProfile = async (id) => {
      const token = localStorage.getItem("token");

      if (!id || !token) {
        console.warn("Missing ID or token");
        return;
      }

      try {
        const res = await fetchClient(`${endpoints.base_url}vendors/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();
        if (res.ok && result.data) {
          const imageUrl = result.data.image || "/images/userprofile.png";
          setPreviewImage(imageUrl);
          setUserData(result.data);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };


const handleFileChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const fileSizeKB = file.size / 1024;

  if (fileSizeKB > 50) {
    setResponseMessage("Image size should be 50KB or less.");
    setMessageType("error");
    setSelectedFile(null);
    return;
  }

  // ✅ Clear previous errors when file is valid
  setResponseMessage("");
  setMessageType("");

  setSelectedFile(file);
  setPreviewImage(URL.createObjectURL(file));
};



 const handleUpload = async () => {
     if (!selectedFile || !userId) return;

     const formData = new FormData();
     formData.append("image", selectedFile);

     try {
       const token = localStorage.getItem("token");
       const response = await fetchClient(
         `${endpoints.base_url}vendors/upload-profile/${userId}`,
         {
           method: "PUT",
           headers: {
             Authorization: `Bearer ${token}`,
           },
           body: formData,
         }
       );

       const result = await response.json();
       if (response.ok && result.status) {
         const updatedUrl = result.data || "/images/userprofile.png";
         setPreviewImage(`${updatedUrl}?${Date.now()}`);
         setSelectedFile(null);
       } else {
         setResponseMessage(result.message || "Upload failed. Try again.");
         setMessageType("error");
       }
     } catch (error) {
       console.error("Upload error:", error);
       alert("Something went wrong while uploading.");
     }
 };



  return (
    <div className="text-center user-photo">
      <div className="position-relative d-inline-block">
        <img
          src={previewImage}
          className="rounded-circle profile-pic img-thumbnail"
          alt="Profile"
          width="120"
          height="120"
        />
        <label
          htmlFor="upload-photo"
          className="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle"
          title="Change Photo"
          style={{ cursor: "pointer" }}
        >
          <i className="fas fa-camera"></i>
        </label>
        <input
          type="file"
          id="upload-photo"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      <div className="mt-2">
        {responseMessage && (
          <p
            style={{
              color: messageType === "success" ? "green" : "red",
              fontSize: "0.75rem",
              margin: 0,
            }}
          >
            {responseMessage}
          </p>
        )}

        {!responseMessage && selectedFile && (
          <button
            className="btn btn-success btn-sm"
            style={{ fontSize: "0.75rem", padding: "2px 8px" }}
            onClick={() => handleUpload(selectedFile)}
          >
            Upload
          </button>
        )}
      </div>

      <p className="mt-2 mb-1 profile-name fw-bold">
        {userData?.first_name} {userData?.last_name}
      </p>
      <p className="text-muted mb-3 profile-number">(+91 {userData?.mobile})</p>
    </div>
  );
}

export default ProfilePhoto;
