import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  addFriend,
  getFriends,
  removeFriend,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getRecommendedFriendsWithMutualFriend,
  getRecommendedFriendsWithMutualHobbies,
  getAllUser,
  getUserData,
  getUserByUsername,
  getSentFriendRequests,
  cancelSendFriendRequest,
} from "../controllers/user.controller";
import verifyUser from "../middlewares/verifyUser";

const userRoutes = Router();

// Authentication routes
userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/logout", verifyUser, logoutUser);

//get user
userRoutes.get("/me", verifyUser, getUserData);

// Friendship management routes
userRoutes.post("/friend/add", verifyUser, addFriend);
userRoutes.get("/friends", verifyUser, getFriends);
userRoutes.delete("/friend/remove/:friendId", verifyUser, removeFriend);

// Friend request management routes
userRoutes.get("/friend/requests", verifyUser, getFriendRequests);
userRoutes.get("/friend/sentrequests", verifyUser, getSentFriendRequests);
userRoutes.post("/friend/requests/accept", verifyUser, acceptFriendRequest);
userRoutes.post("/friend/requests/reject", verifyUser, rejectFriendRequest);
userRoutes.post("/friend/requests/cancel", verifyUser, cancelSendFriendRequest);

// general routes
userRoutes.get("/getall", verifyUser, getAllUser);

// search routes
userRoutes.get("/search/:username", verifyUser, getUserByUsername);

// Recommendation routes
userRoutes.get(
  "/friend/recommendations/mutual-friends",
  verifyUser,
  getRecommendedFriendsWithMutualFriend
);
userRoutes.get(
  "/friend/recommendations/mutual-hobbies",
  verifyUser,
  getRecommendedFriendsWithMutualHobbies
);

export default userRoutes;
