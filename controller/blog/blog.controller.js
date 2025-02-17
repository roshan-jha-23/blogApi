import Blog from "../../models/blog.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

export const createBlog = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const author = req.user._id;
    
    if (!title || !content || !tags) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    
    const blog = new Blog({ title, content, tags, author });
    await blog.save();
    res.status(201).json({ message: "Blog created successfully", blog });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const allBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const myLabel = {
      totalDocs: 'itemCount',
      docs: 'itemsList',
      limit: 'perPage',
      page: 'currentPage',
      nextPage: 'next',
      prevPage: 'prev',
      totalPages: 'pageCount',
      hasPrevPage: 'hasPrev',
      hasNextPage: 'hasNext',
      meta: 'paginator'
    };

    const options = {
      page,
      limit,
      customLabels: myLabel,
    };

    const pipeline = [
      { $sort: { [sortField]: sortOrder } },
      {
        $lookup: {
          from: 'users', 
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } }
    ];

    const aggregate = Blog.aggregate(pipeline);

    const blogs = await Blog.aggregatePaginate(aggregate, options);

    res.status(200).json({ blogs });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const userAllBlogs = async (req, res) => {
  try {
    const user = req.user._id;
    console.log(user);
    const label = {
      totalDocs: 'itemCount',
      docs: 'itemsList',
      limit: 'perPage',
      page: 'currentPage',
      nextPage: 'next',
      prevPage: 'prev',
      totalPages: 'pageCount',
      hasPrevPage: 'hasPrev',
      hasNextPage: 'hasNext',
      pagingCounter: 'pageCounter',
      meta: 'paginator'
    };
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const options = {
      page,
      limit,
      customLabels: label,
    };
    const pipeline = [
      { $match: { author: user } },
      { $sort: { [sortField]: sortOrder } },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorDetails'
        }
      },
      { $unwind: { path: '$authorDetails', preserveNullAndEmptyArrays: true } }
    ];

    const aggregate = Blog.aggregate(pipeline);
    const blogs = await Blog.aggregatePaginate(aggregate, options);

    res.status(200).json({ blogs });
  } catch (error) {
    console.error(error+"at the get all user blog end point");
    res.status(400).json({ message: error.message });
  }
};

export const deleteABlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const user = req.user._id;

    if (!user) {
      return res.status(401).json({ message: "You must be logged in to take this action" });
    }
    if (!blogId) {
      return res.status(400).json({ message: "Blog id is required" });
    }
    
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    if (blog.author.toString() !== user.toString()) {
      return res.status(403).json({ message: "You are not the author of this blog" });
    }
    
    await Blog.findByIdAndDelete(blogId);
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error at the delete blog endpoint:", error);
    res.status(400).json({ message: "Some internal error occurred while deleting the blog "});
  }
};

export const countLikes = async (req, res) => {
  try {
    const blogId = req.params.id;
    if (!blogId) {
      return res.status(400).json({ message: "Blog id is required" });
    }

    const blog = await Blog.findById(blogId).select("likes");
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const likesCount = Array.isArray(blog.likes) ? blog.likes.length : blog.likes;

    return res.status(200).json({ likes: likesCount });
  } catch (error) {
    console.error("Error counting likes:", error);
    return res.status(500).json({ message: error.message });
  }
};


export default { createBlog ,allBlogs,userAllBlogs,deleteABlog,countLikes};
