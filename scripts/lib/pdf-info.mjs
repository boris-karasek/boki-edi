// Sets the document properties of a PDF made by Chrome (shown in PDF viewers under "Properties").
// Chrome writes only the title (from <title>) and the language (from <html lang>); this adds author,
// subject, keywords and creator.
//
// It appends an "incremental update" (PDF 1.4, section 3.4.5): a new version of the Info dictionary,
// a cross-reference section for it and a new trailer. Chrome's bytes before it stay unchanged.

// PDF text string in UTF-16BE with a byte order mark, so č, ć, š, ž, đ and dashes are kept.
function pdfString(text) {
  const utf16 = Buffer.from(`﻿${text}`, "utf16le").swap16();
  return `<${utf16.toString("hex").toUpperCase()}>`;
}

// fields: { Title, Author, Subject, Keywords, Creator } (any of them); returns a new Buffer
export function setPdfInfo(pdf, fields) {
  const text = pdf.toString("latin1");
  const tail = /trailer\s*<<([\s\S]*?)>>\s*startxref\s+(\d+)\s+%%EOF\s*$/.exec(text);
  if (!tail) throw new Error("PDF trailer not found (expected a classic cross-reference table)");
  const [, trailer, previousXref] = tail;
  const size = /\/Size (\d+)/.exec(trailer)?.[1];
  const root = /\/Root (\d+ \d+ R)/.exec(trailer)?.[1];
  const info = /\/Info (\d+) (\d+) R/.exec(trailer);
  if (!size || !root || !info) throw new Error("PDF trailer without /Size, /Root or /Info");
  const [, infoNumber, infoGeneration] = info;

  // Keep Chrome's producer and dates from the current Info dictionary
  const objectStart = text.lastIndexOf(`\n${infoNumber} ${infoGeneration} obj`);
  const current = text.slice(objectStart, text.indexOf("endobj", objectStart));
  const kept = ["Producer", "CreationDate", "ModDate"]
    .map((key) => new RegExp(`/${key} (\\([^)]*\\))`).exec(current))
    .filter(Boolean)
    .map((match) => match[0]);

  const entries = Object.entries(fields)
    .filter(([, value]) => value)
    .map(([key, value]) => `/${key} ${pdfString(value)}`);

  const separator = text.endsWith("\n") ? "" : "\n";
  const objectOffset = pdf.length + separator.length;
  const object = `${infoNumber} ${infoGeneration} obj\n<<${[...entries, ...kept].join("\n")}>>\nendobj\n`;
  const xrefOffset = objectOffset + Buffer.byteLength(object, "latin1");
  const xrefEntry = `${String(objectOffset).padStart(10, "0")} ${String(infoGeneration).padStart(5, "0")} n \n`;
  const update =
    separator +
    object +
    `xref\n${infoNumber} 1\n${xrefEntry}` +
    `trailer\n<</Size ${size}\n/Root ${root}\n/Info ${infoNumber} ${infoGeneration} R\n/Prev ${previousXref}>>\n` +
    `startxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.concat([pdf, Buffer.from(update, "latin1")]);
}
