const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt-nodejs');
const cors = require("cors");

const register = require("./controllers/register");
const signin = require("./controllers/signin");
const profile = require("./controllers/profile");
const image = require("./controllers/image");

const knex = require("knex");
const { handleSignin } = require("./controllers/signin");

// Postgres commands:

// Creating a database
// createdb -U postgres test
// psql -U postgres test

// Creating a table
// create table users (id serial primary key, name varchar(255), email varchar(255));
// insert into users (name, email) values ('john', 'john@doe.com);

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : 'postgres',
      password : 'test',
      database : 'smart-eyes'
    }
  });

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Success");
});

app.post("/signin", (req, res, db, bcrypt) => { signin.handleSignin(req, res, db, bcrypt) });

app.post("/register", (req, res) => { register.handleRegister(req, res, db, bcrypt) });

app.get("/profile/:id", (req, res) => { profile.handleProfile(req, res, db) });

app.put("/image", (req, res) => { image.handleImage(req, res, db) });

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`);
});

/*
/ --> res = this is working
/signin --> POST success / fail
/register --> POST = user
/profile/:userId --> GET
/image --> PUT --> user

*/