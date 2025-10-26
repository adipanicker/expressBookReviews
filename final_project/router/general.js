const express = require("express");
let books = require("./booksdb.js");
const auth_module = require("./auth_users.js");

const public_users = express.Router();

const users = auth_module.users;
const isValid = auth_module.isValid;
const authenticatedUser = auth_module.authenticatedUser;

// Temporary endpoint to check registered users
public_users.get("/debug-users", (req, res) => {
  return res.status(200).json({ users: users });
});

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      return res.status(400).json({ message: "Invalid username format" });
    }

    let existingUser = users.find((user) => user.username === username);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    users.push({ username: username, password: password });
    console.log("Registered user:", username); // Debug
    console.log("All users:", users); // Debug
    return res.status(200).json({ message: "User successfully registered" });
  }

  return res.status(400).json({ message: "Unable to register user" });
});
const axios = require("axios");
public_users.get("/", async function (req, res) {
  try {
    // Create an asynchronous function to get books
    const getBooksAsync = () => {
      return new Promise((resolve, reject) => {
        // Simulate database/API call
        setTimeout(() => {
          try {
            const books = require("./booksdb.js");
            resolve(books);
          } catch (error) {
            reject(error);
          }
        }, 200);
      });
    };

    // Use async/await to handle the asynchronous operation
    const books = await getBooksAsync();

    return res.status(200).json(JSON.parse(JSON.stringify(books, null, 2)));
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving books",
      error: error.message,
    });
  }
});

// Get book details based on ISBN using Async/Await
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;

    // Create async function to get book by ISBN
    const getBookByISBN = () => {
      return new Promise((resolve, reject) => {
        const books = require("./booksdb.js");
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject(new Error("Book not found"));
        }
      });
    };

    // Use async/await
    const book = await getBookByISBN();
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get book details based on Author using Async/Await
public_users.get("/author/:author", async function (req, res) {
  try {
    const author = req.params.author;

    // Create async function to get books by author
    const getBooksByAuthor = () => {
      return new Promise((resolve, reject) => {
        const books = require("./booksdb.js");
        const booksByAuthor = [];

        for (let key in books) {
          if (books[key].author.toLowerCase() === author.toLowerCase()) {
            booksByAuthor.push({
              id: key,
              ...books[key],
            });
          }
        }

        booksByAuthor.length > 0
          ? resolve(booksByAuthor)
          : reject("No books found by this author");
      });
    };

    // Use async/await
    const books = await getBooksByAuthor();
    return res.status(200).json(books);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Get book details based on Title using Async/Await
public_users.get("/title/:title", async function (req, res) {
  try {
    const title = req.params.title;

    // Create async function to get books by title
    const getBooksByTitle = () => {
      return new Promise((resolve, reject) => {
        const books = require("./booksdb.js");
        const booksByTitle = [];

        for (let key in books) {
          if (books[key].title.toLowerCase() === title.toLowerCase()) {
            booksByTitle.push({
              id: key,
              ...books[key],
            });
          }
        }

        booksByTitle.length > 0
          ? resolve(booksByTitle)
          : reject("No books found with this title");
      });
    };

    // Use async/await
    const books = await getBooksByTitle();
    return res.status(200).json(books);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const books = require("./booksdb.js");

  const book = books[isbn];
  if (book) {
    return res.status(200).json({
      reviews: book.reviews,
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
