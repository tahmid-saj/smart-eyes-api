const handleRegister = (req, res, db, bcrypt) => {
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
};

module.exports = {
    handleRegister: handleRegister,
};