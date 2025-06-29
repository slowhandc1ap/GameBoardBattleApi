// src/services/passport.ts
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()
console.log('✅ Registering Google Strategy')
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value
                const username = profile.displayName

                if (!email) return done(null, false)

                // ค้นหา user จาก email
                console.log('⏳ Checking if user exists...')
                let user = await prisma.user.findUnique({
                    where: { email },
                })

                if (!user) {
                    console.log('🆕 Creating new user...')
                    // ถ้าไม่มี → สร้าง user ใหม่
                    user = await prisma.user.create({
                        data: {
                            email,
                            password: '', // ใส่ว่างไว้เพราะมาจาก Google
                            username,
                        },
                    })
                }

                done(null, user)
            } catch (error) {
                done(error, false)
            }
        }
    )
)
