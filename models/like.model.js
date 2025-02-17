import mongoose from "mongoose";

const likesSchema=new mongoose.Schema({
    blog:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Blog"
    },
    user:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"User"
    }
},{timestamps:true})

const Like=mongoose.model('Like',likesSchema);
export default Like;