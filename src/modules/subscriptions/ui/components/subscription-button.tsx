import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";


interface SubscriptionButtonProps {
    onClick: ButtonProps["onClick"];
    isSubscribed: boolean;
    disabled: boolean;
    className?: string;
    size?: ButtonProps["size"];
}

export const SubscriptionButton = ({onClick, isSubscribed, disabled, className, size }: SubscriptionButtonProps) => {
    return(
        <Button 
            variant={isSubscribed ? "secondary" : "default"}
            className={cn("rounded-full", className)}
            size={size}
            onClick={onClick}
            disabled={disabled}
        >
            {isSubscribed ? "Unsubscribed" : "Subscribe"}
        </Button>
    )
}