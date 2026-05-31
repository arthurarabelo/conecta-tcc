import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Conecta TCC" }] }),
  component: Login,
});

function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"student" | "professor">("student");

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden md:flex flex-col justify-between p-12 bg-gradient-hero text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="font-display text-lg font-semibold">Conecta TCC</div>
        </Link>
        <div className="relative">
          <h2 className="font-display text-4xl font-semibold leading-tight text-balance">
            "Boas perguntas merecem bons orientadores."
          </h2>
          <p className="mt-4 text-white/70 text-sm">— Diretoria de Graduação, 2026</p>
        </div>
        <div className="relative text-xs text-white/50">© 2026 Portal Conecta TCC</div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center px-6 md:px-16 py-16 bg-background">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {mode === "login" ? "Acesso" : "Cadastro"}
          </div>
          <h1 className="mt-2 font-display text-4xl font-semibold">
            {mode === "login" ? "Bem-vindo de volta." : "Crie sua conta."}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" ? "Entre com seu e-mail institucional." : "Cadastre-se para publicar ou candidatar-se."}
          </p>

          {mode === "register" && (
            <div className="mt-8 grid grid-cols-2 gap-2 p-1 rounded-lg bg-secondary">
              {(["student", "professor"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                    role === r ? "bg-card shadow-soft" : "text-muted-foreground"
                  }`}
                >
                  {r === "student" ? "Aluno" : "Professor"}
                </button>
              ))}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            {mode === "register" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome completo</label>
                <input className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-mail</label>
              <input
                type="email"
                placeholder="seu.nome@ufmg.br"
                className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Senha</label>
              <input
                type="password"
                className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              type="submit"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-3 text-sm font-semibold text-background hover:opacity-90"
            >
              {mode === "login" ? "Entrar" : "Criar conta"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Ainda não tem conta?{" "}
                <button onClick={() => setMode("register")} className="font-semibold text-foreground underline-offset-4 hover:underline">
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button onClick={() => setMode("login")} className="font-semibold text-foreground underline-offset-4 hover:underline">
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
