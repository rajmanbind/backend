import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { uplaodCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken(); //short live
    const refreshToken = await user.generateRefreshToken(); //long live
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error.message);
    throw new ApiError(500, "Internal server error");
  }
};

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
    throw new ApiError(409, "User with email or username already exist!");
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
    console.log(avatarLocalPath);
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
  console.log(avatarLocalPath, coverLocalPath);
  const avatar = await uplaodCloudinary(avatarLocalPath);
  const coverImage = "";
  if (coverLocalPath) {
    coverImage = await uplaodCloudinary(coverLocalPath);
  }
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

const loginUser = asyncHandler(async (req, res) => {
  // check for username or email
  // check for password
  //based on  matching with username or email and password, user should login
  //send cookie
  const { email, username, password } = req.body;
  // console.log(temp);
  try {
    if (!email && !username) {
      throw new ApiError(400, "username or email required!");
    }
    if (!password) {
      throw new ApiError(400, "password required!");
    }
    const user = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (!user) {
      throw new ApiError(404, "user does not exist!");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    // console.log(user, isValidPassword);
    // console.log(isPasswordValid);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User logged In Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRegreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRegreshToken) {
      throw new ApiError(401, "unothorized request");
    }
    const decodedToken = jwt.verify(
      incomingRegreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRegreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);
    return res
      .status(200)
      .cookies("accessToken", accessToken, options)
      .cookies("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});  

export { userRegistration, loginUser, logoutUser,refreshAccessToken };
