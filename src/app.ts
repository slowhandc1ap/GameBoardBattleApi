import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import './services/passport.service'
import passport from 'passport'
import paymentRoutes from './routes/payment.routes'
import gachaRoutes from './routes/gacha/gacha.routes'
import heroRoutes from './routes/ingame/hero.routes'
import createTeamRoutes from './routes/ingame/team.routes'
dotenv.config();

const app = express()
app.use(cors())

app.use(passport.initialize()) // ต้องมี
// (optional) ถ้าอยากใช้ session

app.use(
  '/payment/webhook',
  express.raw({ type: 'application/json' }) // ให้ใช้ raw เฉพาะ webhook เท่านั้น
);
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/payment', paymentRoutes)
app.use('/gacha', gachaRoutes)
app.use('/api', heroRoutes)
app.use('/api/team', createTeamRoutes)

app.get("/", (_, res)=> {
    res.send("Welcome to Gacha Battle API")
})


export default app;
