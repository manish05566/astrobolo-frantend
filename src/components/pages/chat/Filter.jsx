import React, { useState, useEffect } from "react";
import Link from "next/link";
import FilterPopup from "./FilterPopup";
import ShortPopup from "./ShortPopup";
import { endpoints } from "../../../../utils/config";
//import "./Filter.css";

function Filter({
  searchQuery,
  setSearchQuery,
  data,
  setFilteredData,
  balance,
}) {
  const [selectedSort, setSelectedSort] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    gender: [],
    specialist: [],
    language: [],
  });


  const specialistList = [
    ...new Set(
      data.flatMap((item) =>
        Array.isArray(item.specialist) ? item.specialist : [item.specialist]
      )
    ),
  ];

  const validSpecialists = specialistList.filter(Boolean); // remove null/undefined

  const extractPrice = (price) => {
    return parseFloat(price.replace(/[^\d.]/g, "")) || 0;
  };

  const applySorting = (sortKey) => {
    if (!sortKey) {
      setFilteredData(data);
      return;
    }

    const sorted = [...data];

    switch (sortKey) {
      case "sortByExperience_1":
        sorted.sort((a, b) => {
          const expA = parseInt(a.experience) || 0;
          const expB = parseInt(b.experience) || 0;
          return expB - expA; // Descending
        });
        break;
      case "sortByExperience_0":
        sorted.sort((a, b) => {
          const expA = parseInt(a.experience) || 0;
          const expB = parseInt(b.experience) || 0;
          return expA - expB; // Ascending
        });
        break;
      case "sortByPrice_1":
        sorted.sort(
          (a, b) => extractPrice(b.chat_charge) - extractPrice(a.chat_charge)
        );
        break;
      case "sortByPrice_0":
        sorted.sort(
          (a, b) => extractPrice(a.chat_charge) - extractPrice(b.chat_charge)
        );
        break;

      default:
        break;
    }

    setFilteredData(sorted);
  };

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, data]);

  const handleSortApply = () => {
    applySorting(selectedSort); // Only run when "Apply" is clicked
  };

  const handleSortReset = () => {
    setSelectedSort("");
    setFilteredData(data);
  };

  const handleCheckboxChange = (category, value) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter((v) => v !== value);
      } else {
        updated[category] = [...updated[category], value];
      }
      return updated;
    });
  };

  const handleResetFilters = () => {
    setSelectedFilters({
      gender: [],
      specialist: [],
      language: [],
    });
  };

  const handleApplyFilters = () => {
    let filtered = [...data];

    if (selectedFilters.gender.length) {
      filtered = filtered.filter((item) =>
        selectedFilters.gender.includes(item.gender)
      );
    }

    if (selectedFilters.specialist.length) {
      filtered = filtered.filter((item) => {
        const itemSpecialist = item.specialist;
        return Array.isArray(itemSpecialist)
          ? itemSpecialist.some((s) => selectedFilters.specialist.includes(s))
          : selectedFilters.specialist.includes(itemSpecialist);
      });
    }

    if (selectedFilters.language.length) {
      filtered = filtered.filter((item) =>
        selectedFilters.language.includes(item.language)
      );
    }

    setFilteredData(filtered);
  };

  return (
    <div className="mt-5 pt-3">
      <div className="container py-3">
        <div className="row gy-3 align-items-center">
          <div className="col-12 col-md-auto ps-0">
            <h2 className="bg-theme-dark">Chat with Astrologer</h2>
          </div>

          <div className="col-12 col-md-auto text-center text-md-start">
            <span className="fs-6">Available balance: ₹ {balance}</span>
          </div>

          <div className="col-12 col-md-auto">
            <Link
              href="/wallet-recharge"
              className="btn btn-outline-success w-100"
            >
              Recharge
            </Link>
          </div>

          <div className="col d-none d-lg-block" />

          <div className="col-6 col-md-auto">
            <button
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
              data-bs-toggle="modal"
              data-bs-target="#FilterModal"
            >
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-funnel"
                  viewBox="0 0 16 16"
                >
                  <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
                </svg>{" "}
                Filter
              </span>
            </button>
          </div>

          <div className="col-6 col-md-auto">
            <button
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
              data-bs-toggle="modal"
              data-bs-target="#ShortModal"
            >
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-sort-down"
                  viewBox="0 0 16 16"
                >
                  <path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z" />
                </svg>{" "}
                Sort by
              </span>
            </button>
          </div>

          <div className="col-12 col-lg-3 pe-0">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-search bg-theme-dark">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-search"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <div
        className="modal fade"
        id="FilterModal"
        tabIndex="-1"
        aria-labelledby="FilterModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-popup-header">
              <h3 className="modal-title fs-5" id="FilterModalLabel">
                Filter Options
              </h3>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body filter-body">
              <FilterPopup
                specialistList={validSpecialists}
                selectedFilters={selectedFilters}
                handleCheckboxChange={handleCheckboxChange}
                setSelectedFilters={setSelectedFilters}
              />
            </div>
            <div className="d-flex justify-content-around align-items-center modal-footer">
              <button
                type="button"
                className="btn btn-outline-info px-5"
                onClick={() => {
                  setSelectedFilters({
                    gender: [],
                    specialist: [],
                    language: [],
                  });
                  setFilteredData(data);
                }}
              >
                Reset
              </button>

              <button
                type="button"
                className="btn btn-outline-success px-5"
                onClick={handleApplyFilters}
                data-bs-dismiss="modal"
              >
                Apply
              </button>

              {/* <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Sort Modal */}
      <div
        className="modal fade"
        id="ShortModal"
        tabIndex="-1"
        aria-labelledby="ShortModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-popup-header">
              <h1 className="modal-title fs-5" id="ShortModalLabel">
                Sort Options
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <ShortPopup
                selectedSort={selectedSort}
                setSelectedSort={setSelectedSort}
              />
            </div>
            <div className="d-flex justify-content-around align-items-center modal-footer">
              <button
                type="button"
                className="btn btn-outline-info px-5"
                onClick={handleSortReset}
                data-bs-dismiss="modal"
              >
                Reset
              </button>
              <button
                type="button"
                className="btn btn-outline-success px-5"
                onClick={handleSortApply}
                data-bs-dismiss="modal"
              >
                Apply
              </button>
              {/* <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Filter;
