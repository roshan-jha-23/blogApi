import { isValidObjectId } from "mongoose";
import Like from "../../models/like.model.js"

export const toggleBlogLikes=async(req,res)=>{
    try {
        const {blogId}=req.params.id;
        if(!isValidObjectId(blogId)){
            return res.status(400).json({message:"Invalid blog id"});
        }
        const likeAlready=await Like.findOne({
            blog:blogId,
            user:req.user._id
        });
        if(likeAlready){
            await Like.deleteOne({blog:blogId,user:req.user._id});
            return res.status(200).json({message:"Like removed"});
        }
        const newLike=new Like({
            blog:blogId,
            user:req.user._id
        });
        await newLike.save();
        return res.status(200).json({message:"Like added"});
    } catch (error) {
        return res.status(500).json({message:error.message});
    }
}
const likedBlog=async(req,res)=>{
    try {
        //i will try to get all the blogs that has been liked by the user 
    } catch (error) {
        
    }
}