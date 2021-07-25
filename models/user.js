const mongoose=require('mongoose');
const passportLocalMongoose=require('passport-local-mongoose');
const Schema=mongoose.Schema;

const UserSchema=new Schema({
  email:{
    type:String,
    required:true
  }
});
UserSchema.plugin(passportLocalMongoose)//adds necessary username and password fields and makes sure that usernames are unique

module.exports=mongoose.model('User',UserSchema);
