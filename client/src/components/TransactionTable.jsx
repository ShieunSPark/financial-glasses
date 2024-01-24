import { useContext } from "react";
import PropTypes from "prop-types";

import { UserContext } from "../App";
import CategoryDropdown from "../components/CategoryDropdown";

export default function TransactionTable({
  accountID,
  transactions,
  selectedButton,
  setSelectedButton,
  selectedRef,
  selectedTransactionID,
  setSelectedTransactionID,
  setModifiedName,
  categories,
  setModifiedCategory,
  save,
}) {
  const { user, setUser } = useContext(UserContext);

  return (
    <div>
      <table className="table-fixed w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-400 ">
        <thead className="h-12 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 uppercase sticky top-0">
          <tr>
            <th scope="col" className="w-2/12 px-6 py-3">
              Date
            </th>
            <th scope="col" className="w-4/12 px-6 py-3">
              Name
            </th>
            <th scope="col" className="w-3/12 px-6 py-3">
              Category
            </th>
            <th scope="col" className="w-2/12 text-right px-6 py-3">
              Amount
            </th>
            <th scope="col" className="w-1/12 text-right px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {transactions
            ? transactions
                .filter((transaction) =>
                  accountID !== "all"
                    ? transaction.account.account_id === accountID
                    : true
                )
                .map((transaction) => {
                  // Attach ref to the row I CLICKED on, not the row I'm HOVERING over
                  const refProp =
                    selectedButton === transaction.transaction_id
                      ? { ref: selectedRef }
                      : {};
                  return (
                    <tr
                      key={transaction.transaction_id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 hover:dark:bg-gray-600"
                      onClick={
                        selectedButton === transaction.transaction_id
                          ? (e) => e.stopPropagation()
                          : undefined
                      }
                      onMouseEnter={() =>
                        setSelectedTransactionID(transaction.transaction_id)
                      }
                      onMouseLeave={() => setSelectedTransactionID("")}
                      {...refProp}
                    >
                      <td className="px-6 py-4 truncate">
                        {`${
                          new Date(transaction.date).getMonth() + 1
                        }/${new Date(transaction.date).getDate()}/${new Date(
                          transaction.date
                        ).getFullYear()}`}
                      </td>
                      {selectedButton === transaction.transaction_id ? (
                        <td className="px-3 py-2">
                          <input
                            className="w-full px-3 py-2 bg-green-50 dark:bg-green-900 font-medium text-gray-900 dark:text-white whitespace-nowrap border rounded focus:outline-none focus:ring focus:border-blue-300"
                            type="text"
                            defaultValue={
                              transaction.modifiedName
                                ? transaction.modifiedName
                                : transaction.name
                            }
                            onChange={(e) => setModifiedName(e.target.value)}
                          />
                        </td>
                      ) : (
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white truncate">
                          {transaction.modifiedName
                            ? transaction.modifiedName
                            : transaction.name}
                        </td>
                      )}
                      {selectedButton === transaction.transaction_id ? (
                        <td className="px-3 py-2">
                          <CategoryDropdown
                            categories={categories}
                            // setCategories={setCategories}
                            transaction={transaction}
                            setModifiedCategory={setModifiedCategory}
                          />
                        </td>
                      ) : (
                        <td className="px-6 py-4 truncate">
                          {!transaction.modifiedCategory
                            ? transaction.plaidCategory.detailed
                            : transaction.modifiedCategory.detailed}
                        </td>
                      )}
                      {transaction.amount > 0 ? (
                        <td className="text-right px-6 py-4">
                          ${transaction.amount.toFixed(2)}
                        </td>
                      ) : (
                        <td className="text-green-500 dark:text-green-200 text-right px-6 py-4">
                          -${transaction.amount.toFixed(2) * -1}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        {selectedButton === transaction.transaction_id ? (
                          <button
                            className="text-green-700 dark:text-green-400"
                            onClick={() => save(transaction.transaction_id)}
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            className={`${
                              selectedTransactionID ===
                              transaction.transaction_id
                                ? " "
                                : "hidden "
                            } text-blue-700 dark:text-blue-400`}
                            onClick={() =>
                              setSelectedButton(transaction.transaction_id)
                            }
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
            : null}
        </tbody>
      </table>
    </div>
  );
}

TransactionTable.propTypes = {
  accountID: PropTypes.string,
  transactions: PropTypes.array,
  selectedButton: PropTypes.string,
  setSelectedButton: PropTypes.func,
  selectedRef: PropTypes.any,
  selectedTransactionID: PropTypes.string,
  setSelectedTransactionID: PropTypes.func,
  setModifiedName: PropTypes.func,
  categories: PropTypes.array,
  setModifiedCategory: PropTypes.func,
  save: PropTypes.func,
};
