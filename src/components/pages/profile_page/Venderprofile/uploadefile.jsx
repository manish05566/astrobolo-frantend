"use client";
import { endpoints } from "../../../../../utils/config";
import { fetchClient } from "../../../../../utils/fetchClient";
import React, { useRef, useEffect, useState } from "react";

const UploadIcon = () => (
  <svg className="upload_svg mb-2" width="60" height="60" viewBox="0 0 96 96">
    <path d="M47 6a21 21 0 0 0-12.3 3.8c-2.7 2.1-4.4 5-4.7 7.1-5.8 1.2-10.3 5.6-10.3 10.6 0 6 5.8 11 13 11h12.6V22.7l-7.1 6.8c-.4.3-.9.5-1.4.5-1 0-2-.8-2-1.7 0-.4.3-.9.6-1.2l10.3-8.8c.3-.4.8-.6 1.3-.6.6 0 1 .2 1.4.6l10.2 8.8c.4.3.6.8.6 1.2 0 1-.9 1.7-2 1.7-.5 0-1-.2-1.3-.5l-7.2-6.8v15.6h14.4c6.1 0 11.2-4.1 11.2-9.4 0-5-4-8.8-9.5-9.4C63.8 11.8 56 5.8 47 6Zm-1.7 42.7V38.4h3.4v10.3c0 .8-.7 1.5-1.7 1.5s-1.7-.7-1.7-1.5ZM27 49c-4 0-7 2-7 6v29c0 3 3 6 6 6h42c3 0 6-3 6-6V55c0-4-3-6-7-6H28Zm41 3c1 0 3 1 3 3v19l-13-6a2 2 0 0 0-2 0L44 79l-10-5a2 2 0 0 0-2 0l-9 7V55c0-2 2-3 4-3h41ZM40 62c0 2-2 4-5 4s-5-2-5-4 2-4 5-4 5 2 5 4Z" />
  </svg>
);

const FileUploadBox = ({ title, inputId, onFilesChange, preview }) => {
  const [localPreview, setLocalPreview] = useState(preview || "");
  const dropZoneRef = useRef(null);

  useEffect(() => {
    if (preview) setLocalPreview(preview);
  }, [preview]);

  useEffect(() => {
    const zone = dropZoneRef.current;
    const input = zone.querySelector('input[type="file"]');

    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const highlight = () => zone.classList.add("highlight");
    const unhighlight = () => zone.classList.remove("highlight");

    const handleDrop = (e) => {
      const dt = e.dataTransfer;
      const files = [...dt.files].filter((file) =>
        ["image/jpeg", "image/png", "image/svg+xml"].includes(file.type)
      );
      if (!files.length) return;
      handleFiles(files);
    };

    const handleInputChange = (e) => {
      const files = [...e.target.files].filter((file) =>
        ["image/jpeg", "image/png", "image/svg+xml"].includes(file.type)
      );
      if (!files.length) return;
      handleFiles(files);
    };

    const handleFiles = (files) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalPreview(reader.result); // ✅ update local preview
      };
      reader.readAsDataURL(files[0]);
      onFilesChange(inputId, files);
    };

    ["dragenter", "dragover", "dragleave", "drop"].forEach((event) =>
      zone.addEventListener(event, preventDefaults, false)
    );
    ["dragenter", "dragover"].forEach((event) =>
      zone.addEventListener(event, highlight, false)
    );
    ["dragleave", "drop"].forEach((event) =>
      zone.addEventListener(event, unhighlight, false)
    );

    zone.addEventListener("drop", handleDrop, false);
    input.addEventListener("change", handleInputChange, false);

    return () => {
      ["dragenter", "dragover", "dragleave", "drop"].forEach((event) => {
        zone.removeEventListener(event, preventDefaults, false);
        zone.removeEventListener(event, highlight, false);
        zone.removeEventListener(event, unhighlight, false);
      });
      zone.removeEventListener("drop", handleDrop, false);
      input.removeEventListener("change", handleInputChange, false);
    };
  }, [inputId, onFilesChange]);

  return (
    <div className="col-lg-4 col-md-4 mb-4">
      <div className="card p-2 shadow-sm">
        <fieldset
          ref={dropZoneRef}
          className="upload_dropZone text-center p-1 border border-2 border-dashed rounded"
        >
          <legend className="visually-hidden">{title}</legend>
          <UploadIcon />
          <p className="small my-1">
            {title}
            <br />
            <i>or</i>
          </p>
          <input
            id={inputId}
            className="position-absolute invisible"
            type="file"
            multiple
            accept="image/jpeg, image/png, image/svg+xml"
          />
          <label className="btn btn-theme mt-2" htmlFor={inputId}>
            Select File
          </label>

          {localPreview && (
            <div className="mt-3">
              <label className="fw-semibold d-block">Preview:</label>
              <img
                src={localPreview}
                alt={inputId}
                style={{ maxWidth: "160px", borderRadius: "8px" }}
              />
            </div>
          )}
        </fieldset>
      </div>
    </div>
  );
};


