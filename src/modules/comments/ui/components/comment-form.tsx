import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { commentInsertSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { useClerk, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface ComentFormProps {
    videoId: string;
    variant?: "reply" | "comment";
    parentId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}


export const CommentForm = ({videoId,parentId,onCancel,variant="comment",  onSuccess}: ComentFormProps) => {
    const {user} = useUser();
    const utils = trpc.useUtils();
    const clerk = useClerk();
    const create = trpc.comments.create.useMutation({
        onSuccess: () => {  
            utils.comments.getMany.invalidate({ videoId });
            form.reset()
            toast.success("Comment added")
            onSuccess?.()
        },
        onError:(error) =>{
            toast.error("failed to add comments")
            if(error.data?.code === "UNAUTHORIZED")
                clerk.openSignIn()
        }
    });
    const commentFormSchema = commentInsertSchema.omit({ userId: true });
    type CommentFormValues = z.infer<typeof commentFormSchema>;
    const form = useForm<CommentFormValues>({
        resolver: zodResolver(commentFormSchema),
        defaultValues: {
            parentId: parentId,
            videoId:videoId,
            value:""
        }
    })

    const handleSubmit = (values: CommentFormValues) => {
        create.mutate(values);
    }

    const handleCancel = () => {
        form.reset();
        onCancel?.();
    }


    return(
        <Form  {...form}>
        <form className="flex gap-4 group" onSubmit={form.handleSubmit(handleSubmit)}>
            <UserAvatar  size="lg" imageUrl={user?.imageUrl || "/user-placeholder.svg"} 
            name={user?.username || "USER"}/>
            
            <div className="flex-1">
                <FormField
                    name="value"
                    control={form.control}
                    render={({ field }) =>(
                        <FormItem>  
                            <FormControl>
                            <Textarea
                                {...field}
                                placeholder={variant === "reply" ? "Reply to this comment" : "Add a comment"}
                                className="resize-none bg-transparent overflow-hidden min-h-0"/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                        
                    )}
                />
               
                <div className="justify-end gap-2 mt-2 flex">
                    {onCancel && (
                        <Button variant="ghost" type="button"  onClick={handleCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" size="sm" disabled={create.isPending}>
                        {variant === "reply" ? "Reply" : "Comment"}
                    </Button>
                </div>
            </div>
        </form>
        </Form>
    )
}