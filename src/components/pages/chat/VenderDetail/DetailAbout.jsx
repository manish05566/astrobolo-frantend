import React from "react";

function DetailAbout({ bio }) {
  return (
    <div className="row mb-4">
      <div className="col-12">
        <h5>About me</h5>
        <p>{bio}</p>
      </div>
    </div>
  );
}

export default DetailAbout;
