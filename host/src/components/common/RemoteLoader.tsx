import { Loader2 } from "lucide-react";

export interface RemoteLoaderProps {
  className?: string;
}

export function RemoteLoader({ className = "h-64" }: RemoteLoaderProps) {
  return (
    <div className={`flex w-full items-center justify-center ${className}`}>
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

export default RemoteLoader;
