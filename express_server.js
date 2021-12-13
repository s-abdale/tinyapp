/*               IMPORTS                  */
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

/*              MIDDLEWARE                */
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

/*               DATA                     */
const urlDatabase = { // placeholder URLs
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Generate random string for user ID
const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// Check if email is already in Users object
const getEmail = function(obj, str) {
  for (const id in obj) {
    if (obj[id].email === str) {
      // console.log(true);
      return true; // BAD CASE - if email is in obj, return true
    }
  }
};

// Check if email & password are in database
const checkUserPresence = function(obj, email, pwd) {
  for (const id in obj) {
    if ((obj[id].email === email) && (obj[id].password === pwd)) {
      // console.log(true);
      return true; // GOOD CASE - email & password pair exists, so user exists
    }
  }
};



/*               ROUTES                   */
/*---Home pages---*/
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Show /URLs homepage
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies["user"], userID: req.cookies["user_id"]};
  res.render("urls_index", templateVars);
});



/*---User accounts---*/
// Show registration page
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies["user"], userID: req.cookies["user_id"]};
  res.render("urls_register", templateVars);
});

// Register and log in user through a form
app.post("/register", (req, res) => {
  const randomUserID = generateRandomString();
  const userEmail = req.body.email; // just the email

  // Error evaluations:
  // If email is already in use ...
  let evaluation = (getEmail(users, userEmail));
  if (evaluation === true) {
    res.status(400).send(`Error: 400. Email is already in use`);
  }

  // If email OR pwd are empty strings ...
  if ((!req.body.email) || (!req.body.password)) {
    res.status(400).send(`Error: 400. Invalid email or password`);
  }

  // If no errors ...
  // Push new user object to users object
  users[randomUserID] = {
    id: randomUserID,
    email: req.body.email,
    password: req.body.password
  };

  // Cookies:
  const userObj = users[randomUserID]; // The entire new user object
  res.cookie("user", userObj); // Makes new user object a cookie
  res.redirect("/urls"); // Redirects to main /urls page
});

// Show login form in header bar
app.get("/login", (req, res) => {
  const templateVars = {user: req.cookies["user"], userID: req.cookies["user_id"]};
  res.render("urls_login", templateVars); // Loads up the /login page
  res.redirect("/urls"); // takes user back to main /urls page
});

// Collect cookie on login
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userPresence = checkUserPresence(users, userEmail, userPassword);

  // Error evaluations:
  // If email OR pwd are empty strings ...
  if ((!userEmail) || (!userPassword)) {
    res.status(403).send(`Error: 403. Invalid email or password`);
  }

  // If email is already in use ...
  if (userPresence !== true) {
    res.status(403).send(`Error: 403. Incorrect input`);
  }

  // Happy state:
  res.cookie("user", req.body); // Makes the current user object a cookie
  res.redirect("/urls");
});

// Logout via header button
app.get("/logout", (req, res) => {
  const templateVars = {user: req.cookies["user"], userID: req.cookies["user_id"]};
  res.render("urls_show", templateVars); // Passes "user" to /logout route
  res.redirect("/urls");
});

// Remove cookie on logout
app.post("/logout", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.clearCookie("user"); // Removes the cookie + username
  res.redirect("/urls"); // Redirects to main /urls page
});



/*---Actions on URLs---*/
// Show Create new URLs page
app.get("/urls/new", (req, res) => {
  const templateVars = {user: req.cookies["user"], userID: req.cookies["user_id"]};
  // If user is logged in, give access to create new URLs
  if (req.cookies.user) {
    res.render("urls_new", templateVars)
  } else {
    res.redirect("/urls")
  }
});

// Create new URL & show new URL page
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = req.body.longURL; // Pushes new tiny URL to urlDatabase
  res.redirect(`/urls/${randomStr}`); // Redirects to main /urls page
});

// Assign longURL to shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: req.cookies["user"], userID: req.cookies["user_id"]};
  res.render("urls_show", templateVars);
});

// Delete URL from /URLs homepage
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  delete urlDatabase[req.params.shortURL], req.params.shortURL; // Deletes URL entry
  res.redirect("/urls"); // Redirects to main urls_index page
});

// Hyperlinks short URL to long URL ✅ only from new URL pg
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Edit URL from /URLs homepage
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newLongURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});