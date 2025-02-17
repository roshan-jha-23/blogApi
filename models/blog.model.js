import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";



const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: [true, "This title has been taken"] },
    content: { type: String, required: [true, "This field cannot remain empty"], maxlength: [1000, "Cannot exceed more than 1000 characters"] },
    tags: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

blogSchema.plugin(mongooseAggregatePaginate);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
