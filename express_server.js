const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Data
const urlDatabase = { // placeholder URLs
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() { 
  return Math.random().toString(36).slice(2, 8);
}






// ROUTES

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

// Homepage ✅
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

// Create new URL ✅
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = req.body.longURL; // Pushes new tiny URL to urlDatabase
  res.redirect(`/urls/${randomStr}`); // Redirects to main /urls page
});

// Lists short URL on homepage ✅
app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

// Assign shortURL to longURL ✅
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

// Delete URL ✅
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

// Edit URL ✅
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newLongURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

// login ✅
app.get("/login", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_show", templateVars); // Passes "username" to /login route
  res.redirect("/urls")
});

// Collects cookie on login ✅
app.post("/login", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.cookie("username", req.body.username); // value = name of form from _header.ejs
  res.redirect("/urls"); // Redirects to main /urls page
});

// logout ✅
app.get("/logout", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_show", templateVars); // Passes "username" to /logout route
  res.redirect("/urls")
});

// Removes cookie on logout ✅
app.post("/logout", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.clearCookie("username"); // Removes the cookie + username
  res.redirect("/urls"); // Redirects to main /urls page
});