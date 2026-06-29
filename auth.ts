import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginValidation, verifyCredentials } from "./app/features/auth";
import { UnauthorizedError } from "./app/lib/errors/UnauthorizedError";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials?.password !== "string"
        ) {
          return null;
        }

        const { email, password } = credentials;
        try {
          const zodObject = LoginValidation.safeParse({
            email,
            password,
          });
          if (!zodObject.success) {
            return null;
          }
          const user = await verifyCredentials(zodObject.data);
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
      // `user` is only available immediately after a successful login.
      // On subsequent requests, only `token` is available.
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
