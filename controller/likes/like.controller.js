import { isValidObjectId } from "mongoose";
import Like from "../../models/like.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

export const toggleBlogLikes = async (req, res) => {
  try {
    const { blogId } = req.params.id;
    if (!isValidObjectId(blogId)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }
    const likeAlready = await Like.findOne({
      blog: blogId,
      user: req.user._id,
    });
    if (likeAlready) {
      await Like.deleteOne({ blog: blogId, user: req.user._id });
      return res.status(200).json({ message: "Like removed" });
    }
    const newLike = new Like({
      blog: blogId,
      user: req.user._id,
    });
    await newLike.save();
    return res.status(200).json({ message: "Like added" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const likedBlog = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const customLabels = {
      totalDocs: "itemsCount",
      docs: "itemsList",
      nextPage: "next",
      prevPage: "prev",
      totalPages: "pagesCount",
      pagingCounter: "slNo",
      meta: "paginator",
    };

    const options = {
      page,
      limit,
      customLabels,
    };
    const pipeline = [
      { $match: { userId: req.user.id } },
      {
        $lookup: {
          from: "blogs",            
          localField: "blogId",       
          foreignField: "_id",     
          as: "blogDetails"
        }
      },
      
      { $sort: { [sortField]: sortOrder } },
    ];

    const aggregateQuery = Like.aggregate(pipeline);

    const result = await Like.aggregatePaginate(aggregateQuery, options);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching liked blogs:", error);
    return res.status(500).json({ message: error.message });
  }
};

export default {
  toggleBlogLikes,
  likedBlog,
};
