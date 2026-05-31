import { GraduationCap } from 'lucide-react'

export function FooterSection() {
  return (
    <footer className="mt-auto border-t py-10 px-6 bg-background">
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <GraduationCap className="h-4 w-4" />
          Conecta TCC
        </div>
        <p>Projeto de TCC — DCC/UFMG · 2026</p>
      </div>
    </footer>
  )
}
