const asyncHandler = require("express-async-handler");
const {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
} = require("plaid");

const User = require("../models/user");
const Item = require("../models/item");
const Account = require("../models/account");
const Transaction = require("../models/transaction");
const Budget = require("../models/budget");

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";

const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || "";
const PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || "";
const PLAID_PRODUCTS = (
  process.env.PLAID_PRODUCTS || Products.Transactions
).split(",");
const PLAID_OPTIONAL_PRODUCTS = (
  process.env.PLAID_OPTIONAL_PRODUCTS || Products.Liabilities
).split(",");
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || "US").split(
  ","
);

// Connect to the proper environment (sandbox or development)
const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const plaidClient = new PlaidApi(configuration);

exports.create_link_token = asyncHandler(async (req, res, next) => {
  // Get the client_user_id by searching for the current user
  try {
    const user = await User.findById(req.body.user._id);
    const configs = {
      user: {
        // This should correspond to a unique id for the current user.
        client_user_id: user.id,
      },
      client_name: "Financial Glasses",
      products: PLAID_PRODUCTS,
      optional_products: PLAID_OPTIONAL_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: "en",
    };

    if (PLAID_REDIRECT_URI !== "") {
      configs.redirect_uri = PLAID_REDIRECT_URI;
    }

    if (PLAID_ANDROID_PACKAGE_NAME !== "") {
      configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
    }

    const createTokenResponse = await plaidClient.linkTokenCreate(configs);
    res.json(createTokenResponse.data);
  } catch (err) {
    res.status(400).json({
      error: err,
    });
  }
});

// Convert Plaid public token to access token, then add item and account(s) to the database
exports.set_access_token = asyncHandler(async (req, res, next) => {
  // Promise.resolve()
  //   .then(async function () {
  const tokenResponse = await plaidClient.itemPublicTokenExchange({
    public_token: req.body.public_token,
  });

  const USER = req.body.user;
  const ACCESS_TOKEN = tokenResponse.data.access_token;
  const ITEM_ID = tokenResponse.data.item_id;
  try {
    // Get info on the Item (i.e., financial institution log in) the user just connected to
    const resPlaidItem = await plaidClient.itemGet({
      access_token: ACCESS_TOKEN,
    });
    const INSTITUTION_ID = resPlaidItem.data.item.institution_id;

    const resInstitution = await plaidClient.institutionsGetById({
      institution_id: INSTITUTION_ID,
      country_codes: ["US"],
    });
    const NAME = resInstitution.data.institution.name;
    const CURSOR = resInstitution.data.institution.next_cursor;
    const HASMORE = resInstitution.data.institution.has_more;

    // Create new Item and insert access_token and item_id
    let newItem = new Item({
      institution_id: INSTITUTION_ID,
      user: USER,
      name: NAME,
      accessToken: ACCESS_TOKEN,
      item_id: ITEM_ID,
      cursor: CURSOR === undefined ? "" : CURSOR,
      hasMore: HASMORE ? HASMORE : false,
    });

    // Save the item only if it doesn't already exist
    const checkItem = await Item.findOne({
      institution_id: INSTITUTION_ID,
      user: USER,
    });

    if (!checkItem) {
      newItem.save();
    } else {
      // Update newItem to be the item from the database
      newItem = checkItem;
    }

    // Date logic for Capital One CC/loans (requires min_last_updated_datetime field)
    const date = new Date();
    date.setFullYear(date.getFullYear() - 2);

    // Create accounts (but first, use access token to get accounts from Plaid)
    const resAccounts = await plaidClient.accountsBalanceGet({
      access_token: ACCESS_TOKEN,
      options: {
        min_last_updated_datetime: date.toISOString(),
      },
    });

    resAccounts.data.accounts.forEach(async (account) => {
      // Create new account
      const newAccount = new Account({
        account_id: account.account_id,
        user: USER,
        item: newItem,
        name: account.name,
        balance: account.balances.current,
        subtype: account.subtype,
        type: account.type,
      });

      // Save the new account only if it doesn't already exist in the database
      const checkAccount = await Account.find({
        account_id: newAccount.account_id,
        user: USER,
      });

      if (checkAccount.length === 0) {
        newAccount.save();
      }
    });

    res.json({
      message:
        "Set Access Token complete; new financial insitution and corresponding accounts added",
      itemName: newItem.name,
    });
  } catch (err) {
    res.status(403).json({
      error: err,
    });
  }
  // })
  // .catch(next);
});

// Use RegEx to get rid of underscores, uppercase the first letter of each word,
// and make all other letters lowercase. (Used in transaction_sync function below)
const simplifyText = (string) =>
  string.toLowerCase === "tv and movies"
    ? "TV and Movies"
    : string
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (s) => s.toUpperCase())
        .replace(/\b(And|Or)\b/, (s) => s.toLowerCase());

