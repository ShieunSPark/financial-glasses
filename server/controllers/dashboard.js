const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const { plaidClient } = require("./plaid");

const User = require("../models/user");
const Item = require("../models/item");
const Account = require("../models/account");
const Transaction = require("../models/transaction");
const Budget = require("../models/budget");

exports.dashboard_get = asyncHandler(async (req, res, next) => {
  console.log(`req.session.passport: ${req.session.passport}`);
  const user = await User.findById(req.session.passport.user);
  const items = await Item.find({ user: user });
  const numOfItems = items.length;
  const budget = await Budget.findOne({ user: user });

  console.log(`dashboard/get: ${user}`);
  // For development; probably can remove in production as a budget is made
  // at the /signup route
  if (!budget) {
    const newBudget = new Budget({
      user: user,
    });
    await newBudget.save();
  }

  res.json({
    title: "Dashboard",
    user: user,
    numOfItems: numOfItems,
    items: items,
  });
});

exports.accounts_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);
  const items = await Item.find({ user: user }).sort({ name: 1 });
  const accounts = await Account.find({ user: user })
    .populate("item")
    .sort({ name: 1 });
  if (accounts.length === 0) {
    res.json({
      message: "No accounts",
    });
  } else {
    // Sort accounts by their respective item
    const itemsAndAccounts = [];
    items.forEach((item) => {
      const entry = {
        item: item,
        accounts: [],
      };

      accounts.forEach((account) => {
        if (account.item.id === item.id) {
          entry.accounts.push(account);
        }
      });

      itemsAndAccounts.push(entry);
    });

    res.json({
      title: "Accounts",
      itemsAndAccounts: itemsAndAccounts,
    });
  }
});

exports.account_delete = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);

  try {
    const account = await Account.findOneAndDelete({
      account_id: req.body.accountID,
      user: user,
    }).populate("item");
    await Transaction.deleteMany({ account: account, user: user });

    // Delete item if no accounts remain for that specific item
    const accountsInItem = await Account.find({
      item: account.item,
      user: user,
    });
    if (accountsInItem.length === 0) {
      await Item.findByIdAndDelete(account.item.id);
    }

    res.json({
      message: "Account and corresponding transactions deleted",
    });
  } catch (err) {
    res.json({
      error: err,
    });
  }
});

exports.transactions_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);
  if (!user) {
    res.json({
      message: "No transactions",
    });
  } else {
    // Find non-deleted transactions for specified user and item in database
    const transactions = await Transaction.find({
      user: user,
      is_deleted: false,
    })
      .populate("account")
      .sort({
        date: -1,
      });

    res.json({
      title: "Transactions",
      transactions: transactions,
    });
  }
});

// Function to clean up all caps primary categories text (e.g., TRAVEL -> Travel)
const simplifyText = (string) =>
  string.toLowerCase === "tv and movies"
    ? "TV and Movies"
    : string
        .toLowerCase()
        .replace(/\b\w/g, (s) => s.toUpperCase())
        .replace(/\b(And|Or)\b/, (s) => s.toLowerCase());

exports.transaction_put = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);
  const budget = await Budget.findOne({ user: user });

  // let updatedBudget;
  let initialCategory, newCategory, amount, selectedMonthNum, selectedYear;
  let categoryWasModified = false;

  try {
    // Update the modified name or modified category of the transaction
    const transaction = await Transaction.findOne({
      transaction_id: req.params.transaction_id,
    });
    if (
      req.body.modifiedName !== "" &&
      transaction.modifiedName !== req.body.modifiedName
    )
      transaction.modifiedName = req.body.modifiedName;
    if (
      req.body.modifiedCategory !== "" &&
      transaction.modifiedCategory !== req.body.modifiedCategory
    ) {
      initialCategory = transaction.modifiedCategory;
      amount = transaction.amount;
      selectedYear = transaction.date.getFullYear();
      selectedMonthNum = transaction.date.getMonth();
      newCategory = simplifyText(req.body.modifiedCategory);
      transaction.modifiedCategory = newCategory;
      categoryWasModified = true;
    }
    await transaction.save();

    if (categoryWasModified) {
      // Update budget to subtract the amount from its previous category
      // and add the amount to the new category
      const localBudget = JSON.parse(JSON.stringify(budget));

      const transactionYear = transaction.date.getFullYear();
      const transactionMonth = transaction.date.getMonth();

      const databaseMonth = localBudget.monthlySpending.find(
        (entry) =>
          entry.year === transactionYear && entry.month === transactionMonth
      );
      const databaseCategories = databaseMonth.categories;
      const databaseInitialCategory = databaseCategories.find(
        (category) => category.name === initialCategory
      );

      databaseInitialCategory.sum -= amount;
      // Remove the initial category from monthlySpending if it is $0
      if (databaseInitialCategory.sum === 0) {
        databaseCategories.splice(
          databaseCategories.findIndex(({ name }) => name === initialCategory),
          1
        );
      }

      // Update new category. Make a category in budget if necessary
      const databaseNewCategory = databaseCategories.find(
        (category) => category.name === newCategory
      );

      if (databaseNewCategory === undefined) {
        databaseCategories.push({
          name: newCategory,
          sum: amount,
          isTracked: false,
        });
      } else {
        databaseNewCategory.sum += amount;
      }

      budget.monthlySpending = localBudget.monthlySpending;
      await budget.save();

      /*
      updatedBudget = await Budget.findOneAndUpdate(
        { user: user },
        {
          $inc: {
            "monthlySpending.$[entry].categories.$[trackedCategory].sum":
              -1 * amount,
          },
        },
        {
          arrayFilters: [
            {
              $and: [
                { "entry.month": selectedMonthNum },
                { "entry.year": selectedYear },
              ],
            },
            { "trackedCategory.name": initialCategory },
          ],
          new: true,
        }
      );
      */
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({
      err: err,
    });
    return;
  }

  res.json({
    message: "Transaction and budget updated",
  });
});