const UploadeFile = ({  }) => {
  const [filesMap, setFilesMap] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [profile, setProfile] = useState({});

   useEffect(() => {
      const token = localStorage.getItem("token");
      const userDataRaw = localStorage.getItem("user");
      console.log("userDataRaw", userDataRaw);
      const userData = JSON.parse(userDataRaw);
      const vendorId = userData?.user?.id;
  
      if (!vendorId) {
        console.error("Vendor ID not found 1");
      }
  
      const fetchProfileData = async () => {
        try {
          const res = await fetchClient(
            `${endpoints.base_url}vendors/${vendorId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
          const data = await res.json();
  
          console.log("response data vendor", data.data);
          setProfile(data.data);
  
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      };
  
      fetchProfileData();
    }, []);



  
  const handleFilesChange = (inputId, files) => {
    setFilesMap((prev) => ({
      ...prev,
      [inputId]: files,
    }));
  };


  const isAllRequiredFilesSelected = () => {
    return filesMap.document1?.length > 0 && filesMap.document2?.length > 0;
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const userDataRaw = localStorage.getItem("user");
    const userData = JSON.parse(userDataRaw);
    const vendorId = userData?.user?.id;

    

    setError("");
    setSuccess("");
    setResponseMessage("");

    if (!isAllRequiredFilesSelected()) {
      setError("Both Aadhaar and PAN card documents are required.");
      return;
    }

    const formData = new FormData();
    formData.append("document1", filesMap.document1[0]);
    formData.append("document2", filesMap.document2[0]);

    // Debug formData
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": ", pair[1]);
    }

    try {
      const response = await fetchClient(
        `${endpoints.base_url}vendors/upload-documents/${vendorId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      console.log("response result", result);

      if (response.ok && result.status) {
        setSuccess("Documents uploaded successfully!");
        setFilesMap({});
      } else {
        setResponseMessage(result.message || "Upload failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    }
  };


  return (
    <div>
      <div className="text-center fw-semibold text-secondary mb-3">
        📄 Please upload both <strong>Aadhaar</strong> and{" "}
        <strong>PAN card</strong> to enable submission.
      </div>

      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-9">
            <div className="row">
              <FileUploadBox
              title="Upload Aadhaar Card"
              inputId="document1"
              onFilesChange={handleFilesChange}
              preview={profile?.document1}
            />
            <FileUploadBox
              title="Upload PAN Card"
              inputId="document2"
              onFilesChange={handleFilesChange}
              preview={profile?.document2}
            />

            </div>

            <div className="mt-4">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              {responseMessage && (
                <div className="alert alert-danger">{responseMessage}</div>
              )}

              {isAllRequiredFilesSelected() && (
                <div className="d-flex justify-content-center mt-4 mb-5">
                  <button
                    className="btn px-5 py-2 shadow rounded-pill"
                    style={{ backgroundColor: "#8f6f9e", color: "white" }}
                    onClick={handleSubmit}
                  >
                    🚀 Submit Files
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




export default UploadeFile;
