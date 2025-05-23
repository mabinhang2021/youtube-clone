"use client"

import { Carousel,CarouselApi,CarouselContent,CarouselItem,CarouselNext,CarouselPrevious } from "./ui/carousel";
import { Badge } from "./ui/badge";

interface FilterCarouselProps {
    value?: string|null;
    isLoading?: boolean;
    onSelect?: (value: string|null) => void;
    data:{
        value: string;
        label: string;
    }[];

}

export const FilterCarousel = ({ value, isLoading, onSelect, data }: FilterCarouselProps) => {
    return(
        <div className="ralative w-full">
            <Carousel opts={{align:"start",dragFree:true}} className="w-full px-12">
                <CarouselContent className="-ml-3">
                    <CarouselItem>
                        <Badge>
                            ALL
                        </Badge>
                    </CarouselItem>

                </CarouselContent>
            </Carousel>

        </div>
    )
}