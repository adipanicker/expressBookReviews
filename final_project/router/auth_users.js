const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Check if username meets basic requirements
  if (!username || username.length < 3) {
    return false;
  }
  // Check if username contains only alphanumeric characters
  const alphanumeric = /^[a-zA-Z0-9]+$/;
  return alphanumeric.test(username);
};

const authenticatedUser = (username, password) => {
  console.log("=== AUTHENTICATED USER CHECK ===");
  console.log("Checking user:", username);
  console.log("Current users array:", users);

  let validUsers = users.filter((user) => {
    return user.username === username && user.password === password;
  });

  console.log("Valid users found:", validUsers.length);
  return validUsers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log("=== LOGIN ATTEMPT ===");
  console.log("Username:", username);
  console.log("Password:", password);
  console.log("All users in auth_users:", users); // ADD THIS LINE
  console.log(
    "Authenticated user check:",
    authenticatedUser(username, password)
  ); // ADD THIS LINE

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };

    return res.status(200).send("User successfully logged in");
  } else {
    console.log("AUTHENTICATION FAILED"); // ADD THIS LINE
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  const books = require("./booksdb.js");
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Add or modify review
  book.reviews[username] = review;

  return res.status(200).json({
    message:
      book.reviews[username] === review
        ? "Review added successfully"
        : "Review modified successfully",
    book: book.title,
    review: review,
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  const books = require("./booksdb.js");
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "No review found to delete" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
