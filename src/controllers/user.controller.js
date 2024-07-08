
import { User } from "../models/index.js"
import { ApiError, ApiResponse, asyncHandler, uploadOnCloudinary } from "../utils/index.js"
import fs from "fs";



const registerUser = asyncHandler(async(req, res)=> {
  // get user details from frontend
  // validate user details
  // check user already exists using username, email
  // check for images, avatar
  // upload on cloudinary
  // create user object,
  // remove password and refreshToken field
  // check for user creation
  // return res


  const {username, email, fullname, password} = req.body;

  if(
    [username, email, fullname, password].some((field) => field.trim() === "")
  ){
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{username},{email}]
  });

  if(existedUser){
    throw new ApiError(409, "User already exist with this email or username");
  }

  let avatarLocalPath;

  if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
    avatarLocalPath = req.files.avatar[0].path;
  }

  if(!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  let coverLocalPath;

  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverLocalPath = req.files.coverImage[0].path;
  }

  let coverImage;

  if(coverLocalPath){
    coverImage = await uploadOnCloudinary(coverLocalPath);
  }

  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    password,
    email: email.toLowerCase(),
    avatar: avatar.url,
    coverImage: (coverImage && coverImage.url) ? coverImage.url : ""
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User Registration Successful")
  )

})

export {registerUser}