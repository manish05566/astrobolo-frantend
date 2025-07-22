import React from "react";
import { Link } from "react-router-dom";
import WalletTransaction from "./walletTranssction";
import PopularRecharge from "./PopularRecharge";
import "./Wallet.css";
function WalletHistory() {
  return (
    <section className="py-5 min-vh-100 mt-5 bg-wallet">
      <div className="container mt-5">
        <h6 className="h4 fw-semibold mb-4 text-center text-md-start">
          Wallet History
        </h6>

        <ul
          className="nav nav-tabs justify-content-center justify-content-md-start border-0"
          id="wallet-tabs"
          role="tablist"
        >
          <li className="nav-item" role="presentation">
            <button
              className=" nav-link active"
              id="wallet-transaction-tab"
              data-bs-toggle="tab"
              data-bs-target="#wallet-transaction"
              type="button"
              role="tab"
              aria-controls="wallet-transaction"
              aria-selected="true"
            >
              Wallet Transaction
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="payment-logs-tab"
              data-bs-toggle="tab"
              data-bs-target="#payment-logs"
              type="button"
              role="tab"
              aria-controls="payment-logs"
              aria-selected="false"
            >
              Payment Logs
            </button>
          </li>
        </ul>

        <div className="tab-content mt-4" id="wallet-tabsContent">
          <div
            className="tab-pane fade show active"
            id="wallet-transaction"
            role="tabpanel"
            aria-labelledby="wallet-transaction-tab"
            tabIndex="0"
          >
            <div className="row">
              <div className="col-12">
                {/* <p>Wallet transaction record 1</p> */}
                <WalletTransaction />
              </div>
            </div>
          </div>

          <div
            className="tab-pane fade"
            id="payment-logs"
            role="tabpanel"
            aria-labelledby="payment-logs-tab"
            tabIndex="0"
          >
            <div className="popular-recharge">
              <PopularRecharge />
            </div>            
          </div>
        </div>
      </div>
    </section>
  );
}

export default WalletHistory;
