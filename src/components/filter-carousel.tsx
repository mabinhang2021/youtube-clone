"use client"

import { Carousel,CarouselApi,CarouselContent,CarouselItem,CarouselNext,CarouselPrevious } from "./ui/carousel";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
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
    const [api, setApi] = useState<CarouselApi>();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // 处理类别选择
    const handleSelect = (selectedValue: string | null) => {
        // 调用外部 onSelect 回调（如果提供）
        onSelect?.(selectedValue);
        
        // 更新 URL
        const params = new URLSearchParams(searchParams.toString());
        
        if (selectedValue === null) {
            // 如果选择"ALL"，则删除categoryId参数
            params.delete("categoryId");
        } else {
            // 否则设置categoryId
            params.set("categoryId", selectedValue);
        }
        
        // 生成新URL并导航
        const newUrl = params.toString() 
            ? `/?${params.toString()}` 
            : "/";
        
        router.push(newUrl);
    };
    return(
        <div className="ralative w-full">
            <Carousel opts={{align:"start",dragFree:true}} className="w-full px-12" setApi={setApi}>
                <CarouselContent className="-ml-3">
                    <CarouselItem className="pl-3 basis-auto">
                        <Badge variant={value === null ? "default" : "secondary"} 
                        className="cursor-pointer rounded-lg px-3 py-1 whitespace-nowrap text-sm" 
                        onClick={() => handleSelect(null)}>
                            ALL
                        </Badge>
                    </CarouselItem>
                    {data.map((item) => (
                        <CarouselItem key={item.value} className="pl-3 basis-auto">
                            <Badge variant={value === item.value ? "default" : "secondary"} 
                            className="cursor-pointer rounded-lg px-3 py-1 whitespace-nowrap text-sm"
                            onClick={() => handleSelect(item.value)}>
                                {item.label}
                            </Badge>
                        </CarouselItem>
                    ))}

                </CarouselContent>
                <CarouselPrevious className="left-0 z-20"/>
                <CarouselNext className="right-0 z-20"/>
            </Carousel>

        </div>
    )
}