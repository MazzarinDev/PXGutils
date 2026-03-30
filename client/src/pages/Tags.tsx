import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface TagsPageProps {
  guildId: number;
}

export default function TagsPage({ guildId }: TagsPageProps) {
  const { data: tags, isLoading } = trpc.tag.listByGuild.useQuery({
    guildId,
  });

  const [showCreateTag, setShowCreateTag] = useState(false);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#6366f1");

  const colors = [
    "#6366f1", // Indigo
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#f43f5e", // Rose
    "#f97316", // Orange
    "#eab308", // Yellow
    "#84cc16", // Lime
    "#10b981", // Emerald
    "#06b6d4", // Cyan
    "#0ea5e9", // Sky
  ];

  const handleCreateTag = async () => {
    if (!tagName.trim()) return;

    try {
      // Implement tag creation mutation
      console.log("Create tag:", { name: tagName, color: tagColor });
      setTagName("");
      setTagColor("#6366f1");
      setShowCreateTag(false);
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tags</h1>
          <p className="text-slate-400">Organize tarefas com tags personalizáveis</p>
        </div>
        <Button
          onClick={() => setShowCreateTag(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Tag
        </Button>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
          </div>
        ) : tags && tags.length > 0 ? (
          tags.map((tag) => (
            <Card
              key={tag.id}
              className="p-4 bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color || "#6366f1" }}
                  ></div>
                  <div>
                    <p className="text-white font-medium">{tag.name}</p>
                    <p className="text-slate-400 text-xs">
                      Criada em {new Date(tag.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-600/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="text-4xl mb-4">🏷️</div>
            <p className="text-center">Nenhuma tag criada ainda</p>
            <p className="text-sm text-slate-500 mt-2">
              Crie tags para organizar melhor suas tarefas
            </p>
          </div>
        )}
      </div>

      {/* Create Tag Modal */}
      <Dialog open={showCreateTag} onOpenChange={setShowCreateTag}>
        <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Criar Nova Tag</DialogTitle>
            <DialogDescription className="text-slate-400">
              Crie uma tag para organizar suas tarefas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Tag Name */}
            <div className="space-y-2">
              <Label htmlFor="tagName" className="text-slate-200">
                Nome da Tag
              </Label>
              <Input
                id="tagName"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Ex: Urgente, Boss, Farming"
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label className="text-slate-200">Cor</Label>
              <div className="grid grid-cols-5 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setTagColor(color)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      tagColor === color
                        ? "ring-2 ring-white scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-slate-200">Visualização</Label>
              <Badge
                style={{ backgroundColor: tagColor }}
                className="text-white cursor-default"
              >
                {tagName || "Sua Tag"}
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateTag(false)}
              className="bg-slate-700 border-slate-600 text-slate-200"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={!tagName.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Criar Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
