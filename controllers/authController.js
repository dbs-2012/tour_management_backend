import User from "../models/User.js";
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken";

//user resgisteration
export const register = async (req, res) => {
    try {

        //hashing password
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.password, salt)

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            photo: req.body.photo
        })

        await newUser.save()

        res.status(200).json({ success: true, message: "Successfully created" })

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create. Try again" })

    }
}

//user login
export const login = async (req, res) => {

    const email = req.body.email
    try {
        const user = await User.findOne({ email })

        //If user does not exist
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        //If user exists then check the password or compare the password
        const checkCorrectPassword = await bcrypt.compare(req.body.password, user.password)

        //If password is incorrect
        if (!checkCorrectPassword) {
            return res.status(401).json({ success: false, message: "Invalid email or password!" })
        }

        const { password, role, ...rest } = user._doc

        //create jwt token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: '15d' })

        // set token in the browser cookies and send the response to the client
        res.cookie('accessToken', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 500000),
        }).status(200).json({ token, data: { ...rest }, role })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to login" })
    }
}
