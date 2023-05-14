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

// const database = {
//     users: [
//         {
//             id: '123',
//             name: 'John',
//             email: 'john@gmail.com',
//             password: 'cookies',
//             entries: 0,
//             joined: new Date(),
//         },
//         {
//             id: '123',
//             name: 'Sally',
//             email: 'sally@gmail.com',
//             password: 'bananas',
//             entries: 0,
//             joined: new Date(),
//         }
//     ]
// };

app.get("/", (req, res) => {
    res.send("Success");
});

app.post("/signin", (req, res) => {
    // bcrypt.compare("bacon", hash, function(err, res) {
    //     console.log("first guess", res);
    // });

    db.select("email", "hash").from("login")
    .where("email", "=", req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);

        if (isValid) {
            return db.select("*").from("users")
            .where("email", "=", req.body.email)
            .then(user => {
                res.json(user[0]);
            })
            .catch(err => res.status(400).json("Unable to get user"));
        } else {
            res.json(400).json("Wrong credentials");
        }
    })
    .catch(err => res.status(400).json("Wrong credentials"));
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

    const hash = bcrypt.hashSync(password);

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into("login")
        .returning("email")
        .then(loginEmail => {
            return trx("users")
            .returning("*")
            .insert({
                email: loginEmail[0].email,
                name: name,
                joined: new Date()
            })
            .then(user => {
                res.json(user[0]);
            })
            .catch(err => {
                res.status(400).json('Unable to register');
            });
        })
        .then(trx.commit)
        .catch(trx.rollback);
    });


});

app.get("/profile/:id", (req, res) => {
    const { id } = req.params;

    return db("users")
    .select("*")
    .from("users")
    .where({
        id: id
    })
    .then(user => {
        if (user.length) {
            res.json(user[0]);
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

    return db("users")
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