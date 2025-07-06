import Link from "next/link";
import {buttonVariants } from "../ui/button";
import {RegisterLink, LoginLink, LogoutLink} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import ModeToggle from "./ModeToggle";


export async function Navbar() {
    const {getUser} = getKindeServerSession();
    const user = await getUser();

    return (
        <nav className="py-6 px-6 flex items-center justify-between bg-gray-800 mt-6 rounded-lg">
            <div className="flex items-center gap-6">
                <Link href="/" className="text-white no-underline">
                    <h1>
                        My
                        <span className="text-blue-400">Blog</span>
                    </h1>
                </Link>
            </div>

            <div className="hidden sm:flex items-center gap-6">
                <Link href="/" className="text-white no-underline hover:text-blue-400 transition-color">
                    Home
                </Link>
                <Link href="/dashboard" className="text-white no-underline hover:text-blue-400 transition-color">
                    Dashboard
                </Link>
            </div>

            {user ? (
                <div className="flex items-center gap-4">
                    <span className="text-white">{user.given_name}</span>
                    <LogoutLink className={buttonVariants({ variant: "secondary" })}>
                        Logout
                    </LogoutLink>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <ModeToggle />
                    <RegisterLink className={buttonVariants({ variant: "secondary" })}>
                        Register
                    </RegisterLink>
                    <LoginLink className={buttonVariants({ variant: "secondary" })}>
                        Login
                    </LoginLink>
                </div>
            )}
        </nav>
    )
}