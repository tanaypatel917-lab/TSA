import { glossary } from "@/content/glossary";

export default function GlossaryPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <p className="eyebrow">Words to know / {String(glossary.length).padStart(2, "0")} terms</p>
      <h1 className="display-lg mt-4">AI glossary<span className="text-signal">.</span></h1>
      <p className="prose-body mt-6 max-w-2xl text-mute">Keep this page nearby while you learn. Understanding the vocabulary makes better questions possible.</p>
      <dl className="mt-14 grid border-t border-ink sm:grid-cols-2 lg:grid-cols-3">
        {glossary.map((item, i) => (
          <div className="border-b border-ink py-6 pr-6 sm:[&:nth-child(2n)]:pl-6 lg:[&:nth-child(2n)]:pl-0 lg:[&:nth-child(3n+2)]:px-6 lg:[&:nth-child(3n)]:pl-6" key={item.term}>
            <dt className="flex items-baseline gap-4"><span className="index">{String(i + 1).padStart(2, "0")}</span><span className="display-sm">{item.term}</span></dt>
            <dd className="mt-3 text-sm leading-relaxed text-mute">{item.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
