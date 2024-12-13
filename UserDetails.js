const mongoose=require("mongoose");

const UserDetailSchema = new mongoose.Schema({
    username:String,
    password:String,
    fullname:String,
    bio:String,  
    address:String,
    pronouns:String,
},{
    collection:"UserInfo",
});
mongoose.model("UserInfo", UserDetailSchema);