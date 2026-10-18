import { BODY } from "@/components/nib/nibShape";

export function nibSvg(size = 256): string {
  const pts = BODY.map(([x, y]) => `${x + 1},${y + 1}`).join(" ");
  const ink = "#1c1b18";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round((size * 34) / 24)}" viewBox="0 0 24 34">` +
    `<polygon points="${pts}" fill="#ffd23f" stroke="${ink}" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<g stroke="${ink}" stroke-width="0.8"><circle cx="5.4" cy="13" r="2.2" fill="#fff"/><circle cx="10.2" cy="14.3" r="2.2" fill="#fff"/></g>` +
    `<circle cx="5.4" cy="13" r="1" fill="${ink}"/><circle cx="10.2" cy="14.3" r="1" fill="${ink}"/>` +
    `<path d="M6.8 17.6 Q7.8 18.7 8.8 17.6" fill="none" stroke="${ink}" stroke-width="0.8" stroke-linecap="round"/></svg>`
  );
}

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function renderPixels(w: number, h: number): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([nibSvg(h)], { type: "image/svg+xml" }));
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, Math.round((h * 24) / 34), h);
      URL.revokeObjectURL(url);
      resolve(ctx.getImageData(0, 0, w, h));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("render failed"));
    };
    img.src = url;
  });
}

export async function pngBlob(size: number): Promise<Blob> {
  const h = size;
  const w = Math.round((size * 24) / 34);
  const img = await renderPixels(w, h);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("canvas context unavailable");
  ctx.putImageData(img, 0, 0);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("png failed"))), "image/png"));
}

export async function curBlob(): Promise<Blob> {
  const w = 32;
  const h = 32;
  const px = (await renderPixels(w, h)).data;
  const xorSize = w * h * 4;
  const maskRow = Math.ceil(w / 32) * 4;
  const maskSize = maskRow * h;
  const dibSize = 40 + xorSize + maskSize;
  const buf = new ArrayBuffer(22 + dibSize);
  const dv = new DataView(buf);
  // CUR file header: reserved (0), type (2 for cursor), count (1)
  dv.setUint16(0, 0, true);
  dv.setUint16(2, 2, true);
  dv.setUint16(4, 1, true);
  // Directory entry
  dv.setUint8(6, w);
  dv.setUint8(7, h);
  dv.setUint8(8, 0);
  dv.setUint8(9, 0);
  // Hotspot X=1, Y=1 (tip of NIB)
  dv.setUint16(10, 1, true);
  dv.setUint16(12, 1, true);
  dv.setUint32(14, dibSize, true);
  dv.setUint32(18, 22, true);
  // BITMAPINFOHEADER (40 bytes)
  let o = 22;
  dv.setUint32(o, 40, true);
  dv.setInt32(o + 4, w, true);
  dv.setInt32(o + 8, h * 2, true); // double height for XOR + AND masks
  dv.setUint16(o + 12, 1, true);
  dv.setUint16(o + 14, 32, true); // 32 bpp
  dv.setUint32(o + 20, xorSize + maskSize, true);
  o += 40;
  // Pixel data (bottom-up BGRA)
  for (let y = h - 1; y >= 0; y--) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      dv.setUint8(o++, px[i + 2]); // B
      dv.setUint8(o++, px[i + 1]); // G
      dv.setUint8(o++, px[i]);     // R
      dv.setUint8(o++, px[i + 3]); // A
    }
  }
  return new Blob([buf], { type: "image/x-icon" });
}
