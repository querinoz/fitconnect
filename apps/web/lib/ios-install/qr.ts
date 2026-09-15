import { encode } from "uqr";

export type QrMatrix = {
  size: number;
  modules: boolean[][];
};

export function encodeInstallQr(text: string): QrMatrix | null {
  const value = text.trim();
  if (!value) return null;
  if (!/^https:\/\//i.test(value)) return null;
  try {
    const encoded = encode(value, { ecc: "M" });
    const size = encoded.size;
    const modules: boolean[][] = [];
    for (let y = 0; y < size; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < size; x++) {
        row.push(Boolean(encoded.data[y]?.[x]));
      }
      modules.push(row);
    }
    if (modules.length === 0) return null;
    return { size, modules };
  } catch {
    return null;
  }
}

export function qrModulesToPath(matrix: QrMatrix, quiet = 4): { path: string; dim: number } {
  let path = "";
  for (let y = 0; y < matrix.size; y++) {
    const row = matrix.modules[y] ?? [];
    for (let x = 0; x < matrix.size; x++) {
      if (row[x]) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
    }
  }
  return { path, dim: matrix.size + quiet * 2 };
}
