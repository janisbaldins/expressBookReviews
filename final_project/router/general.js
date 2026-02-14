const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (doesExist(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Internal endpoint for Axios (prevents recursion)
public_users.get("/books", function (req, res) {
  return res.status(200).json(books);
});

// Internal endpoint for Axios ISBN
public_users.get("/books/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).json(books[isbn]);
});

// Get the book list available in the shop (Axios + async/await)
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/books");
    return res.status(200).json(response.data);
  } catch {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN (Axios + async/await)
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(`http://localhost:5000/books/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author (Promise callbacks)
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  new Promise((resolve) => {
    const result = Object.keys(books)
      .map((key) => books[key])
      .filter((book) => book.author === author);

    resolve(result); // [] if none
  })
    .then((result) => res.status(200).json(result))
    .catch(() => res.status(500).json({ message: "Error fetching books" }));
});

// Get all books based on title (Promise callbacks)
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  new Promise((resolve) => {
    const result = Object.keys(books)
      .map((key) => books[key])
      .filter((book) => book.title === title);

    resolve(result); // [] if none
  })
    .then((result) => res.status(200).json(result))
    .catch(() => res.status(500).json({ message: "Error fetching books" }));
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
