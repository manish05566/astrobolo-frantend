import React from "react";
import Link from "next/link";
function Rating() {
  return (
    <div className="col-md-6 col-12 mb-4">
      <h5>Rating & Reviews</h5>
      <div className="d-flex align-items-center mb-3">
        <h3 className="me-2 mb-0">4.93</h3>
        <div>
          <span className="text-warning">★★★★★</span>
          <br />
          <small className="text-muted">18708 total</small>
        </div>
      </div>
      <div className="mb-2 d-flex align-items-center">
        <span className="me-2">5</span>
        <div className="rating-bar flex-grow-1">
          <div
            className="rating-bar-fill bg-success"
            style={{ width: "90%" }}
          ></div>
        </div>
      </div>
      <div className="mb-2 d-flex align-items-center">
        <span className="me-2">4</span>
        <div className="rating-bar flex-grow-1">
          <div
            className="rating-bar-fill bg-primary"
            style={{ width: "5%" }}
          ></div>
        </div>
      </div>
      <div className="mb-2 d-flex align-items-center">
        <span className="me-2">3</span>
        <div className="rating-bar flex-grow-1"></div>
      </div>
      <div className="mb-2 d-flex align-items-center">
        <span className="me-2">2</span>
        <div className="rating-bar flex-grow-1"></div>
      </div>
      <div className="mb-2 d-flex align-items-center">
        <span className="me-2">1</span>
        <div className="rating-bar flex-grow-1"></div>
      </div>
      <Link
        href="/ChatList"
        className="text-primary"
        title="Chat With Astrologer"
      >
        Chat with Assistant?
      </Link>
    </div>
  );
}

export default Rating;
