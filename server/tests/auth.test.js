// Convert production to test
process.env.MONGO_DATABASE_NAME = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");

const app = require("../app");
const User = require("../models/user");

chai.use(chaiHttp);

const expect = chai.expect;
const should = chai.should;

before(async function () {
  await User.deleteMany({});
});

describe("auth", () => {
  it("Check GET /signup", (done) => {
    chai
      .request(app)
      .get("/signup")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message", "Sign Up");
        done();
      });
  });

  it("Check POST /signup", (done) => {
    const newUser = {
      username: "test@gmail.com",
      firstName: "test",
      lastName: "example",
      password: "qwerty",
      "confirm-password": "qwerty",
    };

    chai
      .request(app)
      .post("/signup")
      .send(newUser)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message", "Sign up successful!");
        done();
      });
  });

  it("Check GET /login", (done) => {
    chai
      .request(app)
      .get("/login")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message", "Log in!");
        done();
      });
  });

  it("Check POST /login", (done) => {
    const newUser = {
      username: "test@gmail.com",
      password: "qwerty",
    };

    chai
      .request(app)
      .post("/login")
      .send(newUser)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("token");
        done();
      });
  });
});
