import React, { useState, useCallback } from "react";
import { GripVertical, Plus, Trash2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import TaskCard from "./TaskCard";
import TaskEditModal from "./TaskEditModal";

interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: "low" | "medium" | "high" | "critical";
  status: "todo" | "in_progress" | "completed" | "archived";
  dueDate?: Date | null;
  dueTime?: string | null;
  assignedToId?: number | null;
  tags?: string[] | null;
  taskType: "quest" | "catch" | "profession" | "daily" | "custom";
  guildId?: number;
  categoryId?: number;
  createdById?: number;
  completedAt?: Date | null;
  completedById?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Category {
  id: number;
  name: string;
  displayName: string;
  color: string | null;
  icon: string | null;
  position: number | null;
}

interface KanbanProps {
  tasks: Task[];
  categories: Category[];
  onTaskMove?: (taskId: number, newStatus: string) => void;
  onTaskCreate?: (categoryId: number) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
  onTaskComplete?: (taskId: number) => void;
  isLoading?: boolean;
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 border-blue-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  critical: "bg-red-100 text-red-800 border-red-300",
};

const taskTypeIcons = {
  quest: "⚔️",
  catch: "🎯",
  profession: "🔨",
  daily: "📅",
  custom: "📋",
};

export default function Kanban({
  tasks,
  categories,
  onTaskMove,
  onTaskCreate,
  onTaskEdit,
  onTaskDelete,
  onTaskComplete,
  isLoading,
}: KanbanProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const getTasksByStatus = useCallback(
    (status: string) => {
      return tasks.filter((t) => t.status === status);
    },
    [tasks]
  );

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      onTaskMove?.(draggedTask.id, status);
      setDraggedTask(null);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleSaveTask = (updatedTask: Partial<Task>) => {
    if (editingTask) {
      onTaskEdit?.({ ...editingTask, ...updatedTask });
      setShowEditModal(false);
      setEditingTask(null);
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== "completed";
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">PXG Manager</h1>
          <p className="text-slate-400">Organize suas atividades de guilda</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {categories.map((category) => {
          const categoryTasks = getTasksByStatus(category.name);
          return (
            <div
              key={category.id}
              className="flex flex-col bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden min-w-[300px]"
            >
              {/* Column Header */}
              <div
                className="p-4 border-b border-slate-700/50"
                style={{
                  backgroundColor: `${category.color || "#6366f1"}20`,
                  borderLeftColor: category.color || "#6366f1",
                  borderLeftWidth: "4px",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{taskTypeIcons[category.name as keyof typeof taskTypeIcons] || "📋"}</span>
                    <h2 className="font-semibold text-white">{category.displayName}</h2>
                  </div>
                  <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                    {categoryTasks.length}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{category.name}</p>
              </div>

              {/* Tasks Container */}
              <div
                className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[600px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, category.name)}
              >
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                  </div>
                )}

                {categoryTasks.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <div className="text-3xl mb-2">📭</div>
                    <p className="text-sm">Nenhuma tarefa</p>
                  </div>
                )}

                {categoryTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className="cursor-move"
                  >
                    <Card
                      className={cn(
                        "p-3 bg-slate-700/50 border-slate-600/50 hover:bg-slate-700 transition-colors",
                        draggedTask?.id === task.id && "opacity-50",
                        isOverdue(task) && "border-red-500/50 border-2"
                      )}
                    >
                      <div className="space-y-2">
                        {/* Title with drag handle */}
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm truncate">
                              {task.title}
                            </h3>
                          </div>
                        </div>

                        {/* Priority Badge */}
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              priorityColors[task.priority]
                            )}
                          >
                            {task.priority}
                          </Badge>
                        </div>

                        {/* Due Date */}
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            {isOverdue(task) ? (
                              <>
                                <AlertCircle className="w-3 h-3 text-red-500" />
                                <span className="text-red-500">Atrasado</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>
                                  {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                                  {task.dueTime && ` às ${task.dueTime}`}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs bg-slate-600/50 text-slate-200"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {task.tags.length > 2 && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-slate-600/50 text-slate-200"
                              >
                                +{task.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-1 pt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs flex-1 hover:bg-slate-600"
                            onClick={() => handleEditTask(task)}
                          >
                            Editar
                          </Button>
                          {task.status !== "completed" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs flex-1 hover:bg-green-600/20 text-green-400"
                              onClick={() => onTaskComplete?.(task.id)}
                            >
                              ✓
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-red-600/20"
                            onClick={() => onTaskDelete?.(task.id)}
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Add Task Button */}
              <div className="p-3 border-t border-slate-700/50">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-slate-700/50 border-slate-600/50 hover:bg-slate-600 text-slate-300"
                  onClick={() => onTaskCreate?.(category.id)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}
