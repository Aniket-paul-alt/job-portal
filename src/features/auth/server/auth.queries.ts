import { cookies } from "next/headers";
import { cache } from "react";
import { validateSessionAndGetUser } from "./use-cases/sessions";

export const getCurrentUser = cache(async() => {
    const cookieStore = await cookies()
    const sessions = cookieStore.get("session")?.value

    if(!sessions) return null

    const user = await validateSessionAndGetUser(sessions)
    return user
})