import { useState } from "react";
import { useCombobox } from "downshift";
import PropTypes from "prop-types";

export default function CategoryDropdown({
  categories,
  // setCategories,
  transaction,
}) {
  // function getCategoriesFilter(inputValue) {
  //   const lowerCasedInputValue = inputValue.toLowerCase();

  //   return function categoriesFilter(category) {
  //     return (
  //       !inputValue ||
  //       category.title.toLowerCase().includes(lowerCasedInputValue)
  //     );
  //   };
  // }
  const [filteredCategories, setFilteredCategories] = useState(categories);

  function stateReducer(state, actionAndChanges) {
    const { type, changes } = actionAndChanges;
    // this prevents the menu from being closed when the user selects an item with 'Enter' or mouse
    switch (type) {
      case useCombobox.stateChangeTypes.InputKeyDownEnter:
      case useCombobox.stateChangeTypes.ItemClick:
        return {
          ...changes, // default Downshift new state changes on item selection.
          isOpen: state.isOpen, // but keep menu open.
          highlightedIndex: state.highlightedIndex, // with the item highlighted.
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
        ? transaction.modifiedCategory.detailed
        : transaction.plaidCategory.detailed,
    initialHighlightedIndex: categories.indexOf(
      "modifiedCategory" in transaction
        ? transaction.modifiedCategory.detailed
        : transaction.plaidCategory.detailed
    ),
    onInputValueChange: ({ inputValue }) => {
      setFilteredCategories(
        categories.filter((category) =>
          // Always filter from the ORIGINAL set of categories, not the filtered set!
          category.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    },
    stateReducer,
  });

  return (
    <div className="relative">
      <div className="flex flex-col gap-1">
        <input
          className="px-3 py-2 bg-green-50 dark:bg-green-900 whitespace-nowrap border rounded focus:outline-none focus:ring focus:border-blue-300"
          type="text"
          id="dropdown-input"
          {...getInputProps({})}
        />
      </div>
      <ul
        className={`absolute w-full bg-white mt-1 shadow-md max-h-80 overflow-auto p-0 z-10 ${
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
            >
              <span>
                {category === category.toUpperCase()
                  ? category
                  : `- ${category}`}
              </span>
            </li>
          ))
        ) : (
          <li className={"text-black py-2 px-3 shadow-sm flex flex-col"}>
            <span>No option</span>
          </li>
        )}
      </ul>
    </div>
  );
}

CategoryDropdown.propTypes = {
  categories: PropTypes.array,
  setCategories: PropTypes.func,
  transaction: PropTypes.object,
};
