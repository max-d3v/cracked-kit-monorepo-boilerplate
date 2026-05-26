import { cn } from "@workspace/ui/lib/utils";

type GridBgProps = {
  className?: string;
  variant?: "default" | "dense";
};

function GridBg({ className, variant = "default" }: GridBgProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      data-slot="grid-bg"
    >
      <div
        className={cn(
          "absolute inset-0 bg-grid bg-grid-fade",
          variant === "dense" && "[background-size:24px_24px]"
        )}
      />
      <div className="absolute inset-0 bg-aurora" />
    </div>
  );
}

export { GridBg };
