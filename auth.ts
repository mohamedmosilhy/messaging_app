import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginValidation, verifyCredentials } from "./app/features/auth";
import { UnauthorizedError } from "./app/lib/errors/UnauthorizedError";
import { VerifyCredentialsRequest } from "./app/features/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }
        try {
          const zodObject = LoginValidation.safeParse({
            email,
            password,
          });
          if (!zodObject.success) {
            throw new Error("validation error");
          }
          const data: VerifyCredentialsRequest = {
            email: zodObject.data?.email,
            password: zodObject.data?.password,
          };
          const user = await verifyCredentials(data);
          return user;
        } catch (error) {
          if (error instanceof UnauthorizedError) {
            return null;
          }
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      // user only come to jwt in the firt login then in every request jwt use the token
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
