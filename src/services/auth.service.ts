import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const prisma = new PrismaClient()

export const register = async (email: string, password: string, username: string) => {
    const exiting = await prisma.user.findUnique({ where: { email } })
    if (exiting) throw new Error('Email alardy in use')

    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            email,
            password: hashed,
            username,
        }
    },)

    return { id: user.id , email: user.email, username: user.username}
}


export const login = async (email: string , password: string) => {
    const user = await prisma.user.findUnique({ where : {email}})
    if (!user) throw new Error('User not found')

    const match = await bcrypt.compare(password, user.password)
    if(!match) throw new Error('Invalid credentials')

    const token = jwt.sign({ userId : user.id}, process.env.JWT_SECRET!, {expiresIn: '7d'})
     return { token, user }; // ✅ ส่ง user กลับด้วย
}



export const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: '7d',
    }
  )
}
