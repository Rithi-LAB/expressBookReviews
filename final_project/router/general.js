const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let authenticatedUser = require("./auth_users.js").authenticatedUser;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const { authenticated } = require('./auth_users.js');

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password){
        if (isValid(username)){
             users.push({"username":username,"password":password});
             return res.status(200).json({message:"User successfully registered"});
        }else{
             return res.status(404).json({message:"User already exists"})
        }
    }else {
        return res.status(404).json({message:"Error in accepting username and password"})
    }
});

public_users.get("/users", (req, res) => {
    res.send(users);  // Send the 'users' array as a JSON response
});
public_users.use(express.json());

public_users.use(session(
    {secret:"fingerpint",
    resave:true,
    saveUninitialized:true}));

public_users.use('/auth', authenticated);

// Get the book list available in the shop
public_users.get('/',function (req, res) {
       res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
     const isbn = req.params.isbn;
     const book = books[isbn];
     
     if(book){
        res.send(book);
     }else{
        res.send("No book found matching the ISBN number");
     }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
     const author = req.params.author;
     const booksArray = Object.values(books);
     const booksByAuthor = booksArray.filter((book)=> book.author===author);
     if (booksByAuthor.length > 0){
        res.send(booksByAuthor);
     }else{
        res.send("Author doesn't match")
     }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const booksArray = Object.values(books);
    const booksByTitle = booksArray.filter((book)=> book.title===title);
    if (booksByTitle.length > 0){
       res.send(booksByTitle);
    }else{
       res.send("Title doesn't match any of the books")
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
