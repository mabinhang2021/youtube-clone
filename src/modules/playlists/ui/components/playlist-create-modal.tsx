import { ResponsiveModal } from "@/components/responsive-modal";
import { Form,FormControl,FormItem,FormLabel,FormMessage,FormField } from "@/components/ui/form";

import { trpc } from "@/trpc/client";
import { z } from "zod";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PlaylistCreateModalProps {

    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
    name: z.string().min(1).max(100),
});

export const PlaylistCreateModal = ({

    open,
    onOpenChange,
}: PlaylistCreateModalProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    const utils = trpc.useUtils();
    const create = trpc.playlists.create.useMutation({
        onSuccess: () => {
            utils.playlists.getMany.invalidate();
            toast.success("playlist created");
            form.reset();
            onOpenChange(false);
        },
        onError:() =>{
            toast.error("Failed to create playlist for video")
        }
    });
    const onSubmit = (values: z.infer<typeof formSchema>) => {
        create.mutate(values)
       
    }
    return (
        <ResponsiveModal title="create playlist"
            open={open}
            onOpenChange={onOpenChange}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prompt</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="my favorite videos" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <div className="flex  justify-end ">
                        <Button type="submit" disabled={create.isPending}>Create</Button>
                    </div>
                </form>
            </Form>
        </ResponsiveModal>
    )
}