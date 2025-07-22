import React from "react";
import "./HeroSlider.module.css";

const images = [
  "/images/slider1.jpg",
  "/images/slider2.png",
  "/images/slider3.jpg",
];

const HeroSlider = () => {
  return (
    <div
      id="carouselExampleControlsNoTouching"
      className="carousel slide"
      data-bs-touch="false"
      data-bs-interval="false"
      style={{ width: "100%", height: "100vh" }}
    >
      <div className="carousel-inner" style={{ height: "100%" }}>
        {images.map((image, index) => (
          <div
            key={index}
            className={`carousel-item ${index === 0 ? "active" : ""}`}
            style={{ height: "100%", position: "relative" }}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="d-block w-100"
              style={{
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Overlay */}
            <div className="slider-overlay"></div>

            {/* Optional text or content can go here */}
           
          </div>
        ))}
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleControlsNoTouching"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>

      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleControlsNoTouching"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default HeroSlider;
