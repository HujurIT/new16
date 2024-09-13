const express = require("express");
const app = express();
const path = require("path");

// thart parti pakes
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// model 
let userModel = require("./models/user")
let postModel = require("./models/post");
const cookieParser = require("cookie-parser");


app.use(cookieParser())
app.set("view engine", "ejs")
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,)));


app.get("/",(req,res)=>{
    res.render("index")
})
app.get("/registerAPI",(req,res)=>{
    res.render("register")
})
app.post("/register",async (req,res)=>{
    let {userName,email,password} = req.body;
    let findUserRegistered = await userModel.findOne({email: email});
    if(findUserRegistered) res.send("You are already registered. Please try login this email")
    else {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt,async function(err, hash) {
                let createUser = await userModel.create({
                    userName,
                    email,
                    password:hash
                })
                res.redirect("/login")
            });
        });
}
})
app.get("/login",(req,res)=>{
    res.render("login")
})
app.post("/loginUser",async (req,res)=>{
    let {email,password} = req.body;
    let findUserRegisted = await userModel.findOne({email: email});
    if(findUserRegisted) {
        bcrypt.compare(password, findUserRegisted.password, function(err, result) {
            if(result) {
                let token = jwt.sign(email,"secret")
                res.cookie("token",token)
                res.redirect("/profile")
            } else {
                res.redirect("/login")
            }
        });
    }
})
app.get("/profile",isLoggedIn,(req,res)=>{
    res.render("profile")
})
app.get("/logout",(req,res)=>{
    res.cookie("token","")
    res.redirect("/login")
})
app.get("/post/create",async (req,res)=>{
    let postCreate = await postModel.create({
        title: "newproduct",
        content: "lorem10jfdjsfjs jsjf",
        author: "66e3b186eca6f8fddbfa0d66"
    })
    let userFind = await userModel.findOne({_id:"66e3b186eca6f8fddbfa0d66"});
    userFind.posts.push(postCreate._id)
    await userFind.save();
    res.send([userFind,postCreate])
})

function isLoggedIn(req, res, next){
    if(req.cookies.token === "") res.redirect("/login");
    else{
        let userFindData = jwt.verify(req.cookies.token,"secret");
        req.userData = userFindData;
        next();
    }
}
app.listen(3000)