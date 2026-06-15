import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "./app/utils/db";

export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    return NextResponse.next();
  },
  {
    // Public paths: guests can access these
    publicPaths: [
      "/",
      "/about",
      "/contact",
      "/post",
      "/category",
      "/categories",
      "/search",
      "/api/auth",
      "/api/posts", // Allow reading posts via API
    ],
    // Protected paths: require authentication (anything NOT in publicPaths)
    // Includes: /dashboard, /profile, /bookmarks, /api/comments/*, /api/posts/*/like, /api/posts/*/bookmark
  }
);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}