// Convert production to test
process.env.MONGO_DATABASE_NAME = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");

const app = require("../app");

chai.use(chaiHttp);

const expect = chai.expect;
const should = chai.should;

describe("home", () => {
  it("Check GET /", (done) => {
    chai
      .request(app)
      .get("/")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message", "Financial Glasses");
        done();
      });
  });
});
