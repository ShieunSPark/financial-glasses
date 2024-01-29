import { useContext, useState } from "react";
import PropTypes from "prop-types";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { UserContext } from "../App";
import CategoryDropdown from "../components/CategoryDropdown";

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor((row) => row.date, {
    id: "date",
    header: () => "Date",
    cell: (info) => (
      <div className="px-6 py-4 truncate">
        {`${new Date(info.renderValue()).getMonth() + 1}/${new Date(
          info.renderValue()
        ).getDate()}/${new Date(info.renderValue()).getFullYear()}`}
      </div>
    ),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor((row) => row.name, {
    id: "name",
    header: () => "Name",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor((row) => row.plaidCategory.detailed, {
    id: "category",
    header: () => "Category",
    // Might need to double check it's info or info.detailed
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor((row) => row.amount, {
    id: "amount",
    header: () => "Amount",
    cell: (info) =>
      info.renderValue() > 0 ? (
        <div className="text-right px-6 py-4">
          ${info.renderValue().toFixed(2)}
        </div>
      ) : (
        <div className="text-green-500 dark:text-green-200 text-right px-6 py-4">
          -${info.renderValue().toFixed(2) * -1}
        </div>
      ),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("", {
    id: "edit-save",
    cell: () => <div>Edit</div>,
    footer: (info) => info.column.id,
  }),
];

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
  const [data, setData] = useState(() => [...transactions]);
  const { user, setUser } = useContext(UserContext);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <table className="table-fixed w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-400 ">
        <thead className="h-12 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 uppercase sticky top-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className={`${
                    header.id === "date"
                      ? "px-6 py-3 w-2/12"
                      : header.id === "name"
                      ? "w-4/12"
                      : header.id === "category"
                      ? "w-3/12"
                      : header.id === "amount"
                      ? "px-6 py-3 w-2/12 text-right"
                      : "w-1/12 text-right"
                  }`}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const refProp =
              selectedButton === row.original.transaction_id
                ? { ref: selectedRef }
                : {};
            return (
              <tr
                key={row.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 hover:dark:bg-gray-600"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Pagination */}
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      {/* <table className="table-fixed w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-400 ">
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
                            transaction={transaction}
                            setModifiedCategory={setModifiedCategory}
                          />
                        </td>
                      ) : (
                        <td className="px-6 py-4 truncate">
                          {!transaction.modifiedCategory
                            ? transaction.plaidCategory.detailed
                            : transaction.modifiedCategory}
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
      </table> */}
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
