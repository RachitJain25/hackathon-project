const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs"); 
const mongoose = require('mongoose');
const alert = require('alert');

const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Atishay_jain_25:025matru@cluster0.twfidla.mongodb.net/bloodMitr",{useNewUrlParser : true});



const userSchema = ({
    name : String,
    email : String,
    password :String
});

const User = new mongoose.model("User", userSchema);

app.post("/signup", function(req,res){
    const newUser = new User({
        name : req.body.username,
        email : req.body.email,
        password : req.body.password
    });
    User.findOne({email:req.body.email})
    .then(function (foundUser) {
        if(foundUser){
            alert("Email alredy exist");
            res.render("signin");
        }
        else{
            
            newUser.save().then(function(){
                alert("Account created successfully✅✅");
                res.render("signin");
            })
            .catch(function(err){
                console.log(err);
            });
        }
      
    })
    .catch(function (err) {
      console.log(err);
    });
    
});
app.post("/signin" ,function(req,res){
    const Password = req.body.password;
    User.findOne({email: req.body.email})
    .then(function(foundUser){
        if(foundUser){
            if(foundUser.password=== Password){
                alert("Logged in successfully......");
                res.render("main");
            }
            else{
                alert("Wrong password TRY AGAIN....");
                res.render("signin");
            }
        }
        else{
            alert("User not found.... TRY AGAIN");
            res.render("signin");
        }
    })
    .catch(function (err) {
        console.log(err);
     });
});

app.get("/", function(req,res){
    res.render("main");
});
app.get("/login",function(req,res){
    res.render("signin");
});


app.listen(3000,function(){
    console.log("Server is running on port 3000");
})