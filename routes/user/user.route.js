import express from "express"
import { login, logout, signup,verifyUser,me, resetPasswordLinkAndOtp, resetPass } from "../../controller/user/user.controller.js";
const router=express.Router();
router.post('/signup',signup);
router.post('/verifyUser/:userId',verifyUser)
router.get('/login',login)
router.post('/logout',logout);
router.get('/me',me);
router.post('/forgot-password', resetPasswordLinkAndOtp);
router.post('/reset-password/:userId', resetPass);
export default router;