"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  previewContent?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

const CollapsibleCard = React.forwardRef<HTMLDivElement, CollapsibleCardProps>(
  (
    {
      title,
      children,
      defaultOpen = false,
      className,
      headerClassName,
      contentClassName,
      previewContent,
      icon,
      badge,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
      <Card ref={ref} className={cn("", className)} {...props}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader
              className={cn(
                "cursor-pointer hover:bg-gray-50 transition-colors",
                headerClassName,
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {icon && <div className="flex-shrink-0">{icon}</div>}
                  <CardTitle className="text-lg">{title}</CardTitle>
                  {badge && <div className="flex-shrink-0">{badge}</div>}
                </div>
                <div className="flex items-center gap-2">
                  {previewContent && !isOpen && (
                    <div className="text-sm text-gray-500 mr-2">
                      {previewContent}
                    </div>
                  )}
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className={cn("pt-0", contentClassName)}>
              {children}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  },
);

CollapsibleCard.displayName = "CollapsibleCard";

export { CollapsibleCard };
