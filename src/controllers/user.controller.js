import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { uplaodCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const userRegistration = asyncHandler(async (req, res) => {
  // get user details from frontend

  const { username, email, fullName, password } = req.body;
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with emai or username already exist!");
  }
  // console.log(req.files);
  // console.log(req.body)
  // const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverLocalPath = req.files?.coverImage[0]?.path;
  let avatarLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files?.avatar[0]?.path;
  }
  let coverLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverLocalPath = req.files?.coverImage[0]?.path;
  }
  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required!");

  const avatar = await uplaodCloudinary(avatarLocalPath);
  const coverImage = await uplaodCloudinary(coverLocalPath);
  if (!avatar) throw new ApiError(400, "Avatar file is required!");

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registerd successfully!"));

  // validation
  // check if user already exists: username , email
  // check for images, check for avatar
  // upload them to cloudinary,avatar
  // create user object -  create entry in Database
  // remove password and refresh token field form response
  // check for user creation
  // return response

  // res.status(200).json({ message: "OK" });
});
export { userRegistration };
