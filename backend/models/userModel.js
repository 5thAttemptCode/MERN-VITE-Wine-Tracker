const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const validator = require("validator")
const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    }
})

//static signup method
userSchema.statics.signup = async function (email, password) {
    //validation
    if (!email || !password){
        throw Error("All fields must be filled")
    }
    if(!validator.isEmail(email)){
        throw Error('Invalid Email')
    }
    if(!validator.isStrongPassword(password)){
        throw Error('Please chose a stronger password')
    }

    const exists = await this.findOne({ email })

    if (exists) {
        throw Error("Email already in use")
    }

    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await this.create({ email, password: hashedPassword })

    return user
}

//static login method
userSchema.statics.login = async function (email, password) {
    if (!email || !password){
        throw Error ("Must provide an email and password to log in.")
    }

    const user = await this.findOne({ email })

    if(!user){
        throw Error("Incorrect email")
    }

    const match = await bcrypt.compare(password, user.password)

    if(!match){
        throw Error("Incoorect password")
    }

    return user
}


module.exports = mongoose.model("User", userSchema)