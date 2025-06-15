import { ResponsiveModal } from "@/components/responsive-modal";
import { Form,FormControl,FormItem,FormLabel,FormMessage,FormField } from "@/components/ui/form";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";

interface ThumbnailGenerateModalProps {
    videoId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
    prompt: z.string().min(10),
});

export const ThumbnailGenerateModal = ({
    videoId,
    open,
    onOpenChange,
}: ThumbnailGenerateModalProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
        },
    });
    const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
        onSuccess: () => {
            toast.success("background job started to generate thumbnail",{description:"This may take a few minutes"});
            form.reset();
            onOpenChange(false);
        },
        onError:() =>{
            toast.error("Failed to restore thumbnail for video")
        }
    });
    const onSubmit = (values: z.infer<typeof formSchema>) => {
        generateThumbnail.mutate({
            id: videoId,
            prompt: values.prompt,
            });
       
    }
    return (
        <ResponsiveModal title="Upload Thumbnail"
            open={open}
            onOpenChange={onOpenChange}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <FormField control={form.control} name="prompt" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prompt</FormLabel>
                            <FormControl>
                                <Textarea {...field} className="resize-none" cols={30} rows={5} placeholder="a description of wanted thumbnail" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <div className="flex  justify-end ">
                        <Button type="submit" disabled={generateThumbnail.isPending}>Generate</Button>
                    </div>
                </form>
            </Form>
        </ResponsiveModal>
    )
}