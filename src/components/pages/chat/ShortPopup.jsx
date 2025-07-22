import React from "react";

function ShortPopup({ selectedSort, setSelectedSort }) {
  const options = [
    { id: "sort_0", value: "", label: "Popularity" },
    {
      id: "sort_1",
      value: "sortByExperience_1",
      label: "Experience : High to Low",
    },
    {
      id: "sort_2",
      value: "sortByExperience_0",
      label: "Experience : Low to High",
    },
    { id: "sort_5", value: "sortByPrice_1", label: "Price : High to Low" },
    { id: "sort_6", value: "sortByPrice_0", label: "Price : Low to High" },
    { id: "sort_7", value: "sortByRating_1", label: "Rating : High to Low" },
  ];

  return (
    <div className="w-100 bg-white p-3">
      <div className="mt-3 short-popup">
        {options.map((option) => {
          const isSelected = selectedSort === option.value;
          return (
            <div
              key={option.id}
              className={`form-check mb-2 rounded d-flex align-items-center justify-content-between ${
                isSelected ? "bg-light border-primary" : ""
              }`}
            >
              <div>
                <label
                  key={option.id}
                  className={`custom-radio-wrapper ${
                    selectedSort === option.value ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="sorting"
                    value={option.value}
                    checked={selectedSort === option.value}
                    onChange={(e) => setSelectedSort(e.target.value)}
                  />
                  <span className="custom-radio"></span>
                  <span className="label-text">{option.label}</span>
                </label>
              </div>
              {isSelected && <span className="text-success fw-bold">✔</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ShortPopup;
