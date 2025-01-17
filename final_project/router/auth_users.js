const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
let reviews = {};

const isValid = (username)=>{ 
    let userswithsamename = users.filter((user)=> {
        return user.username === username;
    });
    if (userswithsamename.length > 0){
       return false;
    }else{
        return true;
    }
}

const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}


//only registered users can login
regd_users.post("/customer/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send({message:"User successfully logged in", accessToken});
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/review/:isbn", (req, res) => {
    const username = req.session.authorization?.username;
    const { review } = req.body;
    const { isbn } = req.params;

    // Check if the user is authenticated
    if (!username) {
        return res.status(401).json({ message: "You need to be logged in to review a book" });
    }

    // Check if review text is provided
    if (!review) {
        return res.status(400).json({ message: "Review text cannot be empty" });
    }

    // Find the book by ISBN directly using the ISBN from the URL
    let book = books[isbn];  // Lookup book by ISBN from the object key

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Initialize reviews if it doesn't exist
    if (!book.reviews) {
        book.reviews = {};
    }

    // Add or update the review for this book by the user
    if (book.reviews[username]) {
        // If the user already reviewed the book, update the review
        book.reviews[username] = review;
    } else {
        // If it's a new review, add it
        book.reviews[username] = review;
    }

    return res.status(200).json({ message: "Review added successfully", book });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;

