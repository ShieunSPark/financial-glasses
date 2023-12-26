import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { UserContext } from "../App";
import dashboardRequest from "../api/dashboardRequest";
import accountsRequest from "../api/accountsRequest";
import transactionsRequest from "../api/transactionsRequest";

export default function Transactions() {
  const { user, setUser } = useContext(UserContext);
  const [itemsAndAccounts, setItemsAndAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const navigate = useNavigate();

  // Verify user is logged in
  useEffect(() => {
    const verifyLoggedIn = async () => {
      dashboardRequest().then((data) => {
        if (data.error) {
          navigate("/");
          // Perhaps display a message saying the user is not logged in
        }
      });
    };
    verifyLoggedIn();
  }, []);

  useEffect(() => {
    const getAccounts = async () => {
      const response = await accountsRequest();
      setItemsAndAccounts(response.itemsAndAccounts);
    };

    const getTransactions = async () => {
      const response = await transactionsRequest();
      setTransactions(response.transactions);
    };

    getAccounts();
    getTransactions();
  }, []);

  return (
    <div>
      {itemsAndAccounts
        ? itemsAndAccounts.map((entry) => (
            <div key={entry.item.item_id} className="text-center pt-4 mx-6">
              {entry.accounts.map((account) => (
                <>
                  <div>{account.name}</div>
                  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions
                        ? transactions.map((transaction) => (
                            <>
                              <tr
                                key={transaction.transaction_id}
                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                              >
                                <th
                                  scope="row"
                                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                  {transaction.name}
                                </th>
                                {transaction.amount > 0 ? (
                                  <td className="px-6 py-4">
                                    ${transaction.amount.toFixed(2)}
                                  </td>
                                ) : (
                                  <td className="px-6 py-4">
                                    -${transaction.amount.toFixed(2) * -1}
                                  </td>
                                )}
                                <td className="px-6 py-4">
                                  {transaction.category.primary}
                                </td>
                                <td className="px-6 py-4">
                                  {transaction.date.substring(0, 10)}
                                </td>
                              </tr>
                            </>
                          ))
                        : null}
                    </tbody>
                  </table>
                </>
              ))}
            </div>
          ))
        : null}
    </div>
  );
}
