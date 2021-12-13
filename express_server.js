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

function generateRandomString() { 
  return Math.random().toString(36).slice(2, 8);
}

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
  const templateVars = { urls: urlDatabase, /*username: req.cookies["username"]*/ user: req.cookies["user"], userID: req.cookies["user_id"],};
  res.render("urls_index", templateVars);
});



/*---Actions on URLs---*/
// Show Create new URLs page
app.get("/urls/new", (req, res) => {
  const templateVars = {/*username: req.cookies["username"]*/ user: req.cookies["user"], userID: req.cookies["user_id"],};
  res.render("urls_new", templateVars);
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], /*username: req.cookies["username"]*/ user: req.cookies["user"], userID: req.cookies["user_id"],};
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



/*---User accounts---*/
// Show registration page
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, /*username: req.cookies["username"]*/ user: req.cookies["user"], userID: req.cookies["user_id"],};
  res.render("urls_register", templateVars);

  // res.render("urls_register"); // can't do this bc we need username for _header to run
});

// 💡💡💡💡💡💡💡💡💡✅✅✅✅✅✅✅✅✅💡💡💡💡💡💡💡💡💡💡💡
// 💡💡💡💡💡💡💡💡💡💡WORKING HERE💡💡💡💡💡💡💡💡💡💡💡💡
// 💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡

// Register and log in user through a form
app.post("/register", (req, res) => {

  // // visualizing:
  // console.log("OG users object: ");
  // console.log(users);
  // console.log("Adding new user ... ");
  // console.log(req.body); // just the user input on registration page

  // Generate randomUserID
  const randomUserID = generateRandomString(); 
  // Push new user object to users object
  users[randomUserID] = {
    id: randomUserID,
    email: req.body.email,
    password: req.body.password
  }
  // Variables
  const userObj = users[randomUserID]; // the entire new user object
  const userID = userObj["id"]; // just the ID
  const userEmail = req.body.email; // just the email

  // // visualizing:
  // console.log("New user object: ");
  // console.log(userObj);
  // console.log(`Email: ${userEmail}`);
  // console.log(`User ID: ${userID}`);
  console.log(users[userID]) // use this for vars

  // Cookies
  res.cookie("user_id", userID); // set a user_id cookie containing the user's newly generated ID

  res.cookie("user", userObj); // should pass the whole new obj as a cookie
  // user: req.cookies["user"], userID: req.cookies["user_id"],
  
  // res.cookie("username", randomUserID) // updates username cookie to new randomUserID, writes "logged in as (ID) to header

  // res.cookie("username", userEmail) // updates username cookie to new email, writes "logged in as (email)" to header, success!

  res.redirect("/urls"); // Redirects to main /urls page
});

// Show login form in header bar
app.get("/login", (req, res) => {
  const templateVars = {/*username: req.cookies["username"]*/ user: req.cookies["user"], userID: req.cookies["user_id"],};
  res.render("urls_show", templateVars); // Passes "username" to /login route
  res.redirect("/urls")
});

// Collect cookie on login
app.post("/login", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.cookie("username", req.body.username); // value = name of form from _header.ejs
  res.redirect("/urls"); // Redirects to main /urls page
});

// Logout via header button
app.get("/logout", (req, res) => {
  const templateVars = {/*username: req.cookies["username"]*/ user: req.cookies["user"], userID: req.cookies["user_id"],};
  res.render("urls_show", templateVars); // Passes "username" to /logout route
  res.redirect("/urls")
});

// Remove cookie on logout
app.post("/logout", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.clearCookie("user"); // Removes the cookie + username
  res.redirect("/urls"); // Redirects to main /urls page
});