import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingDashboard() {
    return (
        <Skeleton className="h-[500] w-full mt-10" />
        // <div className="flex items-center justify-center h-screen">
        //     <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        //     <span className="ml-4 text-lg text-gray-700">Loading...</span>
        // </div>

        // <div className="max-w-2xl mx-auto mt-10">
        //         <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        //         <p className="text-gray-600">This is your dashboard where you can manage your account.</p>
        //         <Link href="/dashboard/create" className={buttonVariants({ variant: "secondary" })}>
        //             create post
        //         </Link>
        //     </div>

        //     <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        //         {Array.from({ length: 1 }).map((_, index) => (
        //             <div key={index} className="border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
        //                 <Skeleton className="h-48 w-full mb-4" />
        //             </div>
        //         ))}
        //     </div>
        // </div>
    );
}