import React, { useState, useEffect } from "react";
import { endpoints } from "../../../../../utils/config";
import * as Yup from "yup";
import styles from  "./profile.module.css";
import { fetchClient } from "../../../../../utils/fetchClient";


import { Formik, useFormik,Form, Field, ErrorMessage } from "formik";


function UserProfileForm() {
  const [profile, setProfile] = useState({
    country: "",
    state: "",
    city: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    topic_of_concern: "",
    gender: "",
    birth_time: "",
    birth_date: "",
    marital_status: "",
    birth_place: "",
    pincode: "",
    religion: "",
    language: "",
    occupation: "",
  });

  // Dropdown options
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [religions, setReligions] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [occupations, setOccupations] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [mobile, setMobile] = useState("");

  // To hold the selected country and state ids
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [selectedStateId, setSelectedStateId] = useState(null);



 const formik = useFormik({
   initialValues: {
     mobile: "",
     city: "",
     // other initial values
   },
   // validationSchema, onSubmit, etc.
 });

 useEffect(() => {
   const token = localStorage.getItem("token");
   const userData = JSON.parse(localStorage.getItem("user"));
   const userId = userData?.user.id;
   const userType = userData?.type;

   const mobileShow = userData?.user?.mobile || "";
   setMobile(mobileShow);

   if (!userId || !userType) {
     console.error("Missing userId or userType");
     return;
   }

   const fetchProfileData = async () => {
     try {

      if(userType === 'user'){
         
        const res = await fetchClient(`${endpoints.base_url}users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        console.log("response data user", data);
        setProfile(data.data);

        formik.setValues((prev) => ({
          ...prev,
          mobile: data.mobile || "",
          city: data.city || "",
          // set other values if needed
        }));

      }

       
     } catch (error) {
       console.error("Error fetching profile:", error);
     }
   };

   fetchProfileData();
 }, []);


  // Fetch all country 
  const fetchDropdownData = async () => {
    try {
      const [countryRes, configRes] = await Promise.all([
        fetchClient(`${endpoints.base_url}countries/countries`).then((res) =>
          res.json()
        ),
        fetchClient(`${endpoints.base_url}countries/config`).then((res) =>
          res.json()
        ),
      ]);
      setCountries(countryRes.data); // ✅ fix here
      setReligions(configRes.data.religion);
      setLanguages(configRes.data.language);
      setOccupations(configRes.data.occupation);
    } catch (err) {
      console.error("Error loading dropdown data:", err);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);


  useEffect(() => {
    if (countries.length > 0) {
      const india = countries.find((c) => c.name === "India");
      if (india) {
        setProfile((prev) => ({
          ...prev,
          country: india.name,
        }));
        setSelectedCountryId(india.id);
        fetchStates(india.id);
      }
    }
  }, [countries]);


  // useEffect(() => {
  //   if (states.length > 0 && !profile.state) {
  //     const defaultState = states.find((s) => s.name === "Maharashtra");
  //     if (defaultState) {
  //       setProfile((prev) => ({
  //         ...prev,
  //         state: defaultState.name,
  //       }));
  //       setSelectedStateId(defaultState.id);
  //       fetchCities(defaultState.id);
  //     }
  //   }
  // }, [states, profile.state]);

  useEffect(() => {
    if (states.length > 0 && profile.state) {
      const stateId = states.find((s) => s.name === profile.state)?.id;
      if (stateId) {
        setSelectedStateId(stateId);
        fetchCities(stateId);
      }
    }
  }, [states, profile.state]);



  // Fetch states when country is selected
  const fetchStates = async (countryId) => {
    try {
      const stateRes = await fetchClient(
        `${endpoints.base_url}countries/states/${countryId}`
      ).then((res) => res.json());
      setStates(stateRes.data);
      setCities([]); // Clear cities when country changes
      setSelectedStateId(null); // Reset the state selection
    } catch (err) {
      console.error("Error loading states:", err);
    }
  };

  // Fetch cities when state is selected
  const fetchCities = async (stateId) => {
    try {
      const cityRes = await fetchClient(
        `${endpoints.base_url}countries/cities/${stateId}`
      ).then((res) => res.json());
      setCities(cityRes.data);
    } catch (err) {
      console.error("Error loading cities:", err);
    }
  };

  const handleProfileChange = async (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "country") {
      const countryId = countries.find((c) => c.name === value)?.id;
      setSelectedCountryId(countryId);
      if (countryId) {
        await fetchStates(countryId); // Fetch states when country changes
      }
    } else if (name === "state") {
      const stateId = states.find((s) => s.name === value)?.id;
      setSelectedStateId(stateId);
      if (stateId) {
        await fetchCities(stateId); // Fetch cities when state changes
      }
    }
  };


  const validationSchema = Yup.object().shape({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    birth_place: Yup.string().required("Birth place is required"),
    birth_date: Yup.string().required("Date of birth is required"),
    gender: Yup.string().required("Gender is required"),
    state: Yup.string().required("State is required"),
    city: Yup.string().required("City is required"),
    pincode: Yup.string()
      .matches(/^\d{6}$/, "Pincode must be exactly 6 digits")
      .required("Pincode is required"),
    marital_status: Yup.string().required("Marital Status is required"),
    religion: Yup.string().required("Religion is required"),
    language: Yup.string().required("Language is required"),
  });

 const handleSubmit = async (values) => {
   const token = localStorage.getItem("token");
   const userData = JSON.parse(localStorage.getItem("user"));
   const userId = userData?.user.id;
   if (values.pincode) {
     values.pincode = Number(values.pincode);
   }
   if (!userId) {
     console.error("User ID not found");
     return;
   }
   // Remove unwanted fields from values
   const { image, id, mobile, is_active, is_login, ...filteredValues } = values;

   try {
     const response = await fetchClient(`${endpoints.base_url}users/${userId}`, {
       method: "PUT",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify(filteredValues),
     });

     const result = await response.json();

     if (response.ok && result.status) {
       setResponseMessage(result.message || "Profile updated successfully!");
       setMessageType("success"); // Set message type to success
     } else {
       setResponseMessage(
         result.message || "Profile update failed. Please try again."
       );
       setMessageType("error"); // Set message type to error
     }
     // Auto-hide after 3 seconds
     setTimeout(() => {
       setResponseMessage("");
       setMessageType("");
     }, 3000);
   } catch (error) {
     console.error("API error:", error);
     setResponseMessage("An error occurred. Please try again.");
     setMessageType("error");

      setTimeout(() => {
        setResponseMessage("");
        setMessageType("");
      }, 3000);

   }
 };


  return (
    <div className="user-profile-info p-4 pt-0">
      <h5 className="mb-4 bg-title-profile">Edit Profile</h5>

      {responseMessage && (
        <div className={styles.centeredMessage}>
          <div
            className={`${styles.fadeUp} ${
              messageType === "success"
                ? styles.alertSuccess
                : styles.alertError
            }`}
          >
            {responseMessage}
          </div>
        </div>
      )}

      <Formik
        initialValues={profile}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <div className="card shadow-sm p-3 bg-profile">
              <div className="p-4 px-0">
                <div className="mb-4">
                  <div className="row g-3">
                    {/* First Name */}
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontWeight: 500 }}>
                        First name
                      </label>
                      <input
                        name="first_name"
                        className="form-control"
                        value={formik.values.first_name}
                        placeholder="Enter first name"
                        onChange={(e) => {
                          const { name, value } = e.target;
                          formik.setFieldValue(name, value);
                          formik.setFieldTouched(name, true, false);
                          formik.validateField(name);
                        }}
                      />
                      {formik.errors.first_name &&
                        formik.touched.first_name && (
                          <div
                            className={`${styles.textDanger} ${styles.small}`}
                          >
                            {formik.errors.first_name}
                          </div>
                        )}
                    </div>
                    {/* Last Name */}
                    <div className="col-md-4">
                      <label className="form-label">Last name</label>
                      <input
                        name="last_name"
                        className="form-control"
                        value={formik.values.last_name}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          formik.setFieldValue(name, value);
                          formik.setFieldTouched(name, true, false);
                          formik.validateField(name);
                        }}
                        placeholder="Enter last name"
                      />
                      {formik.errors.last_name && formik.touched.last_name && (
                        <div className={`${styles.textDanger} ${styles.small}`}>
                          {formik.errors.last_name}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="col-md-4">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formik.values.email}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          formik.setFieldValue(name, value);
                          formik.setFieldTouched(name, true, false);
                          formik.validateField(name);
                        }}
                        placeholder="Enter email-Id"
                      />

                      {formik.errors.email && formik.touched.email && (
                        <div className={`${styles.textDanger} ${styles.small}`}>
                          {formik.errors.email}
                        </div>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className="col-md-4">
                      <label className="form-label">Date of birth</label>
                      <input
                        type="date"
                        name="birth_date"
                        className="form-control"
                        value={
                          formik.values.birth_date
                            ? formik.values.birth_date.slice(0, 10)
                            : ""
                        }
                        onChange={(e) => {
                          const { name, value } = e.target;
                          formik.setFieldValue(name, value);
                          formik.setFieldTouched(name, true, false);
                          formik.validateField(name);
                        }}
                      />

                      {formik.errors.birth_date &&
                        formik.touched.birth_date && (
                          <div
                            className={`${styles.textDanger} ${styles.small}`}
                          >
                            {formik.errors.birth_date}
                          </div>
                        )}
                    </div>

                    {/* Time of Birth */}
                    <div className="col-md-4">
                      <label className="form-label">Time of birth</label>
                      <input
                        type="time"
                        name="birth_time"
                        className="form-control"
                        value={formik.values.birth_time}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          formik.setFieldValue(name, value);
                          formik.setFieldTouched(name, true, false);
                        }}
                      />
                    </div>

                    {/* Gender */}
                    <div className="col-md-4">
                      <label className="form-label">Gender</label>
                      <select
                        name="gender"
                        className="form-select"
                        value={formik.values.gender}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          formik.setFieldValue(name, value);
                          formik.setFieldTouched(name, true, false);
                          formik.validateField(name);
                        }}
                      >
                        <option value="">Select Gender</option>
                        <option value="FEMALE">Female</option>
                        <option value="MALE">Male</option>
                        <option value="OTHER">Other</option>
                      </select>

                      {formik.errors.gender && formik.touched.gender && (
                        <div className={`${styles.textDanger} ${styles.small}`}>
                          {formik.errors.gender}
                        </div>
                      )}
                    </div>

                    {/* Birth Place */}
                    <div className="col-md-4">
                      <label className="form-label">Birth Place</label>
                      <input
                        type="text"
                        name="birth_place"
                        className="form-control"
                        value={formik.values.birth_place}
                        placeholder="Enter Birth Place"
                        onChange={(e) => {
                          const { name, value } = e.target;
                          formik.setFieldValue(name, value);
                          formik.setFieldTouched(name, true, false);
                          formik.validateField(name);
                        }}
                      />
                      {formik.errors.birth_place &&
                        formik.touched.birth_place && (
                          <div
                            className={`${styles.textDanger} ${styles.small}`}
                          >
                            {formik.errors.birth_place}
                          </div>
                        )}
                    </div>

                    {/* Country */}
                    <div className="col-md-4">
                      <label className="form-label">Select Country</label>
                      <select
                        name="country"
                        className="form-select"
                        value={formik.values.country}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          formik.setFieldValue(name, value);
                          formik.setFieldTouched(name, true, false);

                          if (formik.validationSchema?.fields?.[name]) {
                            formik.validateField(name);
                          }
                        }}
                        disabled
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* State */}
                    <div className="col-md-4">
                      <label className="form-label">Select State</label>
                      <select
                        name="state"
                        className="form-select"
                        value={formik.values.state}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          formik.setFieldValue(name, value);
                          formik.setFieldTouched(name, true, false);
                          formik.validateField(name);

                          const selectedState = states.find(
                            (s) => s.name === value
                          );
                          if (selectedState) {
                            fetchCities(selectedState.id); // ✅ Fetch cities based on selected state
                          }
                        }}
                      >
                        <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={state.id} value={state.name}>
                            {state.name}
                          </option>
                        ))}
                      </select>

                      {formik.errors.state && formik.touched.state && (
                        <div className={`${styles.textDanger} ${styles.small}`}>
                          {formik.errors.state}
                        </div>
                      )}
                    </div>

                    {/* City */}
                    <div className="col-md-4">
                      <label className="form-label">Select City</label>
                      <select
                        name="city"
                        className="form-select"
                        value={formik.values.city}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          formik.setFieldValue(name, value);
                          formik.setFieldTouched(name, true, false);
                          formik.validateField(name);
                        }}
                      >
                        <option value="">Select City</option>
                        {cities.map((city) => {
                          return (
                            <option key={city.id} value={city.name}>
                              {city.name}
                            </option>
                          );
                        })}
                      </select>

                      {formik.errors.city && formik.touched.city && (
                        <div className={`${styles.textDanger} ${styles.small}`}>
                          {formik.errors.city}
                        </div>
                      )}
                    </div>

                    {/* Pincode */}
                    <div className="col-md-4">
                      <label className="form-label">Pincode</label>
                      <input
                        type="number"
                        name="pincode"
                        className="form-control"
                        value={formik.values.pincode}
                        placeholder="Enter pincode"
                        onChange={(e) => {
                          const { name, value } = e.target;
                          formik.setFieldValue(name, value);
                          formik.setFieldTouched(name, true, false);
                          formik.validateField(name);
                        }}
                      />
                      {formik.errors.pincode && formik.touched.pincode && (
                        <div className={`${styles.textDanger} ${styles.small}`}>
                          {formik.errors.pincode}
                        </div>
                      )}
                    </div>

                    {/* Marital Status */}
                    <div className="col-md-4">
                      <label className="form-label">Marital Status</label>
                      <select
                        name="marital_status"
                        className="form-select"
                        value={formik.values.marital_status}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          formik.setFieldValue(name, value);
                          formik.setFieldTouched(name, true, false);
                          formik.validateField(name);
                        }}
                      >
                        <option value="">Select Marital Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                      </select>
                      {formik.errors.marital_status &&
                        formik.touched.marital_status && (
                          <div
                            className={`${styles.textDanger} ${styles.small}`}
                          >
                            {formik.errors.marital_status}
                          </div>
                        )}
                    </div>

                    {/* Religion */}
                    <div className="col-md-4">
                      <label className="form-label">Religion</label>
                      <select
                        name="religion"
                        className="form-select"
                        value={formik.values.religion}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          formik.setFieldValue(name, value);
                          formik.setFieldTouched(name, true, false);
                          formik.validateField(name);
                        }}
                      >
                        <option value="">Select Religion</option>
                        {Object.entries(religions || {}).map(([key, value]) => (
                          <option key={key} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>

                      {formik.errors.religion && formik.touched.religion && (
                        <div className={`${styles.textDanger} ${styles.small}`}>
                          {formik.errors.religion}
                        </div>
                      )}
                    </div>

                    {/* Language */}
                    <div className="col-md-4">
                      <label className="form-label">Language</label>
                      <select
                        name="language"
                        className="form-select"
                        value={formik.values.language}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          formik.setFieldValue(name, value);
                          formik.setFieldTouched(name, true, false);
                          formik.validateField(name);
                        }}
                      >
                        <option value="">Select Language</option>
                        {Object.entries(languages || {}).map(([key, value]) => (
                          <option key={key} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>

                      {formik.errors.language && formik.touched.language && (
                        <div className={`${styles.textDanger} ${styles.small}`}>
                          {formik.errors.language}
                        </div>
                      )}
                    </div>

                    {/* Occupation (multi-select) */}
                    <div className="col-md-4">
                      <label className="form-label">Occupation</label>
                      <select
                        name="occupation"
                        className="form-select"
                        value={formik.values.occupation}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          formik.setFieldValue(name, value);
                          formik.setFieldTouched(name, true, false);
                        }}
                      >
                        <option value="">Select Occupation</option>
                        {Object.entries(occupations || {}).map(
                          ([key, value]) => (
                            <option key={key} value={value}>
                              {value}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* Mobile */}
                    <div className="col-md-4">
                      <label className="form-label">Mobile</label>
                      <input
                        type="text"
                        name="mobile"
                        className="form-control"
                        value={mobile}
                        placeholder="Enter Mobile Number"
                        readOnly
                      />
                    </div>

                    {/* topic_of_concern */}
                    <div className="col-12">
                      <label className="form-label">Topic of concern</label>
                      <textarea
                        name="topic_of_concern"
                        className="form-control"
                        rows="4"
                        value={formik.values.topic_of_concern}
                        placeholder="Write something about yourself..."
                        onChange={(e) => {
                          formik.setFieldValue(
                            "topic_of_concern",
                            e.target.value
                          );
                        }}
                      />
                    </div>

                    {/* Submit */}
                    <div className="col-12">
                      <div className="text-center mt-3">
                        <button type="submit" className="btn btn-primary">
                          Update Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
}

export default UserProfileForm;
