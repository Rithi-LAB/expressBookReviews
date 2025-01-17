const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

app.use("/customer", session({
  secret: "fingerprint_customer",  // Secret key for session encryption
  resave: true,
  saveUninitialized: true
}));

app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if user is authenticated by looking for user data in session
  if (req.session && req.session.user) {
    return next();  // If authenticated, continue to the route
  } else {
    return res.status(401).json({ message: "Authentication required" });  // Unauthorized if no session
  }
});

function authenticateJWT(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];  // Assuming "Authorization: Bearer <token>"
  if (!token) return res.status(403).json({ message: "Access denied, token missing" });

  jwt.verify(token, "your_jwt_secret_key", (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;  // Attach user data to request object
    next();  // Proceed to the next middleware or route
  });
}

app.use("/customer", customer_routes);

app.use("/", genl_routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);  // Log the error stack to the console
  res.status(500).send('Something went wrong!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

