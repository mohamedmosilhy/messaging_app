export function DateSeparator({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-3 py-3" role="separator">
      <div className="h-px flex-1 bg-border/70" />
      <time className="rounded-full border bg-card px-3 py-1 text-[0.7rem] font-medium text-muted-foreground shadow-xs">
        {label}
      </time>
      <div className="h-px flex-1 bg-border/70" />
    </li>
  );
}
