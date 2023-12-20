const asyncHandler = require("express-async-handler");
const {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
} = require("plaid");

const User = require("../models/user");
const Item = require("../models/item");

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

// Convert Plaid public token to access token
exports.set_access_token = asyncHandler(async (req, res, next) => {
  // Get the client_user_id by searching for the current user
  Promise.resolve()
    .then(async function () {
      const tokenResponse = await client.itemPublicTokenExchange({
        public_token: req.body.public_token,
      });

      const ACCESS_TOKEN = tokenResponse.data.access_token;
      const ITEM_ID = tokenResponse.data.item_id;
      try {
        // Get info on the Item (i.e., financial institution log in) the user just connected to
        const plaidItem = await client.itemGet({ access_token: ACCESS_TOKEN });
        const INSTITUTION_ID = plaidItem.data.item.institution_id;

        const institution = await client.institutionsGetById({
          institution_id: INSTITUTION_ID,
          country_codes: ["US"],
        });
        const NAME = institution.data.institution.name;

        // Create new Item and insert access_token and item_id
        const newItem = new Item({
          institution_id: INSTITUTION_ID,
          name: NAME,
          accessToken: ACCESS_TOKEN,
          item_id: ITEM_ID,
        });

        newItem.save();
      } catch (err) {
        console.log(err.data);
      }

      // Do NOT send accessToken to client!!!
      res.json({
        message: "Set Access Token complete",
      });
    })
    .catch(next);
});
