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

export const userAllBlogs=async(req,res)=>{
  try {
    const blogs = await Blog.find({ author: req.user._id });
    res.status(200).json({ blogs });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export default { createBlog ,allBlogs};
