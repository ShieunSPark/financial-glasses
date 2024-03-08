import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { Transition } from "@headlessui/react";

export default function YearDropdown({
  earliestYear,
  selectedYear,
  setSelectedYear,
  earliestMonthNum,
  selectedMonthNum,
  setSelectedMonthNum,
}) {
  const currentYear = new Date().getFullYear();
  const [arrayOfYears, setArrayOfYears] = useState([]);

  useEffect(() => {
    const updateArrayOfYears = async () => {
      if (earliestYear !== 0) {
        const tempArrayOfYears = [];
        // for (let year = earliestYear; year <= currentYear; year++) {
        //   tempArrayOfYears.push(year);
        // }
        for (let year = earliestYear; year <= currentYear; year++) {
          tempArrayOfYears.push({
            value: year,
            label: year,
          });
        }
        setArrayOfYears(tempArrayOfYears);
      }
    };

    updateArrayOfYears();
  }, [earliestYear]);

  const handleChange = (e) => {
    setSelectedYear(Number(e.value));
    if (Number(e.value) === earliestYear && selectedMonthNum < earliestMonthNum)
      setSelectedMonthNum(earliestMonthNum);
    else if (
      Number(e.value) === Number(new Date().getFullYear()) &&
      selectedMonthNum > new Date().getMonth()
    )
      setSelectedMonthNum(new Date().getMonth());

    window.localStorage.setItem("year", e.value);
  };

  const customStyles = {
    option: (base, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...base,
        backgroundColor: isFocused ? "#999999" : "#e5e5e5",
        color: "black",
      };
    },
  };

  return (
    // <select
    //   name="year"
    //   value={selectedYear}
    //   className="p-2 dark:bg-slate-600 "
    //   onChange={handleChange}
    // >
    //   {arrayOfYears.map((year) => (
    //     <option key={year} value={year} className="focus:bg-slate-100">
    //       {year}
    //     </option>
    //   ))}
    // </select>
    <Transition
      appear={true}
      show={arrayOfYears.length > 0}
      enter="transition duration-700 ease-in-out"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition duration-700 ease-in-out"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Select
        //{ year: selectedYear, label: selectedYear }
        defaultValue={arrayOfYears.find((year) => year.value === selectedYear)}
        isSearchable={false}
        options={arrayOfYears}
        styles={customStyles}
        onChange={handleChange}
      />
    </Transition>
  );
}

YearDropdown.propTypes = {
  earliestYear: PropTypes.number,
  selectedYear: PropTypes.number,
  setSelectedYear: PropTypes.func,
  earliestMonthNum: PropTypes.number,
  selectedMonthNum: PropTypes.number,
  setSelectedMonthNum: PropTypes.func,
};
