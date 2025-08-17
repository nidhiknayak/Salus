// src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "MANAGER" | "CAREWORKER"
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: "MANAGER" | "CAREWORKER"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "MANAGER" | "CAREWORKER"
  }
}