exports.transactions_sync = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);
  const items = await Item.find({ user: user });
  const budget = await Budget.findOne({ user: user });

  // On my desktop PC, this sync function runs too quickly and duplicates transactions,
  // but on my laptop, it runs fine... maybe adding the line below will help?
  // UPDATE: I'm dumb... I disabled cache in the developers tools on my PC... T_T
  try {
    // Using a map() function instead of a for...of loop caused header issues
    // This totally didn't take 4 weeks to figure out...
    for (const item of items) {
      // Get access token and cursor for specified Item
      const accessToken = item.accessToken;
      const cursor = item.cursor;

      const allData = {
        added: [],
        removed: [],
        modified: [],
        nextCursor: cursor,
      };

      // Call Plaid's transaction/sync API
      try {
        let keepGoing = false;
        do {
          const results = await plaidClient.transactionsSync({
            access_token: accessToken,
            cursor: allData.nextCursor,
          });
          const newData = results.data;
          allData.added = allData.added.concat(newData.added);
          allData.modified = allData.modified.concat(newData.modified);
          allData.removed = allData.removed.concat(newData.removed);
          allData.nextCursor = newData.next_cursor;
          keepGoing = newData.has_more;
          // console.log(
          //   `Added: ${newData.added.length} Modified: ${newData.modified.length} Removed: ${newData.removed.length} `
          // );
        } while (keepGoing === true);
      } catch (err) {
        // return res.status(401).json({
        //   error: err.response.data,
        // });
        try {
          const configs = {
            user: {
              client_user_id: user.id,
            },
            client_name: "Financial Glasses",
            country_codes: PLAID_COUNTRY_CODES,
            language: "en",
            // Set accessToken to force Link in update mode!
            access_token: accessToken,
          };

          if (PLAID_REDIRECT_URI !== "") {
            configs.redirect_uri = PLAID_REDIRECT_URI;
          }

          if (PLAID_ANDROID_PACKAGE_NAME !== "") {
            configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
          }

          const createTokenResponse = await plaidClient.linkTokenCreate(
            configs
          );
          return res.json({
            message: "Need to use update mode",
            linkTokenData: createTokenResponse.data,
          });
        } catch (err) {
          return res.status(403).json({
            message: "Issue with update mode",
            error: err,
          });
        }
      }

      // Save added transactions to database
      const localBudget = JSON.parse(JSON.stringify(budget));
      for (const transaction of allData.added) {
        // Get account to add to the transaction
        const account = await Account.findOne({
          account_id: transaction.account_id,
        });

        const duplicateTransaction = await Transaction.findOne({
          transaction_id: transaction.transaction_id,
        });

        if (!duplicateTransaction) {
          // Create new transaction
          const newTransaction = new Transaction({
            transaction_id: transaction.transaction_id,
            user: user,
            item: item,
            account: account,
            name: transaction.merchant_name
              ? transaction.merchant_name
              : transaction.name,
            // Note that positive amount is $ going OUT of the account and negative is $ going INTO the account
            amount: transaction.amount,
            iso_currency_code: transaction.iso_currency_code,
            // Prefer authorized-date
            date: transaction.authorized_date
              ? transaction.authorized_date
              : transaction.date,
            // Break down personal_finance_category and simplify the text
            plaidCategory: {
              primary: simplifyText(
                transaction.personal_finance_category.primary
              ),
              detailed: simplifyText(
                transaction.personal_finance_category.detailed
              ).substring(
                transaction.personal_finance_category.primary.length + 1
              ),
              confidence_level: simplifyText(
                transaction.personal_finance_category.confidence_level
              ),
            },
            pending_transaction_id: transaction.pending_transaction_id,
            is_pending: transaction.pending,
            is_deleted: false,
          });

          await newTransaction.save();

          // Add transaction's value to budget
          const transactionYear = newTransaction.date.getFullYear();
          const transactionMonth = newTransaction.date.getMonth();

          const databaseMonth = localBudget.monthlySpending.find(
            (entry) =>
              entry.year === transactionYear && entry.month === transactionMonth
          );
          // Create new entry for specified month and year if it isn't already in the budget
          if (databaseMonth === undefined) {
            localBudget.monthlySpending.push({
              year: transactionYear,
              month: transactionMonth,
              categories: [
                {
                  name: newTransaction.plaidCategory.detailed
                    ? newTransaction.plaidCategory.detailed
                    : newTransaction.plaidCategory.primary,
                  sum: newTransaction.amount,
                  isTracked: false,
                },
              ],
            });
          } else {
            const databaseCategories = databaseMonth.categories;
            const databaseCategory = databaseCategories.find(
              (category) =>
                category.name === newTransaction.plaidCategory.detailed ||
                category.name === newTransaction.plaidCategory.primary
            );

            // Check if the database does not have the category of new transaction we just made
            if (databaseCategory === undefined) {
              databaseCategories.push({
                name: newTransaction.plaidCategory.detailed
                  ? newTransaction.plaidCategory.detailed
                  : newTransaction.plaidCategory.primary,
                sum: newTransaction.amount,
                isTracked: false,
              });
            } else {
              databaseCategory.sum += newTransaction.amount;
            }
          }
        }
      }
      budget.monthlySpending = localBudget.monthlySpending;
      await budget.save();

      // Update modified transactions in database
      await Promise.all(
        allData.modified.map(async (transaction) => {
          const dbTransaction = await Transaction.find({
            transaction_id: transaction.transaction_id,
          });

          // Update specific parts of the transaction in the database
          dbTransaction.name = transaction.merchant_name
            ? transaction.merchant_name
            : transaction.name;
          dbTransaction.amount = transaction.amount;
          dbTransaction.iso_currency_code = transaction.iso_currency_code;
          dbTransaction.date = transaction.authorized_date
            ? transaction.authorized_date
            : transaction.date;
          dbTransaction.plaidCategory = transaction.personal_finance_category;
          dbTransaction.pending_transaction_id =
            transaction.pending_transaction_id;
          dbTransaction.is_pending = transaction.pending;
          dbTransaction.save();
        })
      );

      // Update removed transactions in database
      await Promise.all(
        allData.removed.map(async (transaction) => {
          const dbTransaction = await Transaction.find({
            transaction_id: transaction.transaction_id,
          });

          dbTransaction.is_deleted = true;
          dbTransaction.save();
        })
      );

      // Update cursor in Item
      item.cursor = allData.nextCursor;
      await item.save();
    }
    res.json({
      message: "Transactions syncing completed",
    });
  } catch (err) {
    res.json({
      error: err,
    });
  }
});
