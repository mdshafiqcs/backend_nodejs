import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload, auth } from "../middlewares/index.js"

const router = Router();

router.route("/register").post(
  upload.fields([{name: "avatar", maxCount: 1}, {name: "coverImage", maxCount: 1}]),
  registerUser
)

router.route("/login").post(loginUser)


//secure routes
router.route("/logout").post(auth, logoutUser)
router.route("/refresh-access-token").post(refreshAccessToken)





export default router;