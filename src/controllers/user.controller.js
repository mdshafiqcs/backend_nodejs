
import { User } from "../models/index.js"
import { ApiError, ApiResponse, asyncHandler, uploadOnCloudinary } from "../utils/index.js"
import jwt from "jsonwebtoken";


const cookieOptions = {httpOnly: true, secure: true}

const generateAccessAndRefreshTokens = async (userId) => {
  try {

    const user = await User.findById(userId);

    if(!user){
      throw new ApiError(404, "User not found to generate access tokens");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

    return {accessToken, refreshToken};

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
  }
}

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
    [username, email, fullname, password].some((field) => field === "" || field === undefined)
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
    new ApiResponse(201, createdUser, "User Registration Successful, Login to your account to continue")
  )

})

const loginUser = asyncHandler( async(req,res) => {
  const {username, email, password} = req.body;

  if(!username && !email){
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{email}, {username}]
  })

  if(!user){
    throw new ApiError(404, "User not found with this email and password");
  }

  if(!user.isPasswordCorrect(password)){
    throw new ApiError(401, "Invalid Password");
  }
  user.password = undefined;
  user.refreshToken = undefined;

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

  return res.status(200)
  .cookie("accessToken", accessToken, cookieOptions)
  .cookie("refreshToken", refreshToken, cookieOptions)
  .json(
    new ApiResponse(200, {
      user,
      accessToken,
      refreshToken,
    })
  )
})

const logoutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
    req.user._id, 
    {
      $set: {refreshToken: undefined}
    }
  );

  return res.status(200)
  .clearCookie("accessToken", cookieOptions)
  .clearCookie("refreshToken", cookieOptions)
  .json(
    new ApiResponse(200, null, "Logout Successful")
  )

})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id);
    
    if(!user){
      throw new ApiError(401, "invalid refresh token");
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "refresh token is expired or used");
    }
  
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user?._id);
  
    return res.status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
              new ApiResponse(200, { accessToken, refreshToken }, "access token refreshed")
            )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh token");
  }

})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
}