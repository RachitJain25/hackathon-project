//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const alert = require('alert');
const sendEmail = require('./nodemailerapp');
const mongoose = require("mongoose");

const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();
mongoose.set('strictQuery', true);
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false,
}));


app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb+srv://Atishay_jain_25:025matru@cluster0.twfidla.mongodb.net/bloodMitr", { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
  email: { type: String, require: true, index: true, unique: true, sparse: true },
  password: { type: String, require: true },
  googleId: String,

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/home",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
  function (accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id, username: profile.email }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function (req, res) {
  res.render("signin");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] }));

app.get("/auth/google/home",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {

    res.redirect('/home');
  });
app.get("/login", function (req, res) {
  res.render("signin");
});

app.get("/signup", function (req, res) {
  res.render("signin");
});
app.get("/home", function (req, res) {
  if (req.isAuthenticated()) {
    console.log("Authenticated");
    res.render("main");
  }
  else {
    console.log("not auth");
    res.redirect("/login");
  }


});


app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.log(err);
    }
  });
  res.redirect("/");
});
app.post("/signup", function (req, res) {
  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/home");
      });
    }
  })

});
app.post("/signin", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/home");
      });
    }
  });

});

const donateSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobilenum: String,
  age: String,
  address: String,
  gender: String,
  ocuupation: String,
  bloodgroup: String,
  donationdate: Date,
  city: String,
  state: String
});

const donateUser = new mongoose.model("doanteUser", donateSchema);

app.post("/donate", function (req, res) {

  const City = req.body.city
  const donor = new donateUser({
    name: req.body.name,
    email: req.body.email,
    mobilenum: req.body.mobilenum,
    address: req.body.address,
    gender: req.body.gender,
    age: req.body.age,
    ocuupation: req.body.occupation,
    bloodgroup: req.body.bloodgroup,
    donationdate: req.body.donationdate,
    city: City,
    state: req.body.state
  });
  // Define the location to search around
  var location = City;
  var api_key = 'AIzaSyD1i9_yLXD3UahclR2YF1bsAQsvAIE60mU';
  var request_url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=blood+bank+in+' + location + '&key=AIzaSyD1i9_yLXD3UahclR2YF1bsAQsvAIE60mU';

  fetch(request_url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // console.log(data.results);
      donor.save().then(function () {

        res.render("successDonor", { foundData: data.results });
      })
        .catch(function (err) {
          console.log(err);
          alert("Form not Submitted");
          res.redirect("/home");
        });
    })
    .catch(function (error) {
      console.error(error);
      alert("Cannot fetch Details");
      res.redirect("/home");
    });

});


const volunteerSchema = new mongoose.Schema({
  name: String,
  phoneno: String,
  email: String,
  age: String,
  bloodgroup: String,
  state: String,
  city: String,
  gender: String

});

const volunteer = new mongoose.model("volunteer", volunteerSchema);

app.post("/volunteer", function (req, res) {
  const newVol = new volunteer({
    name: req.body.name,
    phoneno: req.body.mobileno,
    email: req.body.email,
    age: req.body.age,
    bloodgroup: req.body.bloodgroup,
    state: req.body.state,
    city: req.body.city,
    gender: req.body.gender

  });


  volunteer.findOne({ email: req.body.email })
    .then(function (foundUser) {
      if (foundUser) {
        alert("Volunteer registered on this Email");
        res.redirect("/joinus");
      }
      else {

        newVol.save().then(function () {
          alert("Volunteer Registered Successfully , You will get important info via email⭐⭐");
          res.redirect("/home");
        })
          .catch(function (err) {
            console.log(err);
            res.redirect("/joinus")
          });
      }

    })


});

app.get("/voldet", function (req, res) {

  if (req.isAuthenticated()) {
    volunteer.find({})
      .then(function (foundUsers) {
        if (foundUsers) {
          // console.log(foundUsers);
          res.render("volunteerDet", { foundVoln: foundUsers })
        }
        else {
          alert("No Volunteers for now!! JOIN NOW");
          res.redirect("/home");

        }
      })
      .catch(function (err) {
        console.log(err);
      });

  }
  else {
    res.redirect("/");
  }

})


let date = new Date().toJSON();
console.log(date);


const findADonor = new mongoose.Schema({
  pname: String,
  phoneno: String,
  email: String,
  age: String,
  bloodgroup: String,
  state: String,
  city: String,
  gender: String,
  address: String

});

const nFDonor = new mongoose.model("nFDonor", findADonor);

app.post("/fadon", function (req, res) {
  const newFD = new nFDonor({
    pname: req.body.name,
    phoneno: req.body.phone,
    email: req.body.email,
    age: req.body.age,
    bloodgroup: req.body.bloodgroup,
    state: req.body.state,
    city: req.body.city,
    address: req.body.address

  });
  newFD.save().then(function () {
    alert("Your Request for finding a Donor has been accepted.⭐⭐");
    donateUser.find({ donationdate: { $gte: date } })
      .then(function (donor) {
        if (donor) {
          res.render("sucFindReq", { foundDon: donor, message: "" ,pname:newFD.pname,phoneno:newFD.phoneno,email:newFD.email,age:newFD.age,bloodgroup:newFD.bloodgroup,address:newFD.bloodgroup,address:newFD.address,city:newFD.city,state:newFD.state});
        }
        else {
          alert("No Donor avaliable");
          res.render("sucFindReq", { foundDon: donor, message: "OOP! no donor avaliable Send emergency SOS!",pname:newFD.name,phoneno:newFD.phoneno,email:newFD.email,age:newFD.age,bloodgroup:newFD.bloodgroup,address:newFD.bloodgroup,address:newFD.address,city:newFD.city,state:newFD.state});
        }
      })
      .catch(function (err) {
        console.log(err);
        alert("Error");
        res.redirect("/home");
      })
  })
    .catch(function (err) {
      console.log(err);
      res.redirect("/joinus")
    });
});

app.post("/sos", function (req, res) {
  var toEmail = [];
  var message = "Details of patient:\n"+req.body.name+"\n"+req.body.phoneno+"\n"+req.body.email+"\n"+req.body.age+"\n"+req.body.bloodgroup+"\n" + req.body.address+"\n"+req.body.city+"\n" + req.body.state+"\nKindly conatct above person if required blood group donor found!";
  console.log(message);
  volunteer.find({})
  .then(function(foundVol){
    if(foundVol){
      foundVol.forEach(function(vol){
        toEmail .push(vol.email);
      });
      console.log(toEmail);
      sendEmail( toEmail, message);
      alert("If blood donor is found our volunteer will contact you");
      res.redirect("/home");
    }
    else{
      alert("SOS cannot send");
      res.redirect("/home");
    }
  })
  .catch(function(err){
    console.log(err);
    res.redirect("/home");
  });
  
});









app.get("/donate", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("bloodDonation_form");
  }
  else {
    res.redirect("/");
  }
});

app.get("/joinus", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("volunteer");
  }
  else {
    res.redirect("/");
  }
});
app.get("/fadon", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("find_a_donor");
  }
  else {
    res.redirect("/");
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
})
