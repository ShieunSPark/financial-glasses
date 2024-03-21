import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Transition } from "@headlessui/react";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import CategoryDropdown from "../Dropdown/CategoryDropdown";

export default function DashboardTable({ transactions }) {
  const [data, setData] = useState(() => [...transactions]);

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
    ],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Transition
      appear={true}
      show={true}
      enter="transition duration-300 ease-in-out delay-200"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition duration-300 ease-in-out"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="flex justify-center h-[300px] w-[90%] mb-4 mx-auto">
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
              {table.getRowModel().rows.map((row, index) => {
                return (
                  <tr
                    key={row.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 hover:dark:bg-gray-600"
                  >
                    {row.getVisibleCells().map((cell) => {
                      if (cell.column.id === "name") {
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
                      } else if (cell.column.id === "category") {
                        return (
                          <td key={cell.id} className="px-6 py-4 truncate">
                            {!row.original.modifiedCategory
                              ? row.original.plaidCategory.detailed
                              : row.original.modifiedCategory}
                          </td>
                        );
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
      </div>
    </Transition>
  );
}

DashboardTable.propTypes = {
  transactions: PropTypes.array,
};
