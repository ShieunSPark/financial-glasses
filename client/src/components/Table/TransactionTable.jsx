import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Transition } from "@headlessui/react";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import CategoryDropdown from "../Dropdown/CategoryDropdown";

export default function TransactionTable({
  show,
  transactions,
  selectedButton,
  setSelectedButton,
  selectedRef,
  highlightedTransaction,
  setHighlightedTransaction,
  setModifiedName,
  setModifiedCategory,
  save,
}) {
  const [data, setData] = useState(() => [...transactions]);
  const skipPageResetRef = useRef();

  // This updates data when editing a transaction object
  useEffect(() => {
    skipPageResetRef.current = true;
    setData([...transactions]);
  }, [transactions]);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.date, {
        id: "date",
        header: () => "Date",
        cell: (info) => (
          <div className="px-6 py-4 truncate">
            {`${new Date(info.renderValue()).getMonth() + 1}/${
              new Date(info.renderValue()).getDate() + 1
            }/${new Date(info.renderValue()).getFullYear()}`}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor(
        (row) => (row.modifiedName ? row.modifiedName : row.name),
        {
          id: "name",
          header: () => "Name",
          cell: (info) => info.getValue(),
          footer: (info) => info.column.id,
        }
      ),
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
        cell: () => "",
        footer: (info) => info.column.id,
      }),
    ],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex: !skipPageResetRef.current,
    autoResetExpanded: !skipPageResetRef.current,
  });

  if (show)
    return (
      <Transition
        appear={true}
        show={show}
        enter="transition duration-300 ease-in-out delay-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition duration-300 ease-in-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="flex flex-col justify-between h-[650px]">
          <div className="overflow-y-auto">
            <table className="h-5/6 table-fixed w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-400 ">
              <thead className="h-12 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-400 uppercase sticky top-0">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        scope="col"
                        className={`px-6 py-3 ${
                          header.id === "date"
                            ? "w-2/12"
                            : header.id === "name"
                            ? "w-4/12"
                            : header.id === "category"
                            ? "w-3/12"
                            : header.id === "amount"
                            ? "w-2/12 text-right"
                            : "w-1/12 text-right"
                        }`}
                      >
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : "",
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted().toString()] ?? null}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, index) => {
                  const refProp =
                    selectedButton === row.original.transaction_id
                      ? { ref: selectedRef }
                      : {};
                  return (
                    <tr
                      key={row.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 hover:dark:bg-gray-600"
                      onClick={
                        selectedButton === row.original.transaction_id
                          ? (e) => e.stopPropagation()
                          : undefined
                      }
                      onMouseEnter={() =>
                        setHighlightedTransaction(row.original.transaction_id)
                      }
                      onMouseLeave={() => setHighlightedTransaction("")}
                      {...refProp}
                    >
                      {row.getVisibleCells().map((cell) => {
                        if (cell.column.id === "name") {
                          if (selectedButton === row.original.transaction_id) {
                            return (
                              <td key={cell.id} className="px-3 py-2">
                                <input
                                  className="w-full px-3 py-2 bg-green-50 dark:bg-green-900 font-medium text-gray-900 dark:text-white whitespace-nowrap border rounded focus:outline-none focus:ring focus:border-blue-300"
                                  type="text"
                                  defaultValue={
                                    row.original.modifiedName
                                      ? row.original.modifiedName
                                      : row.original.name
                                  }
                                  onChange={(e) =>
                                    setModifiedName(e.target.value)
                                  }
                                />
                              </td>
                            );
                          } else {
                            return (
                              <td
                                key={cell.id}
                                className="px-6 py-4 font-medium text-gray-900 dark:text-white truncate"
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </td>
                            );
                          }
                        } else if (cell.column.id === "category") {
                          if (selectedButton === row.original.transaction_id) {
                            return (
                              <td key={cell.id} className="px-3 py-2">
                                <CategoryDropdown
                                  index={index}
                                  numOfRows={table.getRowModel().rows.length}
                                  transaction={row.original}
                                  setModified={setModifiedCategory}
                                />
                              </td>
                            );
                          } else {
                            return (
                              <td key={cell.id} className="px-6 py-4 truncate">
                                {!row.original.modifiedCategory
                                  ? row.original.plaidCategory.detailed
                                  : row.original.modifiedCategory}
                              </td>
                            );
                          }
                        } else if (cell.column.id === "edit-save") {
                          if (selectedButton === row.original.transaction_id) {
                            return (
                              <td key={cell.id} className="px-6 py-4">
                                <button
                                  className="text-green-700 dark:text-green-400"
                                  onClick={() =>
                                    save(row.original.transaction_id)
                                  }
                                >
                                  Save
                                </button>
                              </td>
                            );
                          } else {
                            return (
                              <td key={cell.id} className="px-6 py-4">
                                <button
                                  className={`${
                                    highlightedTransaction ===
                                    row.original.transaction_id
                                      ? " "
                                      : "hidden "
                                  } text-blue-700 dark:text-blue-400`}
                                  onClick={() =>
                                    setSelectedButton(
                                      row.original.transaction_id
                                    )
                                  }
                                >
                                  Edit
                                </button>
                              </td>
                            );
                          }
                        } else {
                          return (
                            <td key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          );
                        }
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 p-2">
            <button
              className={`border rounded p-1 ${
                table.getCanPreviousPage()
                  ? "dark:hover:bg-slate-500 hover:bg-slate-200"
                  : null
              } `}
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </button>
            <button
              className={`border rounded p-1 ${
                table.getCanPreviousPage()
                  ? "dark:hover:bg-slate-500 hover:bg-slate-200"
                  : null
              } `}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </button>
            <button
              className={`border rounded p-1 ${
                table.getCanNextPage()
                  ? "dark:hover:bg-slate-500 hover:bg-slate-200"
                  : null
              } `}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
            </button>
            <button
              className={`border rounded p-1 ${
                table.getCanNextPage()
                  ? "dark:hover:bg-slate-500 hover:bg-slate-200"
                  : null
              } `}
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
                min={1}
                max={table.getPageCount()}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(page);
                }}
                className="text-black border p-1 rounded w-16"
              />
            </span>
            <select
              className="text-black"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize} className="text-black">
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Transition>
    );
  return;
}

TransactionTable.propTypes = {
  show: PropTypes.bool,
  accountID: PropTypes.string,
  transactions: PropTypes.array,
  selectedButton: PropTypes.string,
  setSelectedButton: PropTypes.func,
  selectedRef: PropTypes.any,
  highlightedTransaction: PropTypes.string,
  setHighlightedTransaction: PropTypes.func,
  setModifiedName: PropTypes.func,
  categories: PropTypes.array,
  setModifiedCategory: PropTypes.func,
  save: PropTypes.func,
};
