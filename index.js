var express = require("express");
var bodyParser = require("body-parser");
var User = require("./models/User").User;
var session = require("express-session");
// var cookieSession = require("cookie-session");
var route = require("./routers");
var session_middleware = require("./middlewares/session");
var methodOverride = require("method-override");
var formidable = require("express-formidable");
var RedisStore = require("connect-redis")(session);
var http = require("http");
var realtime = require("./realtime");

var app = express();
var server = http.Server(app);
var sessionMiddleware = session({
    store:new RedisStore({}),
    secret:"superultrasecretword"
});

realtime(server,sessionMiddleware)

app.use("/public", express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

app.use(sessionMiddleware);
// app.use(cookieSession({
//     name:"session",
//     keys:["llave-1","llave-3"]
// }));

app.use(formidable.parse({ keepExtentions:true }));

/*app.use(session({
    secret: '123byuhbsdah12ub',
    resave:false,
    saveUninitialized:false
}));
*/
app.set("view engine", "jade");

app.get("/", function(req,res){
    // res.send("index");
    console.log(req.session.user_id);
    res.render("index",{ saludo:"Hola Hikaru"});
});
app.get("/login", function(req,res){
    res.render("login");
});
app.get("/signup", function(req,res){
    console.log("Cargando template registro");
    // res.send("index");
    // res.render("login");
    User.find(function(err, doc){
        console.log(doc);
    });
    res.render("signup");
});
app.post("/users", function (req, res) {
    console.log("Username: "+ req.body.username);
    console.log("Email: "+ req.body.email);
    console.log("Password: "+ req.body.password);
    console.log("Conf password: "+ req.body.password_confirmation);
    // res.render("form");
    var user  =  new User({
        email:req.body.email, 
        password: req.body.password,
        password_confirmation:req.body.password_confirmation,
        username:req.body.username,
    });
    user.save().then(function () {
        res.send("Usuario creado con éxito");
    }, function (err) {
        if (err) {
            console.log(String(err));
            res.send("Error al guardar usuario: "+String(err));
        }
    })
    // user.save(function(err){
    //     if (err) {
    //         console.log(String(err));
    //     }else{
    //         res.send("Registro creado con éxito");
    //     }
    // });
});
app.post("/sessions", function(req, res) {
    User.findOne({username: req.body.username, password: req.body.password},function (err, user) {
        // console.log(user);
        console.log("Pasando por sessions");
        req.session.user_id = user._id;
        // res.send("Hola " + user.username);
        res.render("app/home", { user });
    });
});
app.use("/api",session_middleware);
app.use("/api", route);

server.listen(3000);
console.log("Server is running in http://localhost:3000");
