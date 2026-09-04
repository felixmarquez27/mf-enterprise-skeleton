import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/features/auth";
import { brandConfig } from "@/config/brand";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col justify-between p-6 md:p-10">
        <div className="flex justify-center md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">{brandConfig.appName}</span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          {brandConfig.copyrightText}
        </div>
      </div>

      <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-primary/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_50%)]" />

        <div className="relative z-20 flex items-center gap-2 text-base font-semibold">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <span>Plataforma Microfrontends</span>
        </div>

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg leading-relaxed text-zinc-200">
              &ldquo;Arquitectura modular de alto rendimiento construida con Module Federation, Rsbuild, React 19 y TanStack Query para una gestión centralizada y eficiente.&rdquo;
            </p>
            <footer className="text-sm font-medium text-zinc-400">
              Sistema de Administración y Operaciones
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
