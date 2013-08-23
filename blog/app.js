var config = require("./config"),
    express = require('express'),
    BlogPost = require("./blogPost")(config.db),
    ejs = require('ejs');

var app = express();

app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: config.secret}));
    app.use(app.router);
    app.set('views', __dirname + '/views');
    app.engine('html', ejs.renderFile);
    app.use(express.static('public'));
});

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
        res.render("404.ejs", {title: "404"});
        return;
    }
    BlogPost.find({_id: id}).exec(function(err, data){
        if(err || data.length === 0){
            res.status(404);
            res.render("404.ejs", {title: "404"});
        }else{
            res.render("blogPost.ejs", { title: data[0].title, post: data[0] });
        }
    });
});

app.get("/post", function(req, res){
    if(!req.session.loggedIn){
        res.redirect("/login");
    }else{
        res.render('blogForm.ejs', { title: "My Blog | New Post" });
    }
});

app.post("/post", function(req, res){
    BlogPost.create({
        title: req.body.title,
        body: BlogPost.processBody(req.body.body)
    }, function(err, data){
        if(err){

        }else{
            res.redirect("/post/" + data._id);
        }
    });
});

app.get("/login", function(req, res){
    res.render('loginForm.ejs', { title: "My Blog | Login" });
});

app.post("/login", function(req, res){
    if(req.body.password === "whosyourdaddy"){
        req.session.loggedIn = true;
        res.redirect("/");
    }else{
        req.session.loggedIn = false;
        res.redirect("/post");
    }
});

app.listen(config.port);
console.log("Now listening on", config.port);