const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt-nodejs');
const cors = require("cors");

const knex = require("knex");

// Postgres commands:

// Creating a database
// createdb -U postgres test
// psql -U postgres test

// Creating a table
// create table users (id serial primary key, name varchar(255), email varchar(255));
// insert into users (name, email) values ('john', 'john@doe.com);

// const db = knex({
//     client: 'pg',
//     connection: {
//         host: '127.0.0.1',
//         user: 'tahmidsaj',
//         password: "",
//         database: 'smart-eyes'
//     }
// });

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

// db.select("*").from("users").then(data => {
//     console.log(data);
// });

const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

// bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
//     // result == true
// });
// bcrypt.compare(someOtherPlaintextPassword, hash, function(err, result) {
//     // result == false
// });

const app = express();

app.use(bodyParser.json());
app.use(cors());

const database = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date(),
        },
        {
            id: '123',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date(),
        }
    ]
};

app.get("/", (req, res) => {
    res.send(database.users);
});

app.post("/signin", (req, res) => {
    // bcrypt.compare("bacon", hash, function(err, res) {
    //     console.log("first guess", res);
    // });

    if (req.body.email === database.users[0].email && req.body.password === database.users[0].password) {
        res.json(database.users[0]);
    } else {
        res.status(400).json("error logging in");
    }
});

app.post("/register", (req, res) => {
    const { email, name, password } = req.body;

    // bcrypt.hash(password, null, null, function(err, hash) {
    //     console.log(hash);
    // });

    // database.users.push({
    //     id: '123',
    //     name: name,
    //     email: email,
    //     entries: 0,
    //     joined: new Date(),
    // });

    db("users")
    .returning("*")
    .insert({
        email: email,
        name: name,
        joined: new Date()
    })
    .then(user => {
        res.json(user[0].name);
    })
    .catch(err => {
        res.status(400).json('Unable to register');
    });
});

app.get("/profile/:id", (req, res) => {
    const { id } = req.params;

    db("users")
    .select("*")
    .from("users")
    .where({
        id: id
    })
    .then(user => {
        if (user.length) {
            res.json(user[0].id);
        } else {
            res.status(400).json('User not found');
        }
    })
    .catch(err => {
        res.status(400).json("Error getting user");
    });
});

app.put("/image", (req, res) => {
    const { id } = req.body;

    db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then(entries => {
        res.json(entries[0].entries);
    })
    .catch(err => {
        res.status(400).json("Unable to get entries");
    });
});

app.listen(3000, () => {
    console.log("app is running on port 3000");
});

/*
/ --> res = this is working
/signin --> POST success / fail
/register --> POST = user
/profile/:userId --> GET
/image --> PUT --> user

*/