import { CommnetsSection } from "../sections/comments-section";
import { SuggestionSection } from "../sections/suggestion-section";
import { VideoSection } from "../sections/video-section";

interface VideoViewProps {
    videoId: string;
}


export const VideoView = ({ videoId }: VideoViewProps) => {
   
    return(
        <div className="flex flex-col maw-w-[1700px] mx-auto px-4 pt-2.5 mb-10">
            <div className="flex flex-col gap-6 xl:flex-row">
                <div className="flex-1 min-w-0">
                    <VideoSection videoId={videoId}/>
                    <div className="xl:hidden block mt-4">
                        <SuggestionSection  />
                    </div>
                    <CommnetsSection />
                </div>
                <div className="hidden xl:blcok w-full xl:w-[380px] 2xl:w-[460px] shrink-1">
                    <SuggestionSection/>
                </div>
            </div>
        </div>
    )
}