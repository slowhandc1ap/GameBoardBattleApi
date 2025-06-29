import { Request, Response } from "express";
import { login, register } from '../services/auth.service'
import { generateToken } from '../services/auth.service'

interface RequestBody {
    email: string
    password: string
    username?: string | any
}

export const registerUser = async (req: Request<{}, {}, RequestBody>, res: Response) => {
    try {
        const { email, password, username } = req.body
        const result = await register(email, password, username)
        res.status(201).json(result)


    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
}

export const loginUser = async (
    req: Request<{}, {}, RequestBody>,
    res: Response
): Promise<void> => {
    try {
        const { email, password } = req.body
        const { token, user } = await login(email, password);
        console.log(token)
        res.status(200).json({ token, user }); // ✅ ส่งทั้ง token + user
    } catch (e: any) {
        if (typeof e === "string") {
            res.status(401).json({ error: e.toUpperCase() })
        } else if (e instanceof Error) {
            res.status(401).json({ error: e.message }) // ไม่ใช่ .message()
        } else {
            res.status(500).json({ error: "Unknown error occurred" })
        }
    }
}

export const handleGoogleCallback = async (req: Request, res: Response) => {
  const user = req.user as any

  if (!user) {
    res.status(401).json({ message: 'Google login failed' })
  }

  // สร้าง JWT token
  const token = generateToken(user)
  

  
  const redirectUrl = `http://localhost:5173/lobby?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
  res.redirect(redirectUrl);
}