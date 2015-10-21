var config = require("./config");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var ejs = require("ejs");
var BlogPost = require("./blogPost")(config.db);
var express = require("express");

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: false
}));
app.use(express.static("public"));
app.set("views", __dirname + "/views");
app.engine("html", ejs.renderFile);

app.get("/", function(request, response){
    BlogPost.find().sort({date: -1}).exec(function(err, data){
        response.render("index.ejs", {
             title: "My Blog",
             posts: data
        });
    });
});

app.get("/login", function(req, res){
    res.render("loginForm.ejs", {});
});

app.post("/login", function(req, res){
    if(req.body.password === "whosyourdaddy"){
        req.session.loggedIn = true;
        res.redirect("/newEntry");
    } else {
        req.session.loggedIn = false;
        res.redirect("/login");
    }
});

var ObjectId = require("mongoose").Types.ObjectId;
app.get("/post/:id", function(req, res){
    var id;
    try{
        id = new ObjectId(req.params.id);
    }catch(e){
        res.status(404);
        res.send("404 Page Not Found.");
        return;
    }
    BlogPost.find({_id: id}).exec(function(err, data){
        if(data.length === 0){
            res.status(404);
            res.send("404 Page Not Found.");
        }else{
            res.render("blogPost.ejs", {
                title: "My Blog | " + data[0].title,
                post: data[0]
            });
        }
    });
});

app.get("/newEntry", function(req, res){
    if(req.session.loggedIn){
        res.render("postForm.ejs", {});
    } else {
        res.redirect("/login");
    }
});

app.post("/newEntry", function(req, res){
    if(req.session.loggedIn){
        BlogPost.create({
            title: req.body.entryTitle,
            body: req.body.entryBody
        }, function(err, data){
            res.redirect("/post/" + data._id);
        });
    } else {
        res.redirect("/login");
    }
});

app.listen(config.port);
console.log("Listening on port", config.port);