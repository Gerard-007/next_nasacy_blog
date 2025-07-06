import { blogCreateSubmission } from "@/app/actions";
import SubmitButton from "@/components/general/SubmitButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";

export default function CreateBlogRoute() {
    return (
        <>
            <div className="max-w-lg mx-auto mt-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Post</CardTitle>
                        <CardDescription>
                            This is the create page where you can create new content.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="flex flex-col gap-5" action={blogCreateSubmission}>
                            <div className="flex flex-col gap-2">
                                <Label>Title</Label>
                                <Input name="title" required type="text" placeholder="Title" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Content</Label>
                                <Textarea name="content" required placeholder="Your text goes here"/>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Image url</Label>
                                <Input name="url" required type="url" placeholder="image url"/>
                            </div>

                            <SubmitButton />
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}