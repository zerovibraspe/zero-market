export function IconoCategoria({ categoria, className = "w-5 h-5" }: { categoria: string; className?: string }) {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (categoria === "video") {
    return (
      <svg {...props}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M10 9.5v5l4.5-2.5-4.5-2.5z" />
      </svg>
    );
  }

  if (categoria === "plugin") {
    return (
      <svg {...props}>
        <path d="M9 4v3H6a1 1 0 0 0-1 1v3H2v4h3v3a1 1 0 0 0 1 1h3v-3h4v3a1 1 0 0 0 1 1h3v-3h3v-4h-3v-3a1 1 0 0 0-1-1h-3V4h-4z" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 16.5h6" />
    </svg>
  );
}
