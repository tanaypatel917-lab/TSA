"use client";

export function LivingGradient() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden mix-blend-screen"
    >
      <div className="living-gradient-blob living-gradient-blob-a absolute -left-[18vw] -top-[12vw] h-[60vw] w-[60vw] max-h-[900px] max-w-[900px] rounded-full bg-[#b02a08]/[.35] blur-3xl motion-reduce:animate-none" />
      <div className="living-gradient-blob living-gradient-blob-b absolute -right-[16vw] top-[8vw] h-[60vw] w-[60vw] max-h-[900px] max-w-[900px] rounded-full bg-[#ff4f1f]/[.20] blur-3xl motion-reduce:animate-none" />
      <div className="living-gradient-blob living-gradient-blob-c absolute -bottom-[24vw] left-[22vw] h-[60vw] w-[60vw] max-h-[900px] max-w-[900px] rounded-full bg-[#c8f560]/[.12] blur-3xl motion-reduce:animate-none" />
    </div>
  );
}
