export type ProjectKind = "market" | "analysis" | "network" | "football";

export type PortfolioProject = {
  id: string;
  index: string;
  title: string;
  summary: string;
  tags: string[];
  visual: string;
  kind: ProjectKind;
  imageUrl: string;
  published: boolean;
};

export type PortfolioContent = {
  profileImageUrl: string;
  projects: PortfolioProject[];
};

export const defaultPortfolioContent: PortfolioContent = {
  profileImageUrl: "",
  projects: [
    {
      id: "market-opportunity-map",
      index: "01",
      title: "Market Opportunity Map",
      summary: "A practical framework for comparing demand signals, competitor activity, and customer fit across target markets.",
      tags: ["Market Sizing", "Customer Signals", "Opportunity Mapping"],
      visual: "MARKET SIGNALS",
      kind: "market",
      imageUrl: "",
      published: true,
    },
    {
      id: "decision-ready-data-analysis",
      index: "02",
      title: "Decision-ready Data Analysis",
      summary: "Turn complex inputs into clear comparisons, surface meaningful patterns, and clarify the next business decision.",
      tags: ["Data Preparation", "Analysis", "Visualization"],
      visual: "DATA PATTERNS",
      kind: "analysis",
      imageUrl: "",
      published: true,
    },
    {
      id: "big-data-signal-explorer",
      index: "03",
      title: "Big Data Signal Explorer",
      summary: "A scalable exploration concept for linking large datasets, finding recurring patterns, and presenting useful signals.",
      tags: ["Big Data", "Pattern Discovery", "Business Insights"],
      visual: "CONNECTED SIGNALS",
      kind: "network",
      imageUrl: "",
      published: true,
    },
    {
      id: "football-player-analysis",
      index: "04",
      title: "Football Player Analysis",
      summary: "A scouting dashboard concept that brings player attributes, match actions, and positional movement into one analysis view.",
      tags: ["Player Scouting", "Performance Analysis", "Data Visualization"],
      visual: "FOOTBALL ANALYTICS",
      kind: "football",
      imageUrl: "",
      published: true,
    },
  ],
};