const asyncHandler = require("express-async-handler");
const {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
} = require("plaid");

const User = require("../models/user");

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
  /* CHANGE CODE TO LOOK FOR CURRENT USER RATHER THAN "TEST" USER */
  Promise.resolve()
    .then(async function () {
      const user = await User.findById("656f7a8023f531af5e0ca18b");
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

// Convert Plaid public token to access token
exports.set_access_token = asyncHandler(async (req, res, next) => {
  // Get the client_user_id by searching for the current user
  /* CHANGE CODE TO LOOK FOR CURRENT USER RATHER THAN "TEST" USER */
  Promise.resolve()
    .then(async function () {
      const user = await User.findById("656f7a8023f531af5e0ca18b");

      const tokenResponse = await client.itemPublicTokenExchange({
        public_token: req.body.public_token,
      });
      console.log(`tokenResponse: ${tokenResponse}`);

      // Append access_token to user in MongoDB

      // ONLY FOR DEV MODE FOR LEARNING PURPOSES
      res.json({
        access_token: tokenResponse.data.access_token,
      });
    })
    .catch(next);
});
