"use server"

import { db } from "@/config/db";
import { users } from "@/drizzle/schema";
import argon2 from "argon2";
import { eq, or } from "drizzle-orm";

export const registerAction = async(data:{
    name: string;
    userName: string;
    email: string;
    password: string;
    // confirmPassword: string;
    role: "applicant" | "employer";
}) =>{
    // console.log(formData)
    // console.log(formData.get('name'))
    // console.log(Object.fromEntries(formData.entries()))
    
    // const {name, userName, email, role, password, confirmPassword} = Object.fromEntries(formData.entries())

    try {
        
        const {name, userName, email, role, password} = data
        console.log(name, userName, email, role, password)

        const [user] = await db.select().from(users).where(or(eq(users.email, email), eq(users.userName, userName)))
        // console.log(user)

        if(user){
            if(user.email === email) return {status: "error", message:"Email is Already Exists!!"}
            else return {status: "error", message:"Username is Already taken!!"}
        }
        
        const hashPassword = await argon2.hash(password)
        
        await db.insert(users).values({name, userName, email, role, password:hashPassword})
        
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