"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useListUserContentHistoriesQuery } from "@/modules/user-content-histories/use-list-user-content-histories-query";
import { Clock, Calendar, Eye } from "lucide-react";

interface ContentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  contentId: string;
}

export function ContentHistoryDialog({
  open,
  onOpenChange,
  courseId,
  contentId,
}: ContentHistoryDialogProps) {
  const { data: historiesData, isLoading } = useListUserContentHistoriesQuery(
    courseId,
    contentId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Content Viewing History</DialogTitle>
          <DialogDescription>
            Track when and how long you viewed this content
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        ) : !historiesData?.userContentHistories ||
          historiesData.userContentHistories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No viewing history yet
          </div>
        ) : (
          <div className="space-y-3">
            {historiesData.userContentHistories.map((history) => (
              <div
                key={history.sk}
                className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        Time spent: {history.totalTimeSpent}s
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {new Date(history.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
