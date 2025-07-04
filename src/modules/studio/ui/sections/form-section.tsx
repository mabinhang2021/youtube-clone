"use client"
import {trpc} from "@/trpc/client";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Suspense,  useState } from "react";
import { useForm, } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ErrorBoundary } from "react-error-boundary";
import { Select,SelectContent,SelectTrigger,SelectItem,SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CopyCheckIcon, CopyIcon, Globe2Icon, ImagePlusIcon, Loader2Icon, LockIcon, MoreVerticalIcon, RotateCcwIcon, SparklesIcon, TrashIcon } from "lucide-react";
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { z } from "zod";

import { videoUpdateSchema } from "@/db/schema";
import { Input } from "@/components/ui/input";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";

import { snakeCaseToTitle } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal";

import { ThumbnailGenerateModal } from "../components/thumbnail-generate-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_URL } from "@/constants";
interface FormSectionProps {
    videoId: string;
}

export const FormSection = ({ videoId }: FormSectionProps) => {
    return(
        <Suspense fallback={<FormSectionSkeleton/> }>
            <ErrorBoundary fallback={<p>Error loading form section</p>}>
                <FormSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    )

}

export const FormSectionSkeleton = () => {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="space-y-8 lg:col-span-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-[220px] w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-[84px] w-[153px]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="flex flex-col gap-y-8 lg:col-span-2">
            <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden">
              <Skeleton className="aspect-video" />
              <div className="px-4 py-4 space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  };


 const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
    const router = useRouter();
    const utils = trpc.useUtils();
    const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
    const [thumbnailGenerateModalOpen, setThumbnailGenerateModalOpen] = useState(false);
    const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
    const [categories] = trpc.categories.getMany.useSuspenseQuery();

    const update = trpc.videos.update.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate()
            utils.studio.getOne.invalidate({id:videoId})
            toast.success("successfully updated video")
        },
        onError:() =>{
            toast.error("Failed to update video")
        }
    });

    const remove = trpc.videos.remove.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate()
            toast.success("remove video")
            router.push("/studio");
        },
        onError:() =>{
            toast.error("Failed to remove video")
        }
    });

    const revalidate = trpc.videos.revalidate.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate()
            utils.studio.getOne.invalidate({id:videoId})
            toast.success("revalidate video")
            router.push("/studio");
        },
        onError:() =>{
            toast.error("Failed to revalidate video")
        }
    });

    const generateTitle = trpc.videos.generateTitle.useMutation({
        onSuccess: () => {
            toast.success("background job started to generate title",{description:"This may take a few minutes"});
        },
        onError:() =>{
            toast.error("Failed to generate title for video")
        }
    });

    const generateDescription = trpc.videos.generateDescription.useMutation({
        onSuccess: () => {
            toast.success("background job started to generate description",{description:"This may take a few minutes"});
        },
        onError:() =>{
            toast.error("Failed to generate description for video")
        }
    });

   

    const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate()
            utils.studio.getOne.invalidate({id:videoId})
            toast.success("thumbnail restored")
           
        },
        onError:() =>{
            toast.error("Failed to restore thumbnail for video")
        }
    });

    const form = useForm<z.infer<typeof videoUpdateSchema>>({
        resolver: zodResolver(videoUpdateSchema),
        defaultValues: video,
    });

    const onSubmit =  (data: z.infer<typeof videoUpdateSchema>) => {
       update.mutate(data)
    }

    const fullUrl =  `${APP_URL}/videos/${video.id}`;
    const [isCopied, setIsCopied] = useState(false);
    const onCopy = async () => {
        await navigator.clipboard.writeText(fullUrl);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    }


    return(
        <>  
            <ThumbnailGenerateModal
                open={thumbnailGenerateModalOpen}
                onOpenChange={setThumbnailGenerateModalOpen}
                videoId={video.id}
            />
            <ThumbnailUploadModal
                open={thumbnailModalOpen}
                onOpenChange={setThumbnailModalOpen}
                videoId={video.id}
            />
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{video.title}</h1>
                    <p className="text-xs text-muted-foreground">{video.description}</p>
                </div>
                <div className="flex items-center gap-x-2">
                    <Button type="submit" disabled = {update.isPending || !form.formState.isDirty} >
                        Save
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" >
                                <MoreVerticalIcon/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={()=> revalidate.mutate({id: video.id})}>
                                <RotateCcwIcon  className="size-4 mr-2"/>
                                Revalidate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={()=> remove.mutate({id: video.id})}>
                                <TrashIcon  className="size-4 mr-2"/>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="space-y-8 lg:col-span-3">
                    <FormField 
                        control={form.control}
                        name="title"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    <div className="flex items-center gap-x-2">
                                        Title
                                        <Button size="icon" variant="outline" type="button" className="rounded-full size-6 [&_svg]:size-3"
                                            onClick={() => generateTitle.mutate({id: video.id})} disabled={generateTitle.isPending || !video.muxTrackId}>
                                            {generateTitle.isPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
                                        </Button>
                                    </div>
                                </FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field}
                                        placeholder="add your video title"
                                        className="pr-10"
                                    />    
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* todo:Add thumbnail fields as needed */}
                    <FormField 
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                <div className="flex items-center gap-x-2">
                                        Description
                                        <Button size="icon" variant="outline" type="button" className="rounded-full size-6 [&_svg]:size-3"
                                            onClick={() => generateDescription.mutate({id: video.id})} disabled={generateDescription.isPending || !video.muxTrackId}>
                                            {generateDescription.isPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
                                        </Button>
                                    </div>
                                </FormLabel>
                                <FormControl>
                                    <Textarea 
                                        {...field}
                                        value={field.value ?? ""}
                                        rows={10}
                                        placeholder="add your video description"
                                        className="pr-10 reseze-none"
                                    />    
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="thumbnailUrl"
                        control={form.control}
                        render={()=>(
                            <FormItem>
                                <FormLabel>Thumbnail</FormLabel>
                                <FormControl>
                                    <div className="p-0.5 border border-dashed border-neutral-400 group relative h-[84px] w-[153px]">
                                        <Image
                                        src={video.thumbnailUrl ?? THUMBNAIL_FALLBACK}
                                        className="object-cover"
                                        fill alt="Thumbnail"
                                        />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button type="button"  size="icon" 
                                                className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 
                                                rounded-full opacity-100 md:opacity-0
                                                group-hover:opacity-100 duration-300 size-7"
                                                >
                                                    <MoreVerticalIcon  className="text-white"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" side="right">
                                                <DropdownMenuItem onClick={() => setThumbnailModalOpen(true)}>
                                                    <ImagePlusIcon className="size-4 mr-1" />Change
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setThumbnailGenerateModalOpen(true)}>
                                                    <SparklesIcon className="size-4 mr-1" />AI Generated
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => restoreThumbnail.mutate({id: video.id})}>
                                                    <RotateCcwIcon className="size-4 mr-1" />Restore
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                            
                                        </DropdownMenu>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField 
                        control={form.control}
                        name="categoryId"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value ?? undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                        
                                    </SelectContent>
                                </Select>
                            
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col gap-y-8 lg:col-span-2">
                    <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
                        <div className=" aspect-video overflow-hidden relative">
                            <VideoPlayer 
                                playbackId = {video.muxPlaybackId}
                                thumbnailUrl={video.thumbnailUrl}
                            />
                        </div>
                        <div className="p-4 flex flex-col gap-y-6">
                            <div className="flex justify-between items-center gap-x-2">
                                <div className="flex flex-col gap-y-1">
                                    <p className="text-xs text-muted-foreground">Video Link</p>
                                    <div className="flex items-center gap-x-2">
                                        <Link prefetch href={`/videos/${video.id}`}>
                                            <p className="text-sm line-clamp-1 text-blue-600 ">
                                                {fullUrl}
                                            </p>
                                        </Link>
                                        <Button type="button" variant="ghost" size="icon" className="shrink-0" 
                                            onClick={onCopy} disabled={isCopied}>
                                            {isCopied ? <CopyCheckIcon/>:<CopyIcon />}
                                        </Button>
                                    </div>

                                </div>

                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-y-1">
                                    <p className="text-xs text-muted-foreground">Video status</p>
                                    <p className="text-sm">{snakeCaseToTitle(video.muxStatus || "preparing")}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-y-1">
                                    <p className="text-xs text-muted-foreground">Subtitles status</p>
                                    <p className="text-sm">{snakeCaseToTitle(video.muxTrackStatus || "nosubtitle")}</p>
                                </div>
                            </div>
                        </div>
                        <FormField 
                        control={form.control}
                        name="visibility"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>visibility</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value ?? undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select visibility" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="public">
                                            <div className="flex items-center"><Globe2Icon className="size-4 mr-2" />Public</div>
                                        </SelectItem>
                                        <SelectItem value="private">
                                            <div className="flex items-center"><LockIcon className="size-4 mr-2" />Private</div>
                                        </SelectItem>
                                        
                                    </SelectContent>
                                </Select>
                            
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    </div>
                </div>
            </div>
            </form>
            </Form>
        </>
    )
};