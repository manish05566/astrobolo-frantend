import React from 'react';

const reviewsData = [
  { name: 'Upasana', rating: 5, text: 'Highly recommended astrologer, thanks for the positive guidance and detailed analysis, thanks for thorough explanation' },
  { name: 'Premal', rating: 5, text: 'Person on very small lines but delivering the advice that is required 100% value' },
  { name: 'Upasana', rating: 5, text: 'Highly recommended astrologer, thanks for the positive guidance and detailed analysis, thanks for thorough explanation' },
  { name: 'Premal', rating: 5, text: 'Person on very small lines but delivering the advice that is required 100% value' },
  { name: 'Upasana', rating: 5, text: 'Highly recommended astrologer, thanks for the positive guidance and detailed analysis, thanks for thorough explanation' },
  { name: 'Premal', rating: 5, text: 'Person on very small lines but delivering the advice that is required 100% value' },
  { name: 'Upasana', rating: 5, text: 'Highly recommended astrologer, thanks for the positive guidance and detailed analysis, thanks for thorough explanation' },
  { name: 'Premal', rating: 5, text: 'Person on very small lines but delivering the advice that is required 100% value' },
];

const ReviewCard = ({ name, rating, text }) => (
  <div className="review-card mb-3">
    <div className="d-flex align-items-center mb-2">
      <img src={profile} alt="User" className="rounded-circle me-2" style={{ width: '40px', height: '40px' }} />
      <div>
        <strong>{name}</strong><br />
        <span className="text-warning">{'★'.repeat(rating)}</span>
      </div>
    </div>
    <p>{text}</p>
  </div>
  
);
const profile = "/images/userprofile.png";
const Reviews = () => (
  <div className="col-md-6 col-12">
    <div className="d-flex justify-content-between align-items-center m-3 py-2 px-3 bg-light rounded border">
        <h5>User Reviews</h5>
        <div>
          <button className="btn btn-outline-warning btn-sm me-2">Most helpful</button>
          <button className="btn btn-outline-warning btn-sm">Most recent</button>
        </div>
      </div>
    <div className='review-driver'>
      
      {reviewsData.map((review, index) => (
        <ReviewCard key={index} {...review} />
      ))}
    </div>
  </div>
);

export default Reviews;
