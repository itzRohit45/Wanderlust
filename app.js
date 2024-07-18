if(process.env.NODE_ENV !="production")
    {
        require('dotenv').config()
    }

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const expressError=require("./utils/expressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');

const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const Listing=require("./models/listing.js");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

const port=8080;

const dburl=process.env.ATLASDB_URL;  //db-cloud url

main().then(()=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(dburl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public")));

const store=MongoStore.create({
    mongoUrl:dburl,
    crypto:{
       secret:process.env.SECRET,
    },
    touchAfter:24 * 3600,
});

store.on("error",()=>{
    console.log("EROOR in MONGO-SESSION STORE",err);
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    }
};

// app.get("/",(req,res)=>{
//     res.send('Hi,I am Root');
// });
 
app.use(session(sessionOptions));   //session
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.successMsg=req.flash("success");
    res.locals.errorMsg=req.flash("error");
    res.locals.currUser=req.user;
    next();
})  


app.use("/listings",listingRouter);  //listings route
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.get("/privacy",(req,res)=>{
    res.render("listings/privacy.ejs");
})
app.get("/terms",(req,res)=>{
    res.render("listings/terms.ejs");
})

app.get("/listings/:id/book",async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    res.render("users/book.ejs",{listing});
})

app.post("/listings/:id/book/details",async(req,res)=>{
    let {id}=req.params;
    let {checkin,guests,total}=req.body;
    let listing=await Listing.findById(id);
    res.render("users/detail.ejs",{listing,checkin,guests,total});
})

app.all("*",(req,res,next)=>{
    next(new expressError(404,"Page not found!"));
})

app.use((err,req,res,next)=>{     //eroor handle middleware
    let {statusCode=500,message="Something went wrong!"}=err;
    res.status(statusCode).render("listings/error.ejs",{message});
})
app.listen(port,()=>{
    console.log(`listening to app on port ${port}`);
})