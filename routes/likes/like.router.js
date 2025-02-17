import express from "express";
import { toggleBlogLikes } from "../../controller/likes/like.controller.js";
import requireAuth from "../../middleware/auth.middleware.js";

const likeRouter=express.Router();

likeRouter.post('/toggle-likes',toggleBlogLikes);

export default likeRouter;