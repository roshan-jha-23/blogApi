import express from "express";
import { likedBlog, toggleBlogLikes } from "../../controller/likes/like.controller.js";
import requireAuth from "../../middleware/auth.middleware.js";

const likeRouter=express.Router();

likeRouter.post('/toggle-likes',toggleBlogLikes);
likeRouter.get('/blogs-i-liked',likedBlog);

export default likeRouter;