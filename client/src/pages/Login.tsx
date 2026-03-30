import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Login() {
  const [characterName, setCharacterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!characterName.trim()) {
        setError("Digite o nome do seu personagem");
        setLoading(false);
        return;
      }

      // Salvar nome do personagem no localStorage
      localStorage.setItem("characterName", characterName);
      
      // Redirecionar para dashboard
      setLocation("/dashboard");
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">PXGManager</h1>
          <p className="text-slate-400">Gerencie suas atividades de guilda</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800 border-slate-700 shadow-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-white">Entrar</CardTitle>
            <CardDescription className="text-slate-400">
              Digite o nome do seu personagem para acessar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="characterName" className="text-sm font-medium text-slate-200">
                  Nome do Personagem
                </label>
                <Input
                  id="characterName"
                  placeholder="Ex: Kooxh"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-700 rounded text-red-200 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-slate-700/50 rounded border border-slate-600">
              <p className="text-xs text-slate-400">
                <strong>💡 Dica:</strong> Use o nome do seu personagem no PokeXgames para acessar. Seus dados serão salvos automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>PXGManager v1.0.0 • Desenvolvido por MazzarinDev</p>
        </div>
      </div>
    </div>
  );
}
