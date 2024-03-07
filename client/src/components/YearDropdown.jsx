import { useEffect, useState } from "react";
import PropTypes from "prop-types";

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
        for (let year = earliestYear; year <= currentYear; year++) {
          tempArrayOfYears.push(year);
        }
        setArrayOfYears(tempArrayOfYears);
      }
    };

    updateArrayOfYears();
  }, [earliestYear]);

  const handleChange = (e) => {
    setSelectedYear(Number(e.target.value));
    if (
      Number(e.target.value) === earliestYear &&
      selectedMonthNum < earliestMonthNum
    )
      setSelectedMonthNum(earliestMonthNum);
    else if (
      Number(e.target.value) === Number(new Date().getFullYear()) &&
      selectedMonthNum > new Date().getMonth()
    )
      setSelectedMonthNum(new Date().getMonth());

    window.localStorage.setItem("year", e.target.value);
  };

  return (
    <select
      name="year"
      value={selectedYear}
      className="p-2"
      onChange={handleChange}
    >
      {arrayOfYears.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
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
