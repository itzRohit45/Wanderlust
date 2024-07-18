const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");
const { schema } = require("./reviews");
const { string, required } = require("joi");

const userSchema=new Schema({
     email:{
        type:String,
        required:true,
     }
});
userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);