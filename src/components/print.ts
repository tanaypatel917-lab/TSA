export function printSection(id: string) {
  const source = document.querySelector<HTMLElement>(`[data-print-id="${id}"]`);
  if (!source) return;
  let target = document.getElementById("print-root");
  if (!target) {
    target = document.createElement("div");
    target.id = "print-root";
    document.body.appendChild(target);
  }
  target.innerHTML = source.innerHTML;
  target.dataset.kind = source.dataset.printKind ?? "sheet";
  const root = document.documentElement;
  root.dataset.print = id;
  const done = () => {
    delete root.dataset.print;
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  window.print();
}
