import { TopNav } from "./TopNav";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff_0%,_#f0fdf4_35%,_#f8fdfb_100%)] text-slate-900">
      <TopNav />
      <div className="flex flex-col">
        <main>{children}</main>
        <footer className="border-t border-white/30 py-4 px-6 mt-8 bg-white/50 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>© 2026 GreenAtlas Environmental Intelligence Platform</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Data Sourcing
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
