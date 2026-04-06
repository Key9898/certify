const COLUMN_ALIASES: Record<string, string> = {
  name: 'recipientName',
  recipient: 'recipientName',
  recipientname: 'recipientName',
  title: 'certificateTitle',
  certificatetitle: 'certificateTitle',
  course: 'certificateTitle',
  email: 'recipientEmail',
  recipientemail: 'recipientEmail',
  issuer: 'issuerName',
  issuername: 'issuerName',
  issuedby: 'issuerName',
  date: 'issueDate',
  issuedate: 'issueDate',
  issueddate: 'issueDate',
  expirydate: 'expiryDate',
  expiry: 'expiryDate',
  expires: 'expiryDate',
  description: 'description',
  desc: 'description',
};

const normalizeHeader = (header: string): string => {
  const key = header.toLowerCase().replace(/[\s_-]/g, '');
  return COLUMN_ALIASES[key] ?? header.trim();
};

const parseRow = (line: string): string[] => {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }

  fields.push(current.trim());
  return fields;
};

export const parseCsvText = (text: string): Record<string, string>[] => {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n').filter((l) => l.trim().length > 0);

  if (lines.length < 2) return [];

  const rawHeaders = parseRow(lines[0]);
  const headers = rawHeaders.map(normalizeHeader);

  return lines.slice(1).map((line) => {
    const values = parseRow(line);
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = values[i] ?? '';
    });
    return row;
  });
};

export const parseCsvFile = (file: File): Promise<Record<string, string>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        resolve(parseCsvText(text));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
