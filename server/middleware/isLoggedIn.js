const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // const authHeader = req.headers.authorization;
  // if (!authHeader) {
  //   res.status(401).json("You must be logged in to perform this action.");
  // } else {
  //   const token = authHeader.split(" ")[1];

  //   jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
  //     if (err) {
  //       res.status(403).json("Invalid credentials; try logging in again.");
  //     } else {
  //       next();
  //     }
  //   });
  // }
  if (req.isAuthenticated()) {
    next();
  } else {
    res
      .status(401)
      .json({ message: "You are not authorized to view this resource" });
  }
};
