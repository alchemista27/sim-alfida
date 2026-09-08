import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    databaseHooks: {
        user: {
            create: {
                before: async (data) => {
                    data.id = crypto.randomUUID();
                    return { data };
                }
            }
        },
        session: {
            create: {
                before: async (data) => {
                    data.id = crypto.randomUUID();
                    return { data };
                }
            }
        },
        account: {
            create: {
                before: async (data) => {
                    data.id = crypto.randomUUID();
                    return { data };
                }
            }
        },
        verification: {
            create: {
                before: async (data) => {
                    data.id = crypto.randomUUID();
                    return { data };
                }
            }
        }
    },
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            fullName: { type: "string" },
            isActive: { type: "boolean" },
            passwordHash: { type: "string" },
            firstName: { type: "string", required: false },
            lastName: { type: "string", required: false },
            phone: { type: "string", required: false },
            leaveQuota: { type: "number" },
            groups: { type: "string[]" },
        }
    }
});
