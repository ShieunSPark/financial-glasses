import { useEffect, useState } from "react";
import { useCombobox } from "downshift";
import PropTypes from "prop-types";

import categoriesRequest from "../api/monthlySpendingRequest";

export default function CategoryDropdown({
  index,
  numOfRows,
  transaction,
  setModified,
}) {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState(categories);

  // Set up categories
  useEffect(() => {
    const getCategories = async () => {
      const response = await categoriesRequest();
      const fullList = [];
      response.budget.categories.map((category) => {
        fullList.push(category.primary.toUpperCase());
        category.detailed.map((detailed) => {
          fullList.push(detailed);
        });
      });
      setCategories(fullList);
      setFilteredCategories(fullList);
    };

    getCategories();
  }, []);

  // Right now, this does a weird thing where the first time you click the input,
  // it doesn't scroll to where the text is. But when you click off and then on the input again,
  // it jumps to the highlighted text... I'm so confused
  function stateReducer(state, actionAndChanges) {
    const { type, changes } = actionAndChanges;
    switch (type) {
      case useCombobox.stateChangeTypes.InputKeyDownEnter:
      case useCombobox.stateChangeTypes.ItemClick:
        // console.log(`state: ${state.selectedItem}`);
        // console.log(`changes: ${changes.selectedItem}`);
        return {
          ...changes, // default Downshift new state changes on item selection.
        };
      default:
        return changes; // otherwise business as usual.
    }
  }

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    selectedItem,
  } = useCombobox({
    items: filteredCategories,
    initialInputValue:
      "modifiedCategory" in transaction
        ? transaction.modifiedCategory
        : !transaction.plaidCategory
        ? ""
        : transaction.plaidCategory.detailed,
    initialSelectedItem:
      "modifiedCategory" in transaction
        ? transaction.modifiedCategory
        : !transaction.plaidCategory
        ? ""
        : transaction.plaidCategory.detailed,
    initialHighlightedIndex: categories.indexOf(
      "modifiedCategory" in transaction
        ? transaction.modifiedCategory
        : !transaction.plaidCategory
        ? ""
        : transaction.plaidCategory.detailed
    ),
    onInputValueChange: ({ inputValue }) => {
      setFilteredCategories(
        categories.filter((category) =>
          // Always filter from the ORIGINAL set of categories, not the filtered set!
          category.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
      if (categories.includes(inputValue)) setModified(inputValue);
    },
    stateReducer,
  });

  useEffect(() => {
    setFilteredCategories(categories);
  }, [isOpen]);

  return (
    <div className="modal relative">
      <div className="flex flex-col gap-1">
        <input
          className="px-3 py-2 bg-green-50 dark:bg-green-900 whitespace-nowrap border rounded focus:outline-none focus:ring focus:border-blue-300"
          type="text"
          id="dropdown-input"
          {...getInputProps({})}
        />
      </div>

      <ul
        className={`absolute w-full bg-white ${
          index >= numOfRows / 2 ? "bottom-full" : null
        } mt-1 shadow-md max-h-72 overflow-auto p-0 z-10 ${
          !isOpen && "hidden"
        }`}
        {...getMenuProps()}
      >
        {isOpen && filteredCategories.length > 0 ? (
          filteredCategories.map((category, index) => (
            <li
              className={`
                ${highlightedIndex === index ? "bg-blue-300" : ""} 
                ${selectedItem === category ? "font-bold" : ""} 
                text-black py-2 px-3 shadow-sm flex flex-col`}
              key={category + index}
              {...getItemProps({
                category,
                index,
              })}
              // onClick={() => {
              //   setHighlightedIndex(index);
              //   selectItem(category);
              //   setFilteredCategories(categories);
              // }}
            >
              <span>
                {category === category.toUpperCase()
                  ? category
                  : `- ${category}`}
              </span>
            </li>
          ))
        ) : (
          <li className={"text-black italic py-2 px-3 shadow-sm flex flex-col"}>
            <span>No option</span>
          </li>
        )}
      </ul>
    </div>
  );
}

CategoryDropdown.propTypes = {
  categories: PropTypes.array,
  transaction: PropTypes.object,
  setModified: PropTypes.func,
};
