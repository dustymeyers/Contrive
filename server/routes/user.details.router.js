const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const {
  rejectUnauthenticated,
} = require('../modules/authentication-middleware');

/**
 * GET route for /api/user/details/
 */
router.get('/', rejectUnauthenticated, (req, res) => {
  // Gets user info based on currently logged in user
  const userId = req.user.id;
  console.log('Incoming userId is', req.user.id);
  const queryText = `
  SELECT 
  "firstName", 
  "lastName", 
  "type", 
  "profilePic"
  FROM "users" 
  WHERE "users".id = $1`;

  pool
    .query(queryText, [userId])
    .then((dbRes) => {
      console.log('SERVER - GET - user details successful!');
      console.table(dbRes.rows);
      res.send(dbRes.rows);
    })
    .catch((err) => {
      console.error('SERVER - GET - an error occurred getting user details');
      res.sendStatus(500);
    });
});

/**
 * GET route for /api/user/details/id
 */
router.get('/:id', (req, res) => {
  // Gets user info based on passed in params
  const userId = req.params.id;
  const queryText = `
  SELECT 
  "firstName", 
  "lastName", 
  "type", 
  "profilePic"
  FROM "users"
  WHERE "users".id = $1`;

  pool
    .query(queryText, [userId])
    .then((dbRes) => {
      console.log('SERVER - GET - user type and photo successful!');
      res.send(dbRes.rows);
    })
    .catch((err) => {
      console.error('SERVER - GET - an error occurred getting user details');
      res.sendStatus(500);
    });
});

/**
 * POST route template
 */
router.post('/', (req, res) => {
  // POST route code here
});

module.exports = router;
