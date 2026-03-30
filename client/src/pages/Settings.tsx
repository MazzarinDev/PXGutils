import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Settings as SettingsIcon } from "lucide-react";

interface SettingsPageProps {
  guildId: number;
}

export default function SettingsPage({ guildId }: SettingsPageProps) {
  const { data: guild } = trpc.guild.getById.useQuery({ id: guildId });
  const [copied, setCopied] = useState(false);
  const [guildName, setGuildName] = useState(guild?.name || "");
  const [guildDescription, setGuildDescription] = useState(guild?.description || "");

  const handleCopyCode = () => {
    if (guild?.joinCode) {
      navigator.clipboard.writeText(guild.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveSettings = async () => {
    try {
      console.log("Save settings:", { name: guildName, description: guildDescription });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-indigo-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Configurações</h1>
          <p className="text-slate-400">Gerencie as configurações da sua guilda</p>
        </div>
      </div>

      {/* Guild Information */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h2 className="text-xl font-semibold text-white mb-4">Informações da Guilda</h2>

        <div className="space-y-4">
          {/* Guild Name */}
          <div className="space-y-2">
            <Label htmlFor="guildName" className="text-slate-200">
              Nome da Guilda
            </Label>
            <Input
              id="guildName"
              value={guildName}
              onChange={(e) => setGuildName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Nome da guilda"
            />
          </div>

          {/* Guild Description */}
          <div className="space-y-2">
            <Label htmlFor="guildDescription" className="text-slate-200">
              Descrição
            </Label>
            <Textarea
              id="guildDescription"
              value={guildDescription}
              onChange={(e) => setGuildDescription(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Descrição da guilda"
              rows={3}
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            className="bg-indigo-600 hover:bg-indigo-700 w-full"
          >
            Salvar Alterações
          </Button>
        </div>
      </Card>

      {/* Guild Statistics */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h2 className="text-xl font-semibold text-white mb-4">Estatísticas da Guilda</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <p className="text-slate-400 text-sm mb-1">Membros</p>
            <p className="text-2xl font-bold text-white">{guild?.totalMembers || 0}</p>
          </div>

          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <p className="text-slate-400 text-sm mb-1">Tarefas Concluídas</p>
            <p className="text-2xl font-bold text-green-400">
              {guild?.totalTasksCompleted || 0}
            </p>
          </div>

          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <p className="text-slate-400 text-sm mb-1">Criada em</p>
            <p className="text-sm font-medium text-white">
              {guild?.createdAt
                ? new Date(guild.createdAt).toLocaleDateString("pt-BR")
                : "-"}
            </p>
          </div>
        </div>
      </Card>

      {/* Join Code */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h2 className="text-xl font-semibold text-white mb-4">Código de Convite</h2>

        <div className="space-y-3">
          <p className="text-slate-400 text-sm">
            Compartilhe este código com amigos para que eles possam se juntar à sua guilda
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
              <code className="text-white font-mono text-sm">
                {guild?.joinCode || "Gerando código..."}
              </code>
            </div>
            <Button
              onClick={handleCopyCode}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 bg-red-900/20 border-red-700/50">
        <h2 className="text-xl font-semibold text-red-400 mb-4">⚠️ Zona de Perigo</h2>

        <div className="space-y-3">
          <p className="text-slate-400 text-sm">
            Estas ações são irreversíveis. Use com cuidado.
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/20"
            >
              Dissolver Guilda
            </Button>
            <Button
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/20"
            >
              Sair da Guilda
            </Button>
          </div>
        </div>
      </Card>

      {/* Help Section */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h2 className="text-xl font-semibold text-white mb-4">❓ Ajuda</h2>

        <div className="space-y-3 text-sm text-slate-300">
          <p>
            <strong>Como adicionar membros?</strong> Use o código de convite acima para
            compartilhar com seus amigos.
          </p>
          <p>
            <strong>Como mudar permissões?</strong> Acesse a seção de Membros para gerenciar
            papéis.
          </p>
          <p>
            <strong>Como deletar tarefas?</strong> Clique no ícone de lixeira em qualquer
            cartão de tarefa.
          </p>
          <p>
            <strong>Precisa de mais ajuda?</strong> Consulte a{" "}
            <a href="#" className="text-indigo-400 hover:underline">
              documentação completa
            </a>
            .
          </p>
        </div>
      </Card>
    </div>
  );
}
