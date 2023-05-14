const handleSignin = (req, res, db, bcrypt) => {
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
};

module.exports = {
    handleSignin: handleSignin,
};