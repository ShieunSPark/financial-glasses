const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// This is to set up the base categories per user - and thus,
// used in the User model
const allCategories = [
  {
    primary: "Income",
    detailed: [
      "Dividends",
      "Interest Earned",
      "Retirement Pension",
      "Tax Refund",
      "Unemployment",
      "Wages",
      "Other Income",
    ],
  },
  {
    primary: "Transfer In",
    detailed: [
      "Cash Advances and Loans",
      "Deposit",
      "Investment and Retirement Funds",
      "Savings",
      "Account Transfer",
      "Other Transfer In",
    ],
  },
  {
    primary: "Transfer Out",
    detailed: [
      "Investment and Retirement Funds",
      "Savings",
      "Withdrawal",
      "Account Transfer",
      "Other Transfer Out",
    ],
  },
  {
    primary: "Loan Payments",
    detailed: [
      "Car Payment",
      "Credit Card Payment",
      "Personal Loan Payment",
      "Mortgage Payment",
      "Student Loan Payment",
      "Other Payment",
    ],
  },
  {
    primary: "Bank Fees",
    detailed: [
      "Atm Fees",
      "Foreign Transaction Fees",
      "Insufficient Funds",
      "Interest Charge",
      "Overdraft Fees",
      "Other Bank Fees",
    ],
  },
  {
    primary: "Entertainment",
    detailed: [
      "Casinos and Gambling",
      "Music and Audio",
      "Sporting Events Amusement Parks and Museums",
      "Tv and Movies",
      "Video Games",
      "Other Entertainment",
    ],
  },
  {
    primary: "Food and Drink",
    detailed: [
      "Beer Wine and Liquor",
      "Coffee",
      "Fast Food",
      "Groceries",
      "Restaurant",
      "Vending Machines",
      "Other Food and Drink",
    ],
  },
  {
    primary: "General Merchandise",
    detailed: [
      "Bookstores and Newsstands",
      "Clothing and Accessories",
      "Convenience Stores",
      "Department Stores",
      "Discount Stores",
      "Electronics",
      "Gifts and Novelties",
      "Office Supplies",
      "Online Marketplaces",
      "Pet Supplies",
      "Sporting Goods",
      "Superstores",
      "Tobacco and Vape",
      "Other General Merchandise",
    ],
  },
  {
    primary: "Home Improvement",
    detailed: [
      "Furniture",
      "Hardware",
      "Repair and Maintenance",
      "Security",
      "Other Home Improvement",
    ],
  },
  {
    primary: "Medical",
    detailed: [
      "Dental Care",
      "Eye Care",
      "Nursing Care",
      "Pharmacies and Supplements",
      "Primary Care",
      "Veterinary Services",
      "Other Medical",
    ],
  },
  {
    primary: "Personal Care",
    detailed: [
      "Gyms and Fitness Centers",
      "Hair and Beauty",
      "Laundry and Dry Cleaning",
      "Other Personal Care",
    ],
  },
  {
    primary: "General Services",
    detailed: [
      "Accounting and Financial Planning",
      "Automotive",
      "Childcare",
      "Consulting and Legal",
      "Education",
      "Insurance",
      "Postage and Shipping",
      "Storage",
      "Other General Services",
    ],
  },
  {
    primary: "Government and Non Profit",
    detailed: [
      "Donations",
      "Government Departments and Agencies",
      "Tax Payment",
      "Other Government and Non Profit",
    ],
  },
  {
    primary: "Transportation",
    detailed: [
      "Bikes and Scooters",
      "Gas",
      "Parking",
      "Public Transit",
      "Taxis and Ride Shares",
      "Tolls",
      "Other Transportation",
    ],
  },
  {
    primary: "Travel",
    detailed: ["Flights", "Lodging", "Rental Cars", "Other Travel"],
  },
  {
    primary: "Rent and Utilities",
    detailed: [
      "Gas and Electricity",
      "Internet and Cable",
      "Rent",
      "Sewage and Waste Management",
      "Telephone",
      "Water",
      "Other Utilities",
    ],
  },
];

/* // The logic used to get all primary and detailed categories without manually copying/pasting
// const { open } = require("node:fs/promises");

// const simplifyText = (string) =>
//   string
//     .replace(/_/g, " ")
//     .toLowerCase()
//     .replace(/\b\w/g, (s) => s.toUpperCase())
//     .replace(/\b(And|Or)\b/, (s) => s.toLowerCase());

// (async () => {
//   const file = await open(
//     "Z:/Shieun Folder/Code/financial-glasses/server/csv/transactions-personal-finance-category-taxonomy.csv"
//   );

//   const categories = [];
//   let prevCategory = "Income";
//   let row = {
//     primary: "Income",
//     detailed: [],
//   };
//   let rowNum = 0;

//   for await (const line of file.readLines()) {
//     if (rowNum > 0) {
//       const rowItems = line.split(",");
//       const main = simplifyText(rowItems[0].toString());
//       const subMain = simplifyText(
//         rowItems[1].toString().substring(rowItems[0].length + 1)
//       );

//       if (main !== prevCategory) {
//         categories.push(row);
//         row = {};
//         row.primary = main;
//         row.detailed = [];
//       }
//       row.detailed.push(subMain);

//       if (rowNum === 104) categories.push(row);
//       prevCategory = main;
//     }
//     rowNum++;
//   }

//   console.log(categories);
// })();
*/

const BudgetSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  categories: { type: Array, required: true, default: allCategories },
  trackedCategories: { type: Array, required: true, default: [] },
  // monthlySpending: { type: Array, default: [] },
});

// Virtual for budget's URL
BudgetSchema.virtual("url").get(function () {
  return `/budget/${this._id}`;
});

module.exports = mongoose.model("Budget", BudgetSchema);
