/*               IMPORTS                  */
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const { generateRandomString, getEmail, emailPwdMatch, getUserID, urlsForUser } = require("./helpers");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

/*              MIDDLEWARE                */
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

/*               DATA                     */
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  "test1": {
    id: "test1",
    email: "test1@example.com",
    password: bcrypt.hashSync("1", 10)
  },
  "test2": {
    id: "test2",
    email: "test2@example.com",
    password: bcrypt.hashSync("2", 10)
  }
};



/*               ROUTES                   */
/*---Home pages & config.---*/
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.session.user, userID: req.session.user_id};

  // If user is already logged in send to /urls, else load up landing page
  if (!req.session.user) {
    res.render("urls_landing", templateVars);
  }
  res.redirect("/urls");
});

// Show /URLs homepage
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.session.user, userID: req.session.user_id};

  // If user is already logged in load up /urls, else send to landing page
  if (!req.session.user) {
    res.redirect("/");
  }
  res.render("urls_index", templateVars);
});



/*---User accounts---*/
// Show registration page
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.session.user, userID: req.session.user_id};

  // If user is already logged in give access to /urls, else send to registration page
  if (!req.session.user) {
    res.render("urls_register", templateVars);
  }
  res.render("urls_index", templateVars);
  
});

// Register and log in user through a form
app.post("/register", (req, res) => {
  const randomUserID = generateRandomString();
  const userEmail = req.body.email;

  /*---Error evaluations---*/
  // If email is already in use ...
  let evaluation = (getEmail(users, userEmail));
  if (evaluation === true) {
    res.status(400).send(`Error: 400. Email is already in use`);
  }

  // If email OR pwd are empty strings ...
  if ((!req.body.email) || (!req.body.password)) {
    res.status(400).send(`Error: 400. Invalid email or password`);
  }

  // If no errors, push new user object to users object
  users[randomUserID] = {
    id: randomUserID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10) // passes hashed pwd to the users object
  };

  /*---Create cookies---*/
  const userObj = users[randomUserID];
  req.session.user = userObj; // Makes new user object into a session value
  const foundUserID = getUserID(users, req.body.email);
  req.session.user_id = foundUserID;

  /*---Redirect to URLS list after registration---*/
  res.redirect("/urls");
});

// Show login form in header bar
app.get("/login", (req, res) => {
  const templateVars = {user: req.session.user, userID: req.session.user_id, urls: urlDatabase};

  // If user is already logged in send them to /urls, otherwise send to /login
  if (!req.session.user) {
    res.render("urls_login", templateVars);
    res.redirect("/urls");
  }
  res.redirect("/urls");
});

// Collect cookie on login
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password; // For testing with bcrypt.compareSync. Checks if input matches value in database
  const userPresence = emailPwdMatch(users, userEmail, userPassword);
  const foundUserID = getUserID(users, req.body.email);

  // Error evaluations:
  // If email OR password are empty strings ...
  if ((!userEmail) || (!userPassword)) {
    res.status(403).send(`Error: 403. Invalid email or password`);
  }

  // If email and password don't match...
  if (userPresence !== true) {
    res.status(403).send(`Error: 403. Incorrect login credentials`);
  }

  // On successful email-password combination ...
  req.session.user = req.body; // Makes the current user object a session value
  req.session.user_id = foundUserID;

  res.redirect("/urls");
});

// Clear session on logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});



/*---Actions on URLs---*/
// Show Create new URLs page
app.get("/urls/new", (req, res) => {
  const templateVars = {urls: urlDatabase, user: req.session.user, userID: req.session.user_id};

  // If user is logged in, give access to create new URLs
  if (req.session.user) {
    res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

// Create new URL & show new URL page
app.post("/urls", (req, res) => {
  const randomStr = generateRandomString();
  const userID = req.session.user_id;
  urlsForUser(urlDatabase, userID); // only shows URLs associated with user
  urlDatabase[randomStr] = {longURL: req.body.longURL, userID: req.session.user_id}; // Pushes tinyURL object with longURL & userID to urlDatabase

  res.redirect(`/urls/${randomStr}`); // Redirects to new url's page
});

// Assign longURL to shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, long_URL: urlDatabase[req.params.shortURL].longURL, user: req.session.user, userID: req.session.user_id};
  const longURL = urlDatabase[req.params.shortURL];

  if (longURL.userID === req.session.user_id) {
    res.render("urls_show", templateVars);
  }
  res.redirect("/urls");
});

// Hyperlinks short URL to long URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  
  if (longURL.userID === req.session.user_id) {
    res.redirect(longURL.longURL);
  }
  res.redirect("/urls");
});

// Edit URL from /URLs homepage
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  urlsForUser(urlDatabase, userID); // only shows URLs associated with user in /urls list
  if (req.body.newLongURL.length === 0) {
    res.redirect(`/urls/${req.params.shortURL}`)
    // Does not reassign longURL, redirects back to the old edit page
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.newLongURL;
    // Reassigns longURL
    res.redirect(`/urls/${req.params.shortURL}`);
    // Redirects to page with updated longURL
  }
});

// Delete URL from /URLs homepage
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const longURL = urlDatabase[req.params.shortURL];
  urlsForUser(urlDatabase, userID); // only shows URLs associated with user in /urls list

  // If URL owner is logged in it deletes URL entry & redirects to main urls_index page, else redirects to /urls page
  if (longURL.userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL], req.params.shortURL;
    res.redirect("/urls");
  }
  res.redirect("/urls");
});