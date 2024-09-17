import { Request, Response } from "express";
import User from "../models/user.model";
import Friendship from "../models/friendship.model";

const generateAccessAndRefreshToken = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error: any) {
    console.log("Error generating Access and Refresh token", error.message);
    throw error;
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, password, hobbies } = req.body;
    if ([username, password, hobbies].some((field) => field === undefined)) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const userWithUsername = await User.findOne({ username });
    if (userWithUsername) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    }

    const user = await User.create({ username, password, hobbies });
    user.save();
    const newUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    console.log("User register with id:", user.id);

    res.status(201).json({ success: true, user: newUser });
  } catch (error: any) {
    console.log(error);

    res.status(400).json({ error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if ([username, password].some((field) => field === undefined)) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const newUser = await User.findById(user._id).select("-password");
    const options = {
      httpOnly: true,
    };
    console.log("User login with id:", user.id);

    secure: process.env.NODE_ENV === "production",
      res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({ success: true, user: newUser, accessToken, refreshToken });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const getUserData = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user;

    const db_user = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    console.log("User details fetched with id:", user.id);
    return res.status(200).json({ success: true, user: db_user });
  } catch (error: any) {
    console.log("Error getting user data", error.message);
    return res.status(400).json({ error: error });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user;
    user.refreshToken = "";
    await user.save({ validateBeforeSave: false });
    console.log("User logout with id:", user.id);

    res
      .status(200)
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json({ success: true });
  } catch (error: any) {
    console.log(error);

    res.status(400).json({ error: error.message });
  }
};

export const getUserByUsername = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user;
    //@ts-ignore
    const { username } = req.params;
    console.log("Username:", username);

    const db_user = await User.findOne({ username }).select(
      "-password -refreshToken"
    );
    if (!db_user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const isFriend = await Friendship.findOne({
      user: user._id,
      friend: db_user._id,
    });

    console.log("User details fetched by username with id:", user.id);
    const friend = isFriend ? true : false;
    return res.status(200).json({ success: true, user: db_user, friend });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const addFriend = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user;
    const { friendId } = req.body;

    if (!friendId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const friend = await User.findById(friendId);
    if (!friend) {
      return res
        .status(400)
        .json({ success: false, message: "Friend not found" });
    }

    if (user.id === friendId) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot add yourself" });
    }

    const existingFriendship = await Friendship.findOne({
      user: user._id,
      friend: friendId,
    });
    if (existingFriendship) {
      return res
        .status(400)
        .json({ success: false, message: "Friendship already exists" });
    }

    const friendship = await Friendship.create({
      user: user._id,
      friend: friendId,
    });
    friendship.save();

    console.log("Friendship created with id:", friendship.id);

    res.status(201).json({ success: true, friendship });
  } catch (error: any) {
    console.log(error);

    res.status(400).json({ error: error.message });
  }
};

export const getAllUser = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user;

    const users = await User.find({ _id: { $ne: user._id } }).select(
      "-password -refreshToken"
    );

    console.log("User get all users with id:", user.id);

    return res.status(200).json({ success: true, users });
  } catch (error: any) {
    console.log("Error getting all users", error.message);
    return res.status(400).json({ error: error.message });
  }
};

export const getFriends = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user;
    const friendships = await Friendship.find({
      $or: [
        { user: user._id, status: "accepted" },
        { friend: user._id, status: "accepted" },
      ],
    })
      .populate({
        path: "user",
        select: "username hobbies",
      })
      .populate({
        path: "friend",
        select: "username hobbies",
      });

    const friendsList = friendships.map((friendship) => {
      if (friendship.user._id.toString() === user._id.toString()) {
        return friendship.friend;
      }
      return friendship.user;
    });

    console.log("User get his friends with id:", user._id);

    res.status(200).json({ success: true, friends: friendsList });
  } catch (error: any) {
    console.log("Error fetching friends:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const removeFriend = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user;
    const { friendId } = req.params;

    if (!friendId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const friendship = await Friendship.findOneAndDelete({
      user: user._id,
      friend: friendId,
    });
    if (!friendship) {
      return res
        .status(400)
        .json({ success: false, message: "Friendship not found" });
    }

    console.log("Friendship removed with id:", friendship.id);

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.log(error);

    res.status(400).json({ error: error.message });
  }
};

export const getFriendRequests = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user;

    const friendRequests = await Friendship.find({
      friend: user._id,
      status: "pending",
    }).populate("user");
    console.log("User get friend requests with id:", user.id);

    res.status(200).json({ success: true, requests: friendRequests });
  } catch (error: any) {
    console.log(error);

    res.status(400).json({ error: error.message });
  }
};

export const getSentFriendRequests = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user;
    const friendRequests = await Friendship.find({
      user: user._id,
      status: "pending",
    }).populate("friend");
    console.log("User get friends request sent pending id : ", user._id);

    res.status(200).json({ success: true, requests: friendRequests });
  } catch (error: any) {
    console.log(error);

    res.status(400).json({ error: error.message });
  }
};

export const cancelSendFriendRequest = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user;
    const { userId } = req.body;

    const existingFriendship = await Friendship.findOneAndDelete({
      user: user._id,
      friend: userId,
      status: "pending",
    });

    if (!existingFriendship) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found or already cancelled.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Friend request cancelled successfully.",
    });
  } catch (error: any) {
    console.log("Error cancelling friend request", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while cancelling the friend request.",
    });
  }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user;
    const { userId } = req.body;
    console.log(userId);

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const friendship = await Friendship.findOneAndUpdate(
      { user: userId, friend: user._id },
      { status: "accepted" },
      { new: true }
    );
    if (!friendship) {
      return res
        .status(400)
        .json({ success: false, message: "Friendship not found" });
    }

    console.log("User accept friend request of user with id:", userId);

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.log(error);

    res.status(400).json({ error: error.message });
  }
};

export const rejectFriendRequest = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user;
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const friendship = await Friendship.findOneAndDelete({
      user: userId,
      friend: user._id,
      status: "pending",
    });
    if (!friendship) {
      return res
        .status(400)
        .json({ success: false, message: "Friendship not found" });
    }

    console.log("User reject friend request of user with id:", userId);

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const getRecommendedFriendsWithMutualFriend = async (
  req: Request,
  res: Response
) => {
  try {
    //@ts-ignore
    const user = req.user;

    const userFriendships = await Friendship.find({ user: user._id }).populate(
      "friend"
    );
    const userFriends = userFriendships.map((friendship) => friendship.friend);

    const recommendedFriends = await Friendship.find({
      user: { $in: userFriends },
      friend: { $nin: userFriends },
    })
      .populate("friend")
      .populate("user");

    console.log(
      "User get recommended friends with mutual friend with id:",
      user.id
    );

    res.status(200).json({ success: true, recommendedFriends });
  } catch (error: any) {
    console.log(error);

    res.status(400).json({ error: error.message });
  }
};

export const getRecommendedFriendsWithMutualHobbies = async (
  req: Request,
  res: Response
) => {
  try {
    //@ts-ignore
    const user = req.user;

    const userFriendships = await Friendship.find({ user: user._id }).populate(
      "friend"
    );
    const userFriends = userFriendships.map((friendship) => friendship.friend);

    const userHobbies = user.hobbies;

    const recommendedFriends = await User.find({
      hobbies: { $in: userHobbies },
      _id: { $nin: userFriends },
    });

    console.log(
      "User get recommended friends with mutual hobbies with id:",
      user.id
    );

    res.status(200).json({ success: true, recommendedFriends });
  } catch (error: any) {
    console.log(error);

    res.status(400).json({ error: error.message });
  }
};
