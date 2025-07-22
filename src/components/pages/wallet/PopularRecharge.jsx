import React from "react";

const rechargeOptions = [
  { amount: 50, extra: 50 },
  { amount: 100, extra: 100, popular: true },
  { amount: 200, extra: 100 },
  { amount: 500, extra: 250 },
  { amount: 1000, extra: 50, popular: true  },
  { amount: 2000, extra: 200 },
  { amount: 3000, extra: 300 },
  { amount: 4000, extra: 480},
  { amount: 8000, extra: 960 },
  { amount: 15000, extra: 2250 },
  { amount: 20000, extra: 3000 },
  { amount: 50000, extra: 10000 },
  { amount: 100000, extra: 20000 },
];

const PopularRecharge = () => {
  return (
    <section className="py-5 min-vh-100 mt-5 bg-wallet">
      <div className="container mt-5">
        <h6 className="h4 fw-semibold mb-4">Popular Recharge</h6>
        <div className="row g-3">
          {rechargeOptions.map((option, index) => (
            <div key={index} className="col-6 col-md-3 col-lg-2">
              <div className="card text-center position-relative h-100">
                {option.popular && (
                  <img
                    src="https://aws.astrotalk.com/assets/images/most-popular.webp"
                    width="70"
                    height="20"
                    alt="popular"
                    className="position-absolute top-0 start-50 translate-middle-x"
                    style={{ transform: "translate(-50%, -50%)" }}
                  />
                )}
                <div className="card-body d-flex flex-column justify-content-center">
                  <h5 className="card-title mb-2 mt-1">&#8377; {option.amount}</h5>
                  <p className="card-text text-success small mb-0">&#8377; {option.extra} Extra</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularRecharge;
