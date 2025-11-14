const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Add new user
  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully" });
});

const getBooksAsync = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books) {
                resolve(books);
            } else {
                reject({ message: "No books found in the database"});
            }
        }, 500);
    })
};

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getBooksAsync()
    .then(bookData => {
        const bookList =JSON.stringify(bookData, null, 4); 
        return res.status(200).send(bookList);
    })
    .catch(error => {
        return res.status(500).json(error);
    });  
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const bookData = await getBooksAsync();
    if (bookData[isbn]) {
        return res.status(200).send(bookData[isbn]);
    } else {
        return res.status(404).json({ message: "Book not found"});
    }  
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve books data"})
  }
  
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  try {
    const author = req.params.author;
    const bookData = await getBooksAsync();

    const matchedBooks ={};
    const bookKeys = Object.keys(bookData);

    for (let key of bookKeys) {
        if (bookData[key].author === author) {
            matchedBooks[key] = bookData[key];
        }
    }

    if (Object.keys(matchedBooks).length > 0) {
        return res.status(200).send(matchedBooks);
    } else {
        return res.status(404).send("No books found with the author " + req.params.author);
    }  
  } catch (error) {
        return res.status(500).json({ message: "Failed to retrieve books data."});
    }  
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  try {
    const title = req.params.title;
    const bookData = await getBooksAsync();
    const matchedBooks ={};
    const bookKeys = Object.keys(bookData);

    for (let key of bookKeys) {
        if (bookData[key].title === title) {
            matchedBooks[key] = bookData[key];
        }
    }

    if (Object.keys(matchedBooks).length > 0) {
        return res.status(200).send(matchedBooks);
    } else {
        return res.status(404).send("No books found with the title " + req.params.title);
    }
  } catch (error) {
        return res.status(500).json({ message: "Failed to retrieve books data."});
  }
  
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;

  if (books[isbn]) {
    const reviews = books[isbn].reviews || {};
    return res.status(200).send(reviews);
  } else {
    return res.status(404).json({message: "Book not found"});
  }  
});

module.exports.general = public_users;
