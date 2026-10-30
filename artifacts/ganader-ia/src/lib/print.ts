export function printModule(title: string, subtitle?: string) {
  const prev = document.title;
  document.title = `GanaderIA — ${title}`;
  const meta = document.querySelector('meta[name="print-subtitle"]');
  if (meta) meta.setAttribute("content", subtitle || "");
  else {
    const m = document.createElement("meta");
    m.name = "print-subtitle"; m.content = subtitle || "";
    document.head.appendChild(m);
  }
  window.print();
  setTimeout(() => { document.title = prev; }, 1000);
}
