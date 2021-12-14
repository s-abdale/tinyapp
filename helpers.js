// Helper data:
const bcrypt = require('bcryptjs');

// Generate random string for user ID
const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

// Check if email is already in Users object
const getEmail = function(obj, str) {
  for (const id in obj) {
    if (obj[id].email === str) {
      return true; // BAD CASE - if email is in obj, return true
    }
  }
};

// Check if email & password match & are in database
const emailPwdMatch = function(obj, email, pwd) {
  for (const id in obj) {
    if ((obj[id].email === email) && (bcrypt.compareSync(pwd, obj[id].password))) {
      return true; // GOOD CASE - email & password pair exists, so user exists
    }
  }
};

const getUserID = function(userObj, email) {
  let user_id;
  for (let user in userObj) {
    let emails = userObj[user].email;
    if (emails === email) {
      user_id = userObj[user].id;
    }
  }
  return user_id;
};

const urlsForUser = function(userID, databaseObj) {
  let newUserObj = {};

  // identify which DATABASE object contains the same ID as current user
  for (const shortURL in databaseObj) {
    let databaseUserID = databaseObj[shortURL].userID;
    
    if (userID === databaseUserID) {
      newUserObj[shortURL] = databaseObj[shortURL];
    }
  }
  return newUserObj; // returns URLs made by current user
};

module.exports = { generateRandomString, getEmail, emailPwdMatch, getUserID, urlsForUser };