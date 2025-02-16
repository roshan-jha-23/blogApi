import express from "express";
import requireAuth from "../../middleware/auth.middleware.js";
import { allBlogs, createBlog } from "../../controller/blog/blog.controller.js";
const blogRouter=express.Router();

blogRouter.post('/create-a-blog',requireAuth,createBlog);
blogRouter.get('/get-all-blog',allBlogs)

export default blogRouter