import React, { useState } from "react";

function FilterPopup({ specialistList, selectedFilters, setSelectedFilters }) {
  const optionsByTab = {
    specialist: specialistList || [],
    language: ["English", "Hindi"],
    gender: ["FEMALE", "MALE"],
  };

  const [activeTab, setActiveTab] = useState("specialist");

  const handleCheckboxChange = (item) => {
    setSelectedFilters((prev) => {
      const current = prev[activeTab] || [];
      const isSelected = current.includes(item);

      return {
        ...prev,
        [activeTab]: isSelected
          ? current.filter((i) => i !== item)
          : [...current, item],
      };
    });
  };

  const handleSelectAll = () => {
    setSelectedFilters((prev) => ({
      ...prev,
      [activeTab]: [...(optionsByTab[activeTab] || [])],
    }));
  };

  const handleClear = () => {
    setSelectedFilters((prev) => ({
      ...prev,
      [activeTab]: [],
    }));
  };

  return (
    <div className="container">
      <div className="row popup-height">
        {/* Left Tabs */}
        <div className="col-md-4 left-tabs">
          <div className="d-flex flex-column">
            {Object.keys(optionsByTab).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`btn ${
                  activeTab === tab ? "btn-primary" : "btn-outline-secondary"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="col-md-8">
          <div className="main-skill">
            <div className="mb-3 d-flex gap-2">
              <button
                className="btn btn-outline-success px-3"
                onClick={handleSelectAll}
              >
                Select All
              </button>
              <button
                className="btn btn-outline-warning px-3"
                onClick={handleClear}
              >
                Clear
              </button>
            </div>

            <div className="short-popup">
              {(optionsByTab[activeTab] || []).map((option, index) => {
                const isSelected = selectedFilters[activeTab]?.includes(option);
                return (
                  <div
                    key={index}
                    className={`form-check rounded d-flex align-items-center justify-content-between ${
                      isSelected ? "bg-light border-primary" : ""
                    }`}
                    onClick={() => handleCheckboxChange(option)}
                    style={{ cursor: "pointer" }}
                  >
                    <label
                      className={`custom-radio-wrapper ${
                        isSelected ? "selected" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(option)}
                        style={{ display: "none" }}
                      />
                      <span className="custom-radio"></span>
                      <span className="label-text">{option}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterPopup;
