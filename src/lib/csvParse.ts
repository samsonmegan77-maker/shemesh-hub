/**
 * Lightweight CSV parser for bank statement import.
 * Handles quoted fields and common bank export formats.
 */

export interface ParsedBankLine {
  date: string;
  description: string;
  amount: number;
}

export function parseBankCsv(text: string): ParsedBankLine[] {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const first = lines[0];
  const delim = first.includes(';') && !first.includes(',') ? ';' : ',';

  const rows = lines.map((line) => parseCsvLine(line, delim));
  if (rows.length < 2) return [];

  const header = rows[0].map((h) => h.toLowerCase().trim());
  let dateIdx = header.findIndex((h) => /date|datum|trans.*date/.test(h));
  let descIdx = header.findIndex((h) =>
    /desc|narrat|detail|particular|reference|memo|payee/.test(h)
  );
  let amountIdx = header.findIndex((h) =>
    /amount|value|debit|credit|sum|amount \(zar\)/.test(h)
  );
  let debitIdx = header.findIndex((h) => /debit/.test(h));
  let creditIdx = header.findIndex((h) => /credit/.test(h));

  if (dateIdx < 0) dateIdx = 0;
  if (descIdx < 0) descIdx = 1;
  if (amountIdx < 0 && debitIdx < 0 && creditIdx < 0) amountIdx = 2;

  const start = headerLooksLikeHeader(header) ? 1 : 0;
  const result: ParsedBankLine[] = [];

  for (let i = start; i < rows.length; i++) {
    const cols = rows[i];
    if (cols.length < 2) continue;

    const dateRaw = cols[dateIdx] || '';
    const desc = (cols[descIdx] || '').trim() || '\u2014';
    let amount = 0;

    if (amountIdx >= 0 && cols[amountIdx] != null) {
      amount = parseAmount(cols[amountIdx]);
    } else if (debitIdx >= 0 || creditIdx >= 0) {
      const debit = debitIdx >= 0 ? parseAmount(cols[debitIdx]) : 0;
      const credit = creditIdx >= 0 ? parseAmount(cols[creditIdx]) : 0;
      amount = credit - debit;
    }

    if (!dateRaw && amount === 0 && desc === '\u2014') continue;

    result.push({
      date: normaliseDate(dateRaw),
      description: desc,
      amount,
    });
  }

  return result;
}

function headerLooksLikeHeader(header: string[]): boolean {
  const joined = header.join(' ');
  return /date|amount|desc|debit|credit|value/.test(joined);
}

function parseCsvLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === delim && !inQuotes) {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

function parseAmount(raw: string): number {
  if (!raw) return 0;
  let s = String(raw)
    .replace(/R\s*/gi, '')
    .replace(/\s/g, '')
    .replace(/,/g, '');
  if (/\d\.\d{3},\d{2}$/.test(s) || /,\d{2}$/.test(s)) {
    s = s.replace(/\./g, '').replace(',', '.');
  }
  if (/^\(.*\)$/.test(s)) {
    s = '-' + s.slice(1, -1);
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function normaliseDate(raw: string): string {
  if (!raw) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    let y = m[3];
    if (y.length === 2) y = '20' + y;
    const d = m[1].padStart(2, '0');
    const mo = m[2].padStart(2, '0');
    return `${y}-${mo}-${d}`;
  }
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}
