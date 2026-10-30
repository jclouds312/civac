import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[v0] Error de módulo CIVAC", { error, componentStack: info.componentStack });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-[#040d1a] px-6 text-white">
        <section className="w-full max-w-lg rounded-3xl border border-cyan-300/20 bg-white/[0.04] p-8 text-center shadow-2xl shadow-cyan-950/30">
          <ShieldAlert className="mx-auto mb-4 text-amber-300" aria-hidden="true" />
          <h1 className="text-xl font-black">Módulo temporalmente no disponible</h1>
          <p className="mt-2 text-sm text-white/60">CIVAC protegió tu sesión. Puedes reintentar sin perder el estado local.</p>
          {this.state.message && <p className="mt-3 truncate text-xs text-white/35" title={this.state.message}>{this.state.message}</p>}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
          >
            <RefreshCw size={15} aria-hidden="true" /> Reintentar
          </button>
        </section>
      </main>
    );
  }
}
