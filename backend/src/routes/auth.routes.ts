import express from 'express'
import { loginUser, registerUser,handleGoogleCallback  } from '../controllers/auth.controller'
import passport from 'passport'


const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
// Login with Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }))

// Google OAuth2 callback
router.get('/google/callback', passport.authenticate('google', { session: false }), handleGoogleCallback)

export default router