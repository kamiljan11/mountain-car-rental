import "server-only";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// Generator PDF faktury z danych strukturalnych (NIE z HTML — pdf-lib rysuje tekst).
// Font Unicode (DejaVu Sans) obsługuje polskie (ł/ą/ż) i islandzkie (ð/þ/í) znaki,
// których standardowy Helvetica (WinAnsi) nie ma. Font ładowany z /public przez origin.

export interface InvoicePdfData {
  number: string;
  date: string;
  seller: string[]; // linie bloku sprzedawcy
  buyer: string[]; // linie bloku nabywcy
  rows: { label: string; value: string }[]; // pozycje
  totalLabel: string; // "Do zapłaty (brutto): 75 000 ISK"
  payment: { label: string; value: string }[];
  footer: string;
}

const A4 = { w: 595.28, h: 841.89 };
const M = 50; // margines
const GRAY = rgb(0.45, 0.45, 0.48);
const DARK = rgb(0.1, 0.1, 0.11);
const LINE = rgb(0.9, 0.9, 0.92);

export async function buildInvoicePdf(
  data: InvoicePdfData,
  fontBytes: ArrayBuffer | Uint8Array,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(fontBytes, { subset: true });
  const page = doc.addPage([A4.w, A4.h]);
  let y = A4.h - M;

  const text = (s: string, size: number, x = M, color = DARK) => {
    page.drawText(s, { x, y, size, font, color });
  };
  // Zawijanie tekstu do zadanej szerokości (proste, po słowach).
  const wrap = (s: string, size: number, maxW: number): string[] => {
    const words = s.split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else cur = test;
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  };
  const paragraph = (s: string, size: number, x: number, maxW: number, gap = 3, color = DARK) => {
    for (const line of wrap(s, size, maxW)) {
      page.drawText(line, { x, y, size, font, color });
      y -= size + gap;
    }
  };
  const hline = () => {
    page.drawLine({ start: { x: M, y }, end: { x: A4.w - M, y }, thickness: 0.7, color: LINE });
  };

  // Nagłówek
  text("Faktura / Reikningur", 18);
  y -= 22;
  text(`nr ${data.number} · wystawiona ${data.date}`, 9, M, GRAY);
  y -= 18;
  hline();
  y -= 18;

  // Sprzedawca / Nabywca w dwóch kolumnach
  const colW = (A4.w - 2 * M - 20) / 2;
  const rightX = M + colW + 20;
  const startY = y;
  text("Sprzedawca", 10, M, GRAY);
  const sellerStart = y - 14;
  // Nabywca nagłówek na tej samej wysokości
  page.drawText("Nabywca", { x: rightX, y, size: 10, font, color: GRAY });
  y = sellerStart;
  for (const line of data.seller) paragraph(line, 9.5, M, colW, 3);
  const afterSeller = y;
  // Nabywca — od tej samej wysokości co sprzedawca
  y = sellerStart;
  for (const line of data.buyer) paragraph(line, 9.5, rightX, colW, 3);
  y = Math.min(afterSeller, y) - 10;
  void startY;
  hline();
  y -= 18;

  // Pozycje
  text("Pozycje", 11);
  y -= 18;
  const valX = M + 150;
  const valW = A4.w - M - valX;
  for (const r of data.rows) {
    const yStart = y;
    page.drawText(r.label, { x: M, y, size: 9.5, font, color: GRAY });
    paragraph(r.value, 9.5, valX, valW, 3);
    y = Math.min(yStart - 14, y);
  }
  y -= 6;
  hline();
  y -= 18;
  text(data.totalLabel, 12);
  y -= 22;
  hline();
  y -= 18;

  // Płatność
  text("Płatność", 11);
  y -= 18;
  for (const r of data.payment) {
    const yStart = y;
    page.drawText(r.label, { x: M, y, size: 9.5, font, color: GRAY });
    paragraph(r.value, 9.5, valX, valW, 3);
    y = Math.min(yStart - 14, y);
  }
  y -= 16;
  text(data.footer, 8, M, GRAY);

  return doc.save();
}
