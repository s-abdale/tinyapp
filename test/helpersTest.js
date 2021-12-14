const { assert } = require('chai');

const { generateRandomString, getEmail, emailPwdMatch, getUserID } = require('../helpers.js');

const testUsers = {
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

describe('generateRandomString', function() {
  it('returns true if type is string', () => {
    const output = generateRandomString();
    const actual = typeof(output);
    const expected = 'string';
    assert.isTrue(actual === expected);
  });
});

describe('getEmail', function() {
  it('returns true if email is already in the database', () => {
    const output = getEmail(testUsers, "user@example.com");
    assert.isTrue(output);
  });
  it('does not return true if email is not in the database', () => {
    const output = getEmail(testUsers, "new-user@example.com");
    assert.isNotTrue(output);
  });
});

describe('emailPwdMatch', function() {
  it('does not return true if the email & password pair does not exist in the database', () => {
    const output = emailPwdMatch(testUsers, "user@example.com", "purple-monkey-dinosaur");
    assert.isNotTrue(output);
  });
});

describe('getUserID', function() {
  it('returns the user ID that corresponds to the email', () => {
    const output = getUserID(testUsers, "user@example.com");
    const expected = "userRandomID";
    assert.equal(output, expected);
  });
});