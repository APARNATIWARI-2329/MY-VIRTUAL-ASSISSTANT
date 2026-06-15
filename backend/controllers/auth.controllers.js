import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../config/token.js";

export const signUp = async (req, res) => {
    try{
        const {name, email, password} = req.body;

        const exitEmail = await User.findOne({email})
        
        if(exitEmail){
            return res.status(400).json({message: "Email already exists !"})
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters long"})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        const token = await genToken(user._id)

        return res.status(201).json({ user, token })

    }catch(error){
        console.error("Sign-up failed:", error.message)
        res.status(500).json({message: "Internal server error"})
    }
}
 

export const Login = async (req, res) => {
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({message: "Invalid email"})
        }

        const isMatch = await bcrypt.compare(password, user.password) 

        if(!isMatch){
            return res.status(400).json({message: "Invalid password"})
        }

        const token = await genToken(user._id)

        return res.status(200).json({ user, token })

    }catch(error){
        console.error("Login failed:", error.message)
        res.status(500).json({message: "Internal server error"})
    }
}

export const Logout = async (req, res) => {
    try{
        res.clearCookie("token", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
  path: "/",
})
        return res.status(200).json({message: "Logged out successfully"})
    }catch(error){
        console.error("Logout failed:", error.message)
        res.status(500).json({message: "Internal server error"})
    }
}