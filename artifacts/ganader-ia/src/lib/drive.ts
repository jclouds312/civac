export interface DriveFile {
  id: string;
  name: string;
  size: number;
  date: string;
  type: "backup" | "export";
}

export function getDriveFiles(): DriveFile[] {
  try {
    const stored = localStorage.getItem("ganader_drive_files");
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveDriveFiles(files: DriveFile[]) {
  try { localStorage.setItem("ganader_drive_files", JSON.stringify(files)); } catch {}
}

export async function exportToDrive(data: object, filename: string): Promise<DriveFile> {
  await new Promise(r => setTimeout(r, 1200));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const file: DriveFile = {
    id: `drive_${Date.now()}`,
    name: filename,
    size: blob.size,
    date: new Date().toLocaleString("es-CO"),
    type: "backup",
  };
  const files = [file, ...getDriveFiles()].slice(0, 20);
  saveDriveFiles(files);
  return file;
}

export async function downloadFromDrive(file: DriveFile, localData: object): Promise<void> {
  await new Promise(r => setTimeout(r, 800));
  const blob = new Blob([JSON.stringify(localData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadLocalBackup(data: object, filename: string): Promise<void> {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadCSV(rows: object[], filename: string): Promise<void> {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(","), ...rows.map(r => keys.map(k => JSON.stringify((r as any)[k] ?? "")).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importFromFile(file: File): Promise<object> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try { resolve(JSON.parse(e.target?.result as string)); }
      catch { reject(new Error("Archivo JSON inválido")); }
    };
    reader.onerror = () => reject(new Error("Error leyendo archivo"));
    reader.readAsText(file);
  });
}
