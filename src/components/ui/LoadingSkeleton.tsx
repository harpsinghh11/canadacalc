export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 rounded-lg bg-slate-200" />
      ))}
    </div>
  );
}
