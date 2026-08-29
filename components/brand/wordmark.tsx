/**
 * @deprecated Use FitConnectLogo variant="full" for official wordmark.
 */
import { FitConnectLogo } from "./fitconnect-logo";
import { cn } from "@/lib/utils";

type WordmarkProps = {
  className?: string;
  size?: number;
  underline?: boolean;
  title?: string;
};

export function Wordmark({ className, size = 22 }: WordmarkProps) {
  return (
    <FitConnectLogo
      variant="full"
      className={cn(className)}
    />
  );
}
