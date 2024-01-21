const http = require('http');
const express = require('express');
const cors = require('cors');
const port= process.env.PORT || 5000

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin:"*", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // allow session cookie from browser to pass through
}));


const { Pool } = require('pg');
// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgres://yfbksotg:axm6yoelp5S2QKYJEDKaHdk6k8VzOtgw@manny.db.elephantsql.com/yfbksotg',
});

// Test the database connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database', err);
  } else {
    console.log('Connected to the database');
  }
});



if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))
  }


server.listen(port,()=>{console.log(`listening on ${port}`)})

app.get("/", (req, res) => {
  res.send("HOLA!!!! ");
});

//API to Display last year leaderboard (Top 200) 
app.get('/api1', (req, res) => {
  pool.query('SELECT * FROM leaderboard where DATE(TIMESTAMP) > NOW() - INTERVAL \'1 YEAR\' limit 200;', (err, result) => {
    if (err) {
      console.error('Error executing SQL query', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const response = {
        rows: result.rows
      };

      res.json(response);
    }
  });
});


//API to Display last 10 years leaderboard given a country by the user (Top 200)
app.get('/api2', (req, res) => {
  let country = req.query.id;
  pool.query('SELECT * FROM leaderboard where Country=\''+country+'\' and DATE(TIMESTAMP) > NOW() - INTERVAL \'10 YEAR\' limit 200;', (err, result) => {
    if (err) {
      console.error('Error executing SQL query', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const response = {
        rows: result.rows
      };

      res.json(response);
    }
  });
});


//API to  Fetch user rank, given the userId.
app.get('/api3', (req, res) => {
  let UID = req.query.id;
  pool.query('WITH cte1 AS '
+'(SELECT Name,UID,DENSE_RANK() OVER w AS rank FROM leaderboard WINDOW w AS (ORDER BY Score DESC))'
+'select * from cte1 where UID=\''+UID+'\';', (err, result) => {
    if (err) {
      console.error('Error executing SQL query', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const response = {
        rows: result.rows
      };

      res.json(response);
    }
  });
});

