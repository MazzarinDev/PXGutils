import React, { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  Zap,
} from "lucide-react";

interface DashboardProps {
  guildId: number;
}

export default function Dashboard({ guildId }: DashboardProps) {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week");

  // Fetch data
  const { data: tasks } = trpc.task.listByGuild.useQuery({ guildId });
  const { data: guildStats } = trpc.guild.getStats.useQuery({ guildId });
  const { data: guildMembers } = trpc.guild.getMembers.useQuery({ guildId });

  // Calculate metrics
  const completedTasks = tasks?.filter((t) => t.status === "completed").length || 0;
  const inProgressTasks = tasks?.filter((t) => t.status === "in_progress").length || 0;
  const totalTasks = tasks?.length || 0;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Prepare chart data
  const taskStatusData = [
    { name: "A Fazer", value: tasks?.filter((t) => t.status === "todo").length || 0, fill: "#6366f1" },
    { name: "Em Progresso", value: inProgressTasks, fill: "#f59e0b" },
    { name: "Concluído", value: completedTasks, fill: "#10b981" },
    { name: "Arquivado", value: tasks?.filter((t) => t.status === "archived").length || 0, fill: "#64748b" },
  ];

  const priorityData = [
    { name: "Baixa", value: tasks?.filter((t) => t.priority === "low").length || 0 },
    { name: "Média", value: tasks?.filter((t) => t.priority === "medium").length || 0 },
    { name: "Alta", value: tasks?.filter((t) => t.priority === "high").length || 0 },
    { name: "Crítica", value: tasks?.filter((t) => t.priority === "critical").length || 0 },
  ];

  const taskTypeData = [
    { name: "Quests", value: tasks?.filter((t) => t.taskType === "quest").length || 0 },
    { name: "Catch", value: tasks?.filter((t) => t.taskType === "catch").length || 0 },
    { name: "Profissões", value: tasks?.filter((t) => t.taskType === "profession").length || 0 },
    { name: "Diárias", value: tasks?.filter((t) => t.taskType === "daily").length || 0 },
  ];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Acompanhe o progresso da sua guilda</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("week")}
            className={timeRange === "week" ? "bg-indigo-600" : "border-slate-600"}
          >
            Semana
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("month")}
            className={timeRange === "month" ? "bg-indigo-600" : "border-slate-600"}
          >
            Mês
          </Button>
          <Button
            variant={timeRange === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("all")}
            className={timeRange === "all" ? "bg-indigo-600" : "border-slate-600"}
          >
            Tudo
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total de Tarefas</p>
              <p className="text-3xl font-bold text-white">{totalTasks}</p>
            </div>
            <div className="p-3 bg-indigo-600/20 rounded-lg">
              <Clock className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </Card>

        {/* Completed Tasks */}
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Concluídas</p>
              <p className="text-3xl font-bold text-green-400">{completedTasks}</p>
            </div>
            <div className="p-3 bg-green-600/20 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>

        {/* Completion Rate */}
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Taxa de Conclusão</p>
              <p className="text-3xl font-bold text-blue-400">
                {completionRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Guild Members */}
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Membros da Guilda</p>
              <p className="text-3xl font-bold text-purple-400">
                {guildMembers?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">
            Distribuição de Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Priority Distribution */}
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">
            Distribuição de Prioridade
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Task Type Distribution */}
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">
            Tipos de Tarefa
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                }}
              />
              <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* In Progress Tasks */}
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">
            Tarefas em Progresso
          </h2>
          <div className="space-y-3">
            {tasks
              ?.filter((t) => t.status === "in_progress")
              .slice(0, 5)
              .map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-slate-700/50 rounded-lg border border-slate-600/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">
                        {task.title}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {task.taskType}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-slate-400">
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            {inProgressTasks === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">
                Nenhuma tarefa em progresso
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">
          Atividade Recente
        </h2>
        <div className="space-y-3">
          {tasks?.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600/50"
            >
              <div>
                <p className="text-white font-medium text-sm">{task.title}</p>
                <p className="text-slate-400 text-xs">
                  {task.status} • {task.priority}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs">
                  {new Date(task.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
