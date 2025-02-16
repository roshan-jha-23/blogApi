import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Username is a required field"],
      lowercase: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is a required field"],
      lowercase: true,
      trim: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is a required field"],
      trim: true,
      minlength: [6, "Minimum password length is 6 characters"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyToken: {
      type: Number,
      default: null,
    },
    verifyTokenExpiry: {
      type: Date,
      default: null,
    },
    passwordToken: {
      type: Number,
      default: null,
    },
    passwordTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true } 
);

userSchema.index({ email: 1 });
userSchema.index({ verifyToken: 1 });
userSchema.index({ passwordToken: 1 });

const User = mongoose.model("User", userSchema);

export default User;
