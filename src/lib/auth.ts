import {betterAuth} from "better-auth";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";
import { polarClient } from "./polar";

export const auth = betterAuth({
     database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword:{
        enabled:true,
        autoSignIn:true,
    },
    trustedOrigins: [
  "http://localhost:3000",
  process.env.NGROK_URL!
],
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "d99fb4e6-9794-4da8-8c1f-0ef51937ac3c",
                            slug: "Zapnode-Pro" // Custom slug for easy reference in Checkout URL, e.g. /checkout/Zapnode-Pro
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly: true
                }),
                portal(),
            ],
        })
    ]
})