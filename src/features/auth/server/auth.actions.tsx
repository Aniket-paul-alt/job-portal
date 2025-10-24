"use server"

import { db } from "@/config/db";
import { users } from "@/drizzle/schema";
import argon2 from "argon2";
import { eq, or } from "drizzle-orm";
import { LoginUserData, loginUserSchema, RegisterUserData, registerUserSchema } from "../auth.schema";

export const registerAction = async (data: RegisterUserData) => {
    // console.log(formData)
    // console.log(formData.get('name'))
    // console.log(Object.fromEntries(formData.entries()))

    // const {name, userName, email, role, password, confirmPassword} = Object.fromEntries(formData.entries())

    try {
        const {data:validatedData, error:validatedError} = registerUserSchema.safeParse(data)

        // console.log(validatedData, validatedError)

        if(validatedError) return {status:"error", message:validatedError.issues[0].message}

        const { name, userName, email, role, password } = validatedData
        // const { name, userName, email, role, password } = data
        console.log(name, userName, email, role, password)

        const [user] = await db.select().from(users).where(or(eq(users.email, email), eq(users.userName, userName)))
        // console.log(user)

        if (user) {
            if (user.email === email) return { status: "error", message: "Email is Already Exists!!" }
            else return { status: "error", message: "Username is Already taken!!" }
        }

        const hashPassword = await argon2.hash(password)

        await db.insert(users).values({ name, userName, email, role, password: hashPassword })

        return {
            status: "success",
            message: "User Registration Successful"
        }
    } catch (error) {
        return {
            status: "error",
            message: `Failed to register: ${error}`
        }
    }

}

// type LoginDataType = {
//     email: string;
//     password: string;
// }

export const loginAction = async (data: LoginUserData) => {

    try {
        const {data:validatedData, error:validatedError} = loginUserSchema.safeParse(data)

        // console.log(validatedData, validatedError)

        if(validatedError) return {status:"error", message:validatedError.issues[0].message}

        const { email, password } = validatedData
        // const { email, password } = data
        const [user] = await db.select().from(users).where(eq(users.email, email))
        // console.log(user)

        if (!user) {
            return { status: "error", message: "Invalid Credentials!!" }
        }

        const isPasswordValid = await argon2.verify(user.password, password)
        if (!isPasswordValid) return { status: "error", message: "Invalid Credentials!!" }

        return { status: "success", message: "Login Successfully" }
    } catch (error) {
        return {status: "error", message:"Failed to Login!!"}
    }
}