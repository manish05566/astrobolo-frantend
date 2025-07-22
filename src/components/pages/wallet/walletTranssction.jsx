import React, { useEffect, useState } from "react";
import Link from "next/link";
import { endpoints } from "../../../../utils/config";
import { fetchClient } from "../../../../utils/fetchClient";

function WalletTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchWalletData = async () => {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.user?.id;

      if (!token || !userId) return;

      try {
        const res = await fetchClient(`${endpoints.base_url}payment/${userId}/transactions`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();

        if (json.status && json.data) {
          setBalance(json.data.balance || 0);
          setTransactions(json.data.transactions || []);
        } else {
          setBalance(0);
          setTransactions([]);
        }
      } catch (err) {
        console.error("Failed to fetch wallet data", err);
        setBalance(0);
        setTransactions([]);
      }
    };

    fetchWalletData();
  }, []);

  return (
    <div className="p-4 rounded bg-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="h5 mb-0">
          Available balance: <span className="text-success">₹ {balance}</span>
          <Link href="/wallet-recharge" className="btn btn-outline-success btn-sm ms-3">
            Recharge
          </Link>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Description</th>
              <th>Minuts</th>
              <th>Transaction Amount</th>
              <th>Datetime</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">No transactions found</td>
              </tr>
            ) : (
              transactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{'Chat with astrologer'}</td>
                  <td>{transaction.minuts || "-"}</td>
                  <td className="text-success">₹ {transaction.amount}</td>
                  <td>{transaction.datetime}</td>
                  <td className="text-danger">-</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WalletTransaction;
