"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DetailAbout from "./DetailAbout.jsx";
import Rating from "./Rating.jsx";
import Reviews from "./Reviews.jsx";
import Link from "next/link";
import { endpoints } from "../../../../utils/config";

const AstrologerDetail = () => {
  const { id } = useRouter().query;
  const [astrologer, setAstrologer] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`${endpoints.base_url}vendors/${id}`)
        .then((res) => res.json())
        .then((data) => {
          const a = data?.data;
          if (!a) return;
          const formatted = {
            id: a.id,
            first_name: a.first_name,
            specialist: a.specialist,
            language: a.language,
            experience: `${a.experience} years`,
            chat_charge: `₹ ${a.chat_charge}/min`,
            image: a.image || "/images/userprofile.png",
            rating: "★★★★★",
            totalTalkTime: "78K mins", // replace with real data if available
            totalCallTime: "56K mins", // replace with real data if available
            celebrity: a.specialist === "Psychic" ? "Celebrity" : null,
          };
          setAstrologer(formatted);
        })
        .catch((err) => console.error("Error fetching detail", err));
    }
  }, [id]);

  if (!astrologer) return <p>Loading...</p>;

  return (
    <div className="detail sectiontop-margin">
      <div className="container my-4">
        {/* Profile Section */}
        <div className="Profile-section">
          <div className="row align-items-center mb-4">
            <div className="col-md-2 col-4">
              <div className="profile-img-border">
                <img
                  src={astrologer.image}
                  alt={astrologer.first_name}
                  className="profile-img"
                />
              </div>
            </div>
            <div className="col-md-6 col-8">
              <h3 className="mb-1">{astrologer.first_name}</h3>
              <p className="text-muted mb-1">{astrologer.specialist}</p>
              <p className="text-muted mb-1">{astrologer.language}</p>
              <p className="text-muted mb-1">Exp: {astrologer.experience}</p>
              <p className="text-muted mb-1">{astrologer.chat_charge}</p>
              <p className="text-muted mb-0">
                <span className="me-3">{astrologer.totalTalkTime}</span>
                <span>{astrologer.totalCallTime}</span>
              </p>
            </div>
            <div className="col-md-4 col-12 mt-3 mt-md-0 text-md-start text-center">
              <Link
                href="/TalkAstrologer"
                className="btn btn-outline-success me-2 mb-2"
              >
                Start Chat
              </Link>
              <Link
                href="/TalkAstrologer"
                className="btn btn-outline-success mb-2"
              >
                Start Call
              </Link>
            </div>
          </div>

          {/* Follow Button */}
          <div className="row mb-4">
            <div className="col-12">
              <button className="btn btn-warning">Follow</button>
            </div>
          </div>
        </div>

        {/* About Me */}
        <DetailAbout />

        <div className="row mb-4">
          {/* Rating & Reviews */}
          <Rating />

          {/* User Reviews */}
          <Reviews />
        </div>
      </div>
    </div>
  );
};

export default AstrologerDetail;
