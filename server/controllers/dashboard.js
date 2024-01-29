const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const { plaidClient } = require("./plaid");

const User = require("../models/user");
const Item = require("../models/item");
const Account = require("../models/account");
const Transaction = require("../models/transaction");
const Budget = require("../models/budget");

exports.dashboard_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);
  const items = await Item.find({ user: user });
  const numOfItems = items.length;

  res.json({
    title: "Dashboard",
    user: user,
    numOfItems: numOfItems,
    items: items,
  });
});

exports.accounts_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);
  const items = await Item.find({ user: user });
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

exports.transaction_put = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);

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
    )
      transaction.modifiedCategory = req.body.modifiedCategory;
    // transaction.markModified("modifiedName");
    await transaction.save();
  } catch (err) {
    console.log(err);
    res.status(401).json({
      err: err,
    });
    return;
  }

  res.json({
    message: "Transaction updated",
  });
});

exports.profile_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);
  res.json({
    user: user,
  });
});

exports.categories_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);
  const budget = await Budget.findOne({ user: user });

  res.json({
    budget: budget,
  });
});
