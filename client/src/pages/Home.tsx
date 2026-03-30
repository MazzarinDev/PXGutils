import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, LogOut, Settings, Bell, Users, BarChart3 } from "lucide-react";
import Kanban from "@/components/Kanban";
import Dashboard from "./Dashboard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ViewType = "kanban" | "dashboard" | "guilds" | "settings";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>("kanban");
  const [selectedGuildId, setSelectedGuildId] = useState<number | null>(null);
  const [showCreateGuild, setShowCreateGuild] = useState(false);
  const [guildName, setGuildName] = useState("");
  const [guildDescription, setGuildDescription] = useState("");

  // Fetch user guilds
  const { data: guilds, isLoading: guildsLoading } = trpc.guild.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Fetch tasks for selected guild
  const { data: tasks, isLoading: tasksLoading } =
    trpc.task.listByGuild.useQuery(
      { guildId: selectedGuildId! },
      { enabled: !!selectedGuildId }
    );

  // Fetch categories for selected guild
  const { data: categories } = trpc.category.listByGuild.useQuery(
    { guildId: selectedGuildId! },
    { enabled: !!selectedGuildId }
  );

  // Mutations
  const createGuildMutation = trpc.guild.create.useMutation();
  const createTaskMutation = trpc.task.create.useMutation();
  const updateTaskMutation = trpc.task.update.useMutation();
  const completeTaskMutation = trpc.task.complete.useMutation();
  const deleteTaskMutation = trpc.task.delete.useMutation();

  const handleCreateGuild = async () => {
    if (!guildName.trim()) return;

    try {
      await createGuildMutation.mutateAsync({
        name: guildName,
        description: guildDescription,
      });
      setGuildName("");
      setGuildDescription("");
      setShowCreateGuild(false);
    } catch (error) {
      console.error("Failed to create guild:", error);
    }
  };

  const handleTaskMove = async (taskId: number, newStatus: string) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        status: newStatus as any,
      });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleTaskCreate = (categoryId: number) => {
    // Show create task modal
    console.log("Create task for category:", categoryId);
  };

  const handleTaskEdit = async (task: any) => {
    try {
      await updateTaskMutation.mutateAsync(task);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    try {
      await deleteTaskMutation.mutateAsync({ id: taskId });
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleTaskComplete = async (taskId: number) => {
    if (!selectedGuildId) return;
    try {
      await completeTaskMutation.mutateAsync({
        id: taskId,
        guildId: selectedGuildId,
      });
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-white mb-4">PXGManager</h1>
          <p className="text-slate-300 mb-2">
            Gerencie suas atividades de guilda no PokeXgames
          </p>
          <p className="text-slate-400 text-sm mb-8">
            Organize Quests, Catch, Profissões e Tasks Diárias com um painel
            Kanban interativo
          </p>
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Entrar com Manus
          </Button>
        </div>
      </div>
    );
  }

  // Authenticated - show main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Navigation */}
      <nav className="bg-slate-800/50 border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">PX</span>
              </div>
              <h1 className="text-xl font-bold text-white">PXGManager</h1>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={currentView === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("kanban")}
                className={
                  currentView === "kanban"
                    ? "bg-indigo-600"
                    : "text-slate-300 hover:text-white"
                }
              >
                <span className="text-lg mr-2">📋</span>
                Kanban
              </Button>
              <Button
                variant={currentView === "dashboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("dashboard")}
                className={
                  currentView === "dashboard"
                    ? "bg-indigo-600"
                    : "text-slate-300 hover:text-white"
                }
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={currentView === "guilds" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("guilds")}
                className={
                  currentView === "guilds"
                    ? "bg-indigo-600"
                    : "text-slate-300 hover:text-white"
                }
              >
                <Users className="w-4 h-4 mr-2" />
                Guildas
              </Button>

              {/* User Menu */}
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-700">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">Nível {user.profileLevel || 1}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="text-slate-300 hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Guild Selector */}
        {(currentView === "kanban" || currentView === "dashboard") && (
          <div className="p-4 bg-slate-800/30 border-b border-slate-700/50 flex items-center gap-3 overflow-x-auto">
            {guildsLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
            ) : (
              <>
                {guilds?.map((guild) => (
                  <Button
                    key={guild.id}
                    variant={selectedGuildId === guild.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGuildId(guild.id)}
                    className={
                      selectedGuildId === guild.id
                        ? "bg-indigo-600"
                        : "border-slate-600 text-slate-300"
                    }
                  >
                    {guild.name}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateGuild(true)}
                  className="border-slate-600 text-slate-300 hover:text-indigo-400"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Guilda
                </Button>
              </>
            )}
          </div>
        )}

        {/* View Content */}
        {currentView === "kanban" && selectedGuildId && (
          <Kanban
            tasks={tasks || []}
            categories={categories || []}
            onTaskMove={handleTaskMove}
            onTaskCreate={handleTaskCreate}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
            onTaskComplete={handleTaskComplete}
            isLoading={tasksLoading}
          />
        )}

        {currentView === "dashboard" && selectedGuildId && (
          <Dashboard guildId={selectedGuildId} />
        )}

        {currentView === "guilds" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Minhas Guildas</h2>
              <Button
                onClick={() => setShowCreateGuild(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Guilda
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guilds?.map((guild) => (
                <Card
                  key={guild.id}
                  className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedGuildId(guild.id);
                    setCurrentView("kanban");
                  }}
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {guild.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {guild.description || "Sem descrição"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>👥 {guild.totalMembers} membros</span>
                    <span>✓ {guild.totalTasksCompleted} tarefas</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!selectedGuildId && (currentView === "kanban" || currentView === "dashboard") && (
          <div className="p-12 text-center">
            <p className="text-slate-400 mb-4">Selecione uma guilda para começar</p>
            <Button
              onClick={() => setShowCreateGuild(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Guilda
            </Button>
          </div>
        )}
      </div>

      {/* Create Guild Modal */}
      <Dialog open={showCreateGuild} onOpenChange={setShowCreateGuild}>
        <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Criar Nova Guilda</DialogTitle>
            <DialogDescription className="text-slate-400">
              Crie uma guilda para organizar atividades com seus amigos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="guildName" className="text-slate-200">
                Nome da Guilda
              </Label>
              <Input
                id="guildName"
                value={guildName}
                onChange={(e) => setGuildName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Digite o nome da guilda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guildDescription" className="text-slate-200">
                Descrição
              </Label>
              <Textarea
                id="guildDescription"
                value={guildDescription}
                onChange={(e) => setGuildDescription(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Descrição da guilda (opcional)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateGuild(false)}
              className="bg-slate-700 border-slate-600 text-slate-200"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateGuild}
              disabled={createGuildMutation.isPending || !guildName.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {createGuildMutation.isPending ? "Criando..." : "Criar Guilda"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
