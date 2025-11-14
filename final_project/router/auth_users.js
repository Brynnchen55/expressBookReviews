const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    //write code to check is the username is valid
    return users.some(user => user.username === username);
};

const authenticatedUser = (username,password)=>{ //returns boolean
    //write code to check if username and password match the one we have in records.
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }

};

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Authenticate user credentials
  if (authenticatedUser(username, password)) {
    // Create JWT token
    const accessToken = jwt.sign(
      { username: username },
      "access",  // Secret key (should be consistent)
      { expiresIn: 60 * 60 }
    );

    // Save authorization info in session
    req.session.authorization = {
      accessToken,
      username: username
    };

    return res.status(200).json({ message: "User logged in successfully", accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;

  const username = req.session.authorization.username;
  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book with ISBN &{isbn} not found.'});
  }

  if (!review) {
        return res.status(400).json({ message: "Review content cannot be empty." });
  }

  if (!books[isbn].reviews) {
        books[isbn].reviews = {};
  }

  if (books[isbn].reviews[username]) {
        // User has already reviewed -> Modify existing review
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: `Review for ISBN ${isbn} successfully modified by user ${username}.` });
    } else {
        // First review by this user -> Add new review
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: `Review for ISBN ${isbn} successfully added by user ${username}.` });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    // Get username from session (guaranteed to exist by the auth middleware)
    const username = req.session.authorization.username; 

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    // Check if the user's review exists before attempting to delete
    if (books[isbn].reviews && books[isbn].reviews[username]) {
        // Delete the review entry associated with the username
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: `Review by user ${username} for ISBN ${isbn} deleted successfully.` });
    } else {
        // Review not found for this user
        return res.status(404).json({ message: `Review by user ${username} for ISBN ${isbn} not found.` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
