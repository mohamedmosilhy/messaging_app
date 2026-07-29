import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { cn } from "@/app/lib/utils";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

type UserAvatarProps = {
  name: string;
  src?: string | null;
  className?: string;
  size?: "sm" | "default" | "lg";
};

export function UserAvatar({
  name,
  src,
  className,
  size = "default",
}: UserAvatarProps) {
  return (
    <Avatar className={cn("bg-primary/10", className)} size={size}>
      {src ? <AvatarImage alt="" src={src} /> : null}
      <AvatarFallback className="bg-primary/10 font-semibold text-primary">
        {getInitials(name) || "?"}
      </AvatarFallback>
    </Avatar>
  );
}
