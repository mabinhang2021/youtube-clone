import Image from 'next/image';
import { format } from 'path';
import { formatDuration } from '@/lib/utils';
interface VideoThumbnailProps {
    imageUrl?: string | null;
    previewUrl?: string | null;
    title: string;
    duration: number;
}

export const VideoThumbnail =({imageUrl,title,previewUrl,duration}: VideoThumbnailProps) => {
    console.log('Video Thumbnail Debug:', { 
        title, 
        imageUrl, 
        previewUrl, 
        hasPreview: !!previewUrl 
    });
    return(
        <div className="relative group">
            {/* thumbnail wrapper */}
            <div className="relative w-full overflow-hidden rounded-xl aspect-video">
                <Image 
                    src={imageUrl??"/placeholder.svg"} 
                    alt={title} fill 
                    className='size-full object-cover group-hover:opacity-0'
                />
                <Image 
                    unoptimized={!!previewUrl}
                    src={previewUrl??"/placeholder.svg"} 
                    alt={title} fill 
                    className='size-full object-cover opacity-0 group-hover:opacity-100'
                    
                />

            </div>
            {/* video duration boxtodo:add video duration box */}
            <div className='absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 py-0.5 rounded'>
                {formatDuration(duration)}
            </div>


        </div>
    )
}

