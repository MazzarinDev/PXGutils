import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  id: number;
  title: string;
  priority: "low" | "medium" | "high" | "critical";
  dueDate?: Date;
  dueTime?: string;
  tags?: string[];
  isOverdue?: boolean;
  isDragging?: boolean;
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function TaskCard({
  id,
  title,
  priority,
  dueDate,
  dueTime,
  tags,
  isOverdue,
  isDragging,
}: TaskCardProps) {
  return (
    <Card
      className={cn(
        "p-3 bg-slate-700/50 border-slate-600/50",
        isDragging && "opacity-50",
        isOverdue && "border-red-500 border-2"
      )}
    >
      <div className="space-y-2">
        <h3 className="font-medium text-white text-sm truncate">{title}</h3>

        <Badge className={cn("text-xs", priorityColors[priority])}>
          {priority}
        </Badge>

        {dueDate && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            {isOverdue ? (
              <>
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-red-500">Atrasado</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(dueDate).toLocaleDateString("pt-BR")}
                  {dueTime && ` às ${dueTime}`}
                </span>
              </>
            )}
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-slate-600/50 text-slate-200"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge
                variant="secondary"
                className="text-xs bg-slate-600/50 text-slate-200"
              >
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
