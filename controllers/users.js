const User=require("../models/user.js");

module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup=async (req,res)=>{
    try{
        let {username,email,password}=req.body;
        const newUser=new User({email,username});
        const regUser=await User.register(newUser,password);
        req.login(regUser,(err)=>{
            if(err)
                {
                    return next(err);
                }
             else 
            {
                // req.flash("success","Welcome to Wanderlust!");
                res.redirect("/listings");
            } 
        })
      }
      catch(err){
        // req.flash("error",err.message);
        res.redirect("/signup");
      }
};

module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login=async(req,res)=>{
    req.flash("success","Welcome back to Wanderlust");
    let redirectUrl=res.locals.redirectUrl ||"/listings";
    res.redirect(redirectUrl);
};

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err)
            {
                return next(err);
            }
         else 
        req.flash("success","You are logged out!");
        res.redirect("/listings");   
    })
};