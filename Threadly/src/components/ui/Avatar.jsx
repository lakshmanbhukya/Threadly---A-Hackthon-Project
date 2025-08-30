import React from "react";
import { cn } from "../../lib/utils";

const Avatar = React.forwardRef(
  ({ className, src, fallback, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        {src ? (
          <img
            className="aspect-square h-full w-full object-cover"
            src={src}
            alt="Avatar"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            <span className="text-sm font-medium text-muted-foreground">
              {fallback}
            </span>
          </div>
        )}
      </div>
    );
  }
);

const AvatarImage = React.forwardRef(
  ({ className, src, alt = "Avatar", ...props }, ref) => (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  )
);

const AvatarFallback = React.forwardRef(
  ({ className, fallback, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <span className="text-sm font-medium text-muted-foreground">
        {fallback}
      </span>
    </div>
  )
);

Avatar.displayName = "Avatar";
AvatarImage.displayName = "AvatarImage";
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };