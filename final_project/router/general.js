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

function getBooksData() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books) {
                resolve(books);  // Simulate successful data retrieval
            } else {
                reject('Books data not available');  // Simulate an error if no data
            }
        }, 1000);  // Simulating a delay (1 second)
    });
}

// Get the list of books available in the shop using async-await (Asynchronous Approach)
public_users.get('/async-books', async function (req, res) {
    try {
        // Wait for the books data to be retrieved asynchronously
        const booksData = await getBooksData();
        res.send(JSON.stringify(booksData, null, 4));  // Send the books data as JSON response
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).send('Error fetching the list of books');
    }
});

public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));
});

async function fetchBookByISBN(isbn) {
    try {
        // Simulate a delay to fetch data (e.g., a database query or API call)
        const book = books[isbn];  // Look up the book using ISBN as the key
        if (book) {
            return book;  // Return the book if found
        } else {
            throw new Error('Book not found');  // Throw error if book is not found
        }
    } catch (error) {
        throw new Error('Failed to fetch book from database');
    }
}

// Route to fetch book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;  // Get ISBN from URL parameters
    
    try {
        const bookData = await fetchBookByISBN(isbn);  // Fetch the book using async/await
        res.send(bookData);  // Send book data as a JSON response
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).send('Error fetching book details');
    }
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
 
 async function fetchBooksByAuthor(author) {
    try {
        // Filter books by author
        const booksByAuthor = Object.values(books).filter(book => book.author === author);
        
        if (booksByAuthor.length > 0) {
            return booksByAuthor;  // Return array of books by the author
        } else {
            throw new Error('No books found for this author');
        }
    } catch (error) {
        throw new Error('Failed to fetch books by author');
    }
}

// Route to fetch book details based on author using async/await
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;  // Get author name from URL parameters
    
    try {
        const booksData = await fetchBooksByAuthor(author);  // Fetch books by author using async/await
        res.send(booksData);  // Send books data as a JSON response
    } catch (error) {
        console.error('Error fetching books by author:', error);
        res.status(500).send('Error fetching books by author');
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

async function fetchBooksByTitle(title) {
    try {
        // Filter books by author
        const booksByTitle = Object.values(books).filter(book => book.title === title);
        
        if (booksByTitle.length > 0) {
            return booksByTitle;  
        } else {
            throw new Error('No books found for this title');
        }
    } catch (error) {
        throw new Error('Failed to fetch books by title');
    }
}

public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title; 
    
    try {
        const booksData = await fetchBooksByTitle(title);  
        res.send(booksData);  
    } catch (error) {
        console.error('Error fetching books by title:', error);
        res.status(500).send('Error fetching books by title');
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
