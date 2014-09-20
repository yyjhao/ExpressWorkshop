/**********************************
    start
*/

var config = require("./config.json"),
    express = require("express");

var app = express();

app.get("/", function(request, response){
    response.send("Greetings world!");
});


// later
app.get("/login", function(req, res){
    response.send("This is not the login page.");
})

// later later
app.get("/post/:id", function(req, res){
    res.send("ID is " + req.params.id);
});

app.listen(config.port);
console.log("listening");

/*************************************
    ejs
*/
//var config = require("./config"),
//    express = require("express"),
    ejs = require('ejs');

//var app = express();

app.set('views', __dirname + '/views');
// __dirname returns the current directory of the app
app.engine('html', ejs.renderFile);

//app.get("/", function(request, response){
    response.render("index.ejs", {title: "My blog", content: "Greetings visitor!"});
//});

//app.get("/post/:id", function(req, res){
//    res.send("ID is " + req.params.id);
//});

//app.listen(config.port);
//console.log("listening");

/*****************************************
    ejs posts
*/

app.get("/", function(request, response){
    response.render("index.ejs", {
        posts: [{
            title: "Post 1",
            body: "Some content"
        }, {
            title: "Post 2",
            body: "Some content again"
        }],
        title: "My Blog"
    });
});

/*
    ejs post
*/
app.get("/posts/:id", function(req, res){
    res.render("blogPost.ejs", {
        post: {
            title: req.params.id,
            body: "Content for " + req.params.id
        },
        title: "My Blog | " + req.params.id
    });
});

/*
    mongo stff
    // blogPost.js refer to completed project
*/
BlogPost = require("./blogPost")(config.db);

//later
// explain mongo id is not string
var ObjectId = require('mongoose').Types.ObjectId;

app.get("/", function(req, res){
    BlogPost.find().sort({date: -1}).exec(function(err, data){
        res.render('index.ejs', { title: "My Blog", posts: data });
    });
});

app.get("/post/:id", function(req, res){
    var id;
    try{
        id = new ObjectId(req.params.id);
    }catch(e){
        res.status(404);
        res.render("404.ejs", { title: req.params.id + " not found" });
        return;
    }
    BlogPost.find({_id: id}).exec(function(err, data){
    // _id is what we use to reference a unique element in mongodb
        if(err || data.length === 0){
            res.status(404);
            res.render("404.ejs", { title: req.params.id + " not found" });
        }else{
            res.render("blogPost.ejs", { title: data[0].title, post: data[0] });
        }
    });
});

/*
    blog form
*/
app.get("/post", function(req, res){
    res.render('blogForm.ejs');
});

/*
    process form
*/
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post('/post', function(req, res) {
    BlogPost.create({
        title: req.body.entryTitle,
        body: req.body.entryBody
    }, function(err, data) {
        if (!err) {
            res.redirect('/post/' + data._id);
        }
    });
});

/*
    session
*/
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
app.use(cookieParser());
app.use(expressSession({
    secret: config.secret,
    resave: true,
    saveUninitialized: false
}));

app.get("/post", function(req, res){
    if(!req.session.loggedIn){
        res.redirect("/login");
    }else{
        res.render('blogForm.ejs', { title: "My Blog | New Post" });
    }
});

app.get("/login", function(req, res){
    res.render('loginForm.ejs', { title: "My Blog | Login" });
});

app.post('/login', function(req, res) {
    if (req.body.password === 'whosyourdaddy') {
        req.session.loggedIn = true;
        res.redirect('/post');
    } else {
        req.session.loggedIn = false;
        res.redirect('/login');
    }
});

/*
    static assets
*/