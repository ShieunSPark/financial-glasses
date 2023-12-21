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

const APP_PORT = process.env.APP_PORT || 8000;
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";

const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || "";
const PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || "";
const PLAID_PRODUCTS = (
  process.env.PLAID_PRODUCTS || Products.Transactions
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

const client = new PlaidApi(configuration);

exports.create_link_token = asyncHandler(async (req, res, next) => {
  // Get the client_user_id by searching for the current user
  Promise.resolve()
    .then(async function () {
      const user = await User.findById(req.body.user._id);
      const configs = {
        user: {
          // This should correspond to a unique id for the current user.
          client_user_id: user.id,
        },
        client_name: "Financial Glasses",
        products: PLAID_PRODUCTS,
        country_codes: PLAID_COUNTRY_CODES,
        language: "en",
      };

      if (PLAID_REDIRECT_URI !== "") {
        configs.redirect_uri = PLAID_REDIRECT_URI;
      }

      if (PLAID_ANDROID_PACKAGE_NAME !== "") {
        configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
      }

      const createTokenResponse = await client.linkTokenCreate(configs);
      res.json(createTokenResponse.data);
    })
    .catch(next);
});

// Convert Plaid public token to access token, then add item, account(s), and transactions to the database
exports.set_access_token = asyncHandler(async (req, res, next) => {
  Promise.resolve()
    .then(async function () {
      const tokenResponse = await client.itemPublicTokenExchange({
        public_token: req.body.public_token,
      });

      const USER = req.body.user;
      const ACCESS_TOKEN = tokenResponse.data.access_token;
      const ITEM_ID = tokenResponse.data.item_id;
      try {
        // Get info on the Item (i.e., financial institution log in) the user just connected to
        const resPlaidItem = await client.itemGet({
          access_token: ACCESS_TOKEN,
        });
        const INSTITUTION_ID = resPlaidItem.data.item.institution_id;

        const resInstitution = await client.institutionsGetById({
          institution_id: INSTITUTION_ID,
          country_codes: ["US"],
        });
        const NAME = resInstitution.data.institution.name;

        // Create new Item and insert access_token and item_id
        const newItem = new Item({
          institution_id: INSTITUTION_ID,
          user: USER,
          name: NAME,
          accessToken: ACCESS_TOKEN,
          item_id: ITEM_ID,
        });

        // Double check the new item doesn't already exist in the database
        const checkItem = await Item.find({
          institution_id: INSTITUTION_ID,
          user: USER,
        });

        // Skip adding item if the user already added it before
        if (checkItem.length > 0) {
          res.json({
            message: "You already added this financial institution!",
          });
          return;
        } else {
          newItem.save();

          // Create accounts (but first, use access token to get accounts from Plaid)
          const resAccounts = await client.accountsBalanceGet({
            access_token: ACCESS_TOKEN,
          });

          resAccounts.data.accounts.forEach((account) => {
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

            newAccount.save();
          });

          // Sync transactions for the new Item
          // Include logic for cursor later
          const resTransactions = await client.transactionsSync({
            access_token: ACCESS_TOKEN,
            cursor: null,
          });

          const transactions = resTransactions.data.added;
          transactions.forEach(async (transaction) => {
            try {
              // Create new transaction
              const newTransaction = new Transaction({
                transaction_id: transaction.transaction_id,
                user: USER,
                item: newItem,
                // Couldn't figure out how to get Account object here for some reason...
                account_id: transaction.account_id,
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
                // Prefer personal_finance_category
                category: transaction.personal_finance_category,
                pending_transaction_id: transaction.pending_transaction_id,
                is_pending: transaction.pending,
              });

              newTransaction.save();
            } catch (err) {
              console.log("error!");
            }
          });

          res.json({
            message:
              "Set Access Token complete; new financial insitution and corresponding accounts added",
            itemName: newItem.name,
          });
        }
      } catch (err) {
        res.status(403).json({
          error: err,
        });
      }
    })
    .catch(next);
});

exports.accounts_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.session.passport.user);
  const item = await Item.findOne({ user: user });
  if (!item) {
    res.json({
      message: "No accounts",
    });
  } else {
    const access_token = item.accessToken;

    const response = await client.accountsGet({ access_token: access_token });
    const accounts = response.data.accounts;

    res.json({
      title: "Accounts",
      accounts: accounts,
    });
  }
});

exports.transactions_get = asyncHandler(async (req, res, next) => {
  res.json({
    title: "Transactions",
  });
});
