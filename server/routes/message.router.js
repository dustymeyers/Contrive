const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const {
  rejectUnauthenticated,
} = require('../modules/authentication-middleware');

/**
 * GET route for /api/message/all
 */
router.get('/all', rejectUnauthenticated, async (req, res) => {
  // GET ROUTE - Gets all messages for currently logged-in user
  const userId = req.user.id; // logged-in user's id
  console.log(req.user)

  if (req.user.type === 'planner') {
    const plannerQueryText = `
    SELECT DISTINCT 
      ON(GREATEST("fromUser", "toUser"), LEAST("fromUser", "toUser")) 
      GREATEST("fromUser", "toUser") as "otherUserId", 
      LEAST("fromUser", "toUser") as "userId", 
      "date" AS "maxDate", 
      "message",
      "users"."firstName",
      "users"."lastName",
      "vendors"."companyName",
      "users"."profilePic"
    FROM "messages"
    JOIN "users"
      ON "messages"."fromUser" = "users"."id" OR "messages"."toUser" = "users"."id"
    RIGHT OUTER JOIN "vendors"
      On "users"."id" = "vendors"."vendorUserId"
    WHERE "fromUser" = $1
      OR "toUser" = $1
    ORDER BY GREATEST("fromUser", "toUser"), LEAST("fromUser", "toUser"), "maxDate" ASC;
  `;
    pool
      .query(plannerQueryText, [userId])
      .then((dbRes) => {
        res.send(dbRes.rows);
      })
      .catch((err) => {
        console.error(
          'SERVER - GET at /api/message/all for PLANNER - an error occurred',
          err
        );
        res.sendStatus(500);
        return;
      });
  } else {
    // Array to hold all individualCommunicator objects
    const communicationList = [];

    // Query to select all other users who have messaged with this vendor (userId)
    const vendorQueryText = `
            WITH "sendingUsers" AS 
            (SELECT "fromUser", "toUser", "date", "message" 
              FROM "messages" 
              WHERE "fromUser" = $1  OR "toUser" = $1 
              ORDER BY "date" DESC ),
          "receivingUsers" AS 
          (SELECT "fromUser", "toUser" 
              FROM "messages" 
              WHERE "fromUser" = $1 OR "toUser" = $1  
              ORDER BY "date" DESC ) 
            SELECT DISTINCT "users".id, "users"."firstName", "users"."lastName", "users"."profilePic" 
            FROM "users"
            JOIN "sendingUsers" ON "users".id = "sendingUsers"."fromUser" OR "users".id = "sendingUsers"."toUser"
            JOIN "receivingUsers" ON "users".id = "receivingUsers"."toUser" OR "users".id = "receivingUsers"."fromUser"
            WHERE "users".id = "sendingUsers"."fromUser" OR "users".id = "receivingUsers"."toUser";
        `;

    // setup a connection to use for all our queries.
    const connection = await pool.connect();

    try {
      await connection.query('BEGIN');
      // Get list of all users messaging with this vendor
      let dbRes = await connection.query(vendorQueryText, [userId]);
      // capture individual user information in individualCommunicator object
      const allOtherUsers = dbRes.rows;
      for (let otherUser of allOtherUsers) {
        // Object to hold each individual "other user's" details
        let individualCommunicator = {
          otherUserId: 0,
          firstName: '',
          lastName: '',
          profilePic: '',
          message: '',
          messageDate: '',
          userId,
        };

        // for each otherUser (who is NOT the logged-in user), capture their info in the created object
        if (otherUser.id != userId) {
          individualCommunicator.otherUserId = otherUser.id;
          individualCommunicator.firstName = otherUser.firstName;
          individualCommunicator.lastName = otherUser.lastName;
          individualCommunicator.profilePic = otherUser.profilePic;

          // use each other user's id to get the most recent message between them and the logged-in user
          let messageInfo = await connection.query(
            `
            SELECT "messages"."message", to_char("date", 'DD MON YYYY HH:MI AM') AS "dateReceived" 
            FROM "messages" 
            WHERE "messages"."fromUser" IN ($1, $2) AND "messages"."toUser" IN ($1, $2)
            ORDER BY "dateReceived"  DESC
            LIMIT 1;
            `,
            [userId, otherUser.id]
          );

          // Add message information to individualCommunicator object (only if a message was returned)
          if (messageInfo.rows[0].message !== '') {
            individualCommunicator.message = messageInfo.rows[0].message;
            individualCommunicator.messageDate =
              messageInfo.rows[0].dateReceived;
          }

          // Add each individualCommunicator object to an array
          communicationList.push(individualCommunicator);

          await connection.query('COMMIT');
        }
      }
      // After looping through each of the other user Id's and retrieving their most recent
      // message with logged-in user, send this array of info back to the client
      res.send(communicationList);
    } catch (err) {
      // Send an error to the terminal if the above doesn't function properly
      console.error(
        'SERVER - GET at /api/message/all for VENDOR MESSAGES - an error occurred',
        err
      );
      res.sendStatus(500);
    } finally {
      // Finally runs whether the `try` block succeeded or not to release our connection
      connection.release();
    }
  }
}); // end get All messages for one user

/**
 * GET route for /api/message/id
 */
router.get('/:id', rejectUnauthenticated, (req, res) => {
  // GET ROUTE - Gets Messages between two users
  const userId = req.user.id;
  const otherUser = req.params.id;

  const queryText = `SELECT "fromUser", "toUser", "message", 
  to_char("date", 'DD MON YYYY HH:MI AM') AS "dateReceived"
  FROM "messages" 
  WHERE 
  "messages"."fromUser" = $1 AND "messages"."toUser" = $2
  OR "messages"."toUser" = $1 AND "messages"."fromUser" = $2
  ORDER BY "date" ASC;`;

  pool
    .query(queryText, [userId, otherUser])
    .then((dbRes) => {
      res.send(dbRes.rows);
    })
    .catch((err) => {
      console.error('SERVER - GET at /api/message/id - an error occurred', err);
      res.sendStatus(500);
    });
}); // end get conversation thread between two users

/**
 * POST route for /api/message
 */
router.post('/', rejectUnauthenticated, (req, res) => {
  const queryText = `
  INSERT INTO "messages" ("fromUser", 
  "toUser", 
  "date", 
  "message")
  VALUES ($1, $2, $3, $4);`;

  pool
    .query(queryText, [
      req.body.fromUser,
      req.body.toUser,
      req.body.date,
      req.body.message,
    ])
    .then((dbRes) => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.error('SERVER - GET at /api/message', err);
      res.sendStatus(500);
    });
}); // end POST to /api/message

/**
 * POST route for /api/message/bulk
 */
router.post('/bulk', rejectUnauthenticated, async (req, res) => {
  try {
    const queryText = `
    INSERT INTO "messages" ("fromUser", 
                            "toUser", 
                            "date", 
                            "message")
    VALUES ($1, $2, $3, $4);`;

    await Promise.all(
      req.body.map((message) =>
        pool.query(queryText, [
          message.fromUser,
          message.toUser,
          message.date,
          message.message,
        ])
      )
    );
    res.sendStatus(201);
  } catch (err) {
    console.error('SERVER - POST - at /api/message/bulk - an error occurred');
    res.sendStatus(500);
  }
}); // end POST to /api/message/bulk

module.exports = router;
