import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { upload, auth } from "../middlewares/index.js"

const router = Router();

router.route("/register").post(
  upload.fields([{name: "avatar", maxCount: 1}, {name: "coverImage", maxCount: 1}]),
  registerUser
)

router.route("/login").post(loginUser)


//secure routes
router.route("/logout").post(auth, logoutUser)




export default router;