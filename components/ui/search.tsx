import * as React from "react"
import { SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const Search = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center w-full max-w-[360px] h-[44px]", className)}>
        <SearchIcon className="absolute left-3 size-[20px] text-muted-foreground" strokeWidth={2} />
        <input
          type="search"
          placeholder="Search candidates, emails, jobs..."
          className="flex h-full w-full rounded-input border border-input bg-white pl-10 pr-12 py-2 text-[14px] shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          ref={ref}
          {...props}
        />
        <div className="absolute right-3 text-[12px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md border border-border">
          ⌘K
        </div>
      </div>
    )
  }
)
Search.displayName = "Search"

export { Search }
