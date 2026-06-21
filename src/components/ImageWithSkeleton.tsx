import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  wrapperClassName?: string;
}

/**
 * <img> wrapped in a skeleton pulse placeholder until the image has loaded
 * (or errored). Caller controls aspect via wrapperClassName.
 */
const ImageWithSkeleton = ({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder.svg",
  wrapperClassName,
  onLoad,
  onError,
  ...rest
}: Props) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const finalSrc = errored ? fallbackSrc : (src || fallbackSrc);

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-muted", wrapperClassName)}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-slate-200/70 dark:bg-slate-700/40" />
      )}
      <img
        {...rest}
        src={finalSrc}
        alt={alt}
        loading={rest.loading ?? "lazy"}
        decoding={rest.decoding ?? "async"}
        onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
        onError={(e) => {
          if (!errored) setErrored(true);
          setLoaded(true);
          onError?.(e);
        }}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </div>
  );
};

export default ImageWithSkeleton;