exports.dashboard_chart = asyncHandler(async (req, res, next) => {
  const monthTransactions = await Transaction.find({
    date: {
      $gte:
        new Date().getMonth() < 10
          ? // Be sure to do getMonth() + 1 to correctly track the current month
            `${new Date().getFullYear()}-0${new Date().getMonth() + 1}-01`
          : `${new Date().getFullYear()}-${new Date().getMonth() + 1}-01`,
    },
  });

  const categoriesSum = [];
  monthTransactions.forEach((transaction) => {
    if (
      categoriesSum.find(
        (item) =>
          item.category ===
          (transaction.modifiedCategory
            ? transaction.modifiedCategory
            : transaction.plaidCategory.detailed)
      ) === undefined
    )
      categoriesSum.push({
        category: transaction.modifiedCategory
          ? transaction.modifiedCategory
          : transaction.plaidCategory.detailed,
        total: transaction.amount,
      });
    else {
      categoriesSum.find(
        (item) =>
          item.category ===
          (transaction.modifiedCategory
            ? transaction.modifiedCategory
            : transaction.plaidCategory.detailed)
      ).total += transaction.amount;
    }
  });

  res.json({
    categoriesSum: categoriesSum,
  });
});

exports.monthlySpending_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);
  const budget = await Budget.findOne({ user: user });

  // Separating comparison logic for year and month since trying to filter by two
  // conditions won't work with shorthand (a, b) => a - b
  budget.monthlySpending.sort((a, b) => {
    // Sort by year first
    if (a.year < b.year) {
      return -1;
    }
    if (a.year > b.year) {
      return 1;
    }
    // Sort by month second
    if (a.month < b.month) {
      return -1;
    }
    if (a.month > b.month) {
      return 1;
    }
    return 0;
  });

  res.json({
    budget: budget,
  });
});

exports.budget_put = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);
  const { selectedMonthNum, selectedYear, trackedCategory, budgetAmount } =
    req.body;

  const updatedBudget = await Budget.findOneAndUpdate(
    { user: user },
    {
      $set: {
        "monthlySpending.$[entry].categories.$[trackedCategory].isTracked": true,
        "monthlySpending.$[entry].categories.$[trackedCategory].budgetAmount":
          budgetAmount,
      },
    },
    {
      arrayFilters: [
        {
          $and: [
            { "entry.month": selectedMonthNum },
            { "entry.year": selectedYear },
          ],
        },
        { "trackedCategory.name": trackedCategory },
      ],
      new: true,
    }
  );

  res.json({
    budget: updatedBudget,
  });
});

exports.budget_delete = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);

  const { selectedMonthNum, selectedYear, trackedCategory } = req.body;

  const updatedBudget = await Budget.findOneAndUpdate(
    { user: user },
    {
      $set: {
        "monthlySpending.$[entry].categories.$[trackedCategory].isTracked": false,
        "monthlySpending.$[entry].categories.$[trackedCategory].budgetAmount": 0,
      },
      // $pull: {
      //   trackedCategories: {
      //     trackedCategory: req.body.trackedCategory,
      //   },
      // },
    },
    {
      arrayFilters: [
        {
          $and: [
            { "entry.month": selectedMonthNum },
            { "entry.year": selectedYear },
          ],
        },
        { "trackedCategory.name": trackedCategory },
      ],
      new: true,
    }
  );

  res.json({
    budget: updatedBudget,
  });
});

exports.profile_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);
  res.json({
    user: user,
  });
});
