export type ProposalStatus = "open" | "closed";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface Professor {
  id: number;
  name: string;
  department: string;
  lattes: string;
  avatar: string;
}

export interface Proposal {
  id: number;
  title: string;
  description: string;
  prerequisites: string[];
  area: string;
  department: string;
  maxSlots: number;
  filledSlots: number;
  status: ProposalStatus;
  professor: Professor;
  createdAt: string;
}

export interface Application {
  id: number;
  proposalId: number;
  studentName: string;
  studentEmail: string;
  studentPortfolio: string;
  status: ApplicationStatus;
  appliedAt: string;
  feedback?: string;
}

export const professors: Professor[] = [
  { id: 1, name: "Dra. Mariana Vasconcelos", department: "DCC", lattes: "lattes.cnpq.br/1234", avatar: "MV" },
  { id: 2, name: "Dr. Ricardo Almeida", department: "DCC", lattes: "lattes.cnpq.br/5678", avatar: "RA" },
  { id: 3, name: "Dra. Helena Prado", department: "DEE", lattes: "lattes.cnpq.br/9012", avatar: "HP" },
  { id: 4, name: "Dr. Felipe Drummond", department: "DCC", lattes: "lattes.cnpq.br/3456", avatar: "FD" },
];

export const proposals: Proposal[] = [
  {
    id: 1,
    title: "Detecção de Deepfakes com Modelos de Difusão",
    description:
      "Investigar arquiteturas baseadas em modelos de difusão para identificar conteúdo audiovisual sintético, com foco em robustez a compressão e ruído de redes sociais.",
    prerequisites: ["Python", "PyTorch", "Visão Computacional", "Estatística"],
    area: "Inteligência Artificial",
    department: "DCC",
    maxSlots: 2,
    filledSlots: 0,
    status: "open",
    professor: professors[0],
    createdAt: "2026-04-12",
  },
  {
    id: 2,
    title: "Otimização de Consultas em Bancos Vetoriais",
    description:
      "Análise comparativa de estruturas de índice (HNSW, IVF-PQ) para busca aproximada de vizinhos, aplicada a sistemas de RAG em larga escala.",
    prerequisites: ["Estruturas de Dados", "C++ ou Rust", "Banco de Dados"],
    area: "Banco de Dados",
    department: "DCC",
    maxSlots: 1,
    filledSlots: 0,
    status: "open",
    professor: professors[1],
    createdAt: "2026-04-20",
  },
  {
    id: 3,
    title: "Energia Limpa: Previsão Solar com Séries Temporais",
    description:
      "Modelos híbridos (LSTM + Transformer) para previsão de geração fotovoltaica usando dados meteorológicos do INMET.",
    prerequisites: ["Machine Learning", "Pandas", "Conhecimento básico em energia"],
    area: "Sistemas de Energia",
    department: "DEE",
    maxSlots: 3,
    filledSlots: 1,
    status: "open",
    professor: professors[2],
    createdAt: "2026-03-30",
  },
  {
    id: 4,
    title: "Compiladores: JIT para uma Linguagem Educacional",
    description:
      "Implementação de um compilador Just-in-Time usando LLVM para uma linguagem dinâmica didática, com foco em otimizações de runtime.",
    prerequisites: ["Compiladores", "C/C++", "LLVM (desejável)"],
    area: "Linguagens de Programação",
    department: "DCC",
    maxSlots: 1,
    filledSlots: 1,
    status: "closed",
    professor: professors[3],
    createdAt: "2026-02-15",
  },
  {
    id: 5,
    title: "Acessibilidade Web com IA Generativa",
    description:
      "Geração automática de descrições alt-text e legendas em tempo real para sites legados, integrando modelos multimodais open-source.",
    prerequisites: ["React/TypeScript", "APIs REST", "Acessibilidade (WCAG)"],
    area: "Interação Humano-Computador",
    department: "DCC",
    maxSlots: 2,
    filledSlots: 0,
    status: "open",
    professor: professors[0],
    createdAt: "2026-05-01",
  },
  {
    id: 6,
    title: "Detecção de Anomalias em Redes IoT Industriais",
    description:
      "Pipeline de monitoramento usando autoencoders variacionais para identificar comportamentos anômalos em sensores de chão de fábrica.",
    prerequisites: ["Redes de Computadores", "Python", "Noções de IoT"],
    area: "Segurança de Redes",
    department: "DEE",
    maxSlots: 2,
    filledSlots: 0,
    status: "open",
    professor: professors[2],
    createdAt: "2026-04-28",
  },
];

export const applications: Application[] = [
  {
    id: 1,
    proposalId: 1,
    studentName: "Ana Beatriz Souza",
    studentEmail: "ana.souza@ufmg.br",
    studentPortfolio: "github.com/anabsouza",
    status: "pending",
    appliedAt: "2026-05-02",
  },
  {
    id: 2,
    proposalId: 1,
    studentName: "Lucas Pereira",
    studentEmail: "lucas.p@ufmg.br",
    studentPortfolio: "github.com/lpereira",
    status: "pending",
    appliedAt: "2026-05-03",
  },
  {
    id: 3,
    proposalId: 3,
    studentName: "Mariana Costa",
    studentEmail: "mari.costa@ufmg.br",
    studentPortfolio: "linkedin.com/mcosta",
    status: "approved",
    appliedAt: "2026-04-10",
    feedback: "Perfil excelente, alinhado com o projeto.",
  },
  {
    id: 4,
    proposalId: 2,
    studentName: "Rafael Mendes",
    studentEmail: "rafael.m@ufmg.br",
    studentPortfolio: "github.com/rafmendes",
    status: "rejected",
    appliedAt: "2026-04-22",
    feedback: "Falta experiência prévia em sistemas de baixo nível.",
  },
];

export const knowledgeAreas = [
  "Todas",
  "Inteligência Artificial",
  "Banco de Dados",
  "Sistemas de Energia",
  "Linguagens de Programação",
  "Interação Humano-Computador",
  "Segurança de Redes",
];

export const departments = ["Todos", "DCC", "DEE"];
