const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");


const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

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


// Get the book list available in the shop
public_users.get('/', function (req, res) {
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/books");
    res.json(response.data);
  } catch {
    res.status(500).json({ message: "Error fetching books" });
  }
});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {

 const isbn = req.params.isbn;

  try {
    const response = await axios.get(`http://localhost:5000/books/isbn/${isbn}`);
    res.json(response.data);
  } catch {
    res.status(404).json({ message: "Book not found" });
  }

});


// Get book details based on author (Promise)
public_users.get('/author/:author',  function (req, res) {
  // Get book details based on author (Promise)
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  new Promise((resolve) => {
    const keys = Object.keys(books);
    const result = keys
      .map(key => books[key])
      .filter(book => book.author === author);

    resolve(result); // pat ja tukšs
  })
    .then(result => res.status(200).json(result))
    .catch(() => res.status(500).json({ message: "Error fetching books" }));
});

});




public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    const result = keys
      .map((key) => books[key])
      .filter((book) => book.title === title);

    if (result.length > 0) resolve(result);
    else reject("No books found with this title");
  })
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(404).json({ message: err }));
});

//  Get book review
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
