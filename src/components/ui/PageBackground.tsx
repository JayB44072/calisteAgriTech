export function PageBackground({ variant = 'default' }: { variant?: 'default' | 'green' | 'blue' | 'purple' }) {
  const gradients: Record<string, { blob1: string; blob2: string; blob3: string }> = {
    default: { blob1: 'from-emerald-400/8 to-teal-400/8', blob2: 'from-green-300/6 to-emerald-300/6', blob3: 'from-teal-400/5 to-cyan-400/5' },
    green: { blob1: 'from-green-400/10 to-emerald-400/10', blob2: 'from-lime-300/8 to-green-300/8', blob3: 'from-emerald-400/6 to-teal-400/6' },
    blue: { blob1: 'from-blue-400/8 to-cyan-400/8', blob2: 'from-sky-300/6 to-blue-300/6', blob3: 'from-cyan-400/5 to-teal-400/5' },
    purple: { blob1: 'from-purple-400/8 to-violet-400/8', blob2: 'from-indigo-300/6 to-purple-300/6', blob3: 'from-violet-400/5 to-purple-400/5' },
  };
  const g = gradients[variant];

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br ${g.blob1} blur-3xl`} />
      <div className={`absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-bl ${g.blob2} blur-3xl`} />
      <div className={`absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-tr ${g.blob3} blur-3xl`} />
      <svg className="absolute top-0 left-0 w-full h-full opacity-[0.015] dark:opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
