const express = require('express');
const db = require('./database.js');
const flash = require("express-flash");
var sess = require("express-session");
var exp_val = require('express-validator');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var an = require("alert-node");
const bcrypt = require("bcrypt");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(cookieParser('notMonday'));
app.use(sess({
    secret: 'notMonday',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 24*60*60000}
}));
//app.use(sess());
app.use(exp_val());
app.use(flash());

let port = process.env.PORT;
if (port == null || port == "") {
    port = 8000;
}var path = __dirname + '/public/'

app.use(express.static(path));

app.get('/', (req, res) => res.sendFile(path + 'home.html'))

app.get('/verify', function (req, res) {
    res.sendFile(path + "login.html")
    console.log("Here I am in app.get(verify)");
})

function getHash(user) {
    var hash = '';
    var query = "select login.username, login.hashvalue from login" +
                " where login.username = '" + user + "'";
    db.any(query).then(function (data) {
            hash = data[0].hashvalue;
            console.log("hash function=", hash);
            console.log(hash);
    });
    return hash;
}

app.post('/verify', function (req, res) {
    console.log("Hello world");
    req.assert("user","user required").notEmpty();
    req.assert("pass","pass required").notEmpty();

    var username = req.body.user;
    var pass = req.body.pass;
    console.log("test");
    
    var errors = req.validationErrors();
    
    if (!errors) {
        var query = "select login.username, login.hashvalue from login" +
                    " where login.username = '" + username + "'";
        db.any(query).then(function (data) {
            var hash = data[0].hashvalue;
            console.log("hash function=", hash);
            final = bcrypt.compareSync(pass, hash);
            console.log("hash =", hash);
            if (final){
                req.session.user = username;
                res.redirect("home_logout.html");
            }
            else {
                res.redirect("login.html");
            }
        })
        .catch(function () {
            res.redirect("login.html");
        });
    }
    else {
        req.flash('error', 'Im trying flash');
        an("Error! Did you put in a username and a password?", "window");
        res.redirect("login.html");
    }
    console.log("ding! the function's done");

});

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect("home.html");
});

app.get('/signup', function (req, res) {
    res.sendFile(path + "login.html")
    console.log("Here I am in app.get(signup)");
})

app.post('/signup', function (req, res) {
    console.log("Hello world Sign up");
    req.assert("user","user required").notEmpty();
    req.assert("pass","pass required").notEmpty();

    var username = req.body.user;
    var pass = req.body.pass;
    var hash = bcrypt.hashSync(pass,11);
    console.log("testing signup");
    
    var errors = req.validationErrors();
    console.log(errors);
    
    if (!errors) {
        var query = 'insert into login (username, hashvalue) values (' + "'" + username + "'" + ', ' + "'" + hash + "'" + ')';
        db.none(query);
        res.redirect("login.html");
    }
    else {
        req.flash('error', 'Im trying flash');
        an("Error! Did you put in a username and a password?", "window");
        res.redirect("login.html");
    }
    console.log("ding! the function's done");

});

app.get('/button', function (req, res) {
    if(!req.session.user){
        res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    }
    else{
        res.redirect("home_logout.html");
    }
});

app.listen(port, () => console.log(`Listening on port ${port}!`))

module.exports = app; 
