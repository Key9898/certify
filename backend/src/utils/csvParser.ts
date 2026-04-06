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

export const parseCsv = (buffer: Buffer): Record<string, string>[] => {
  const text = buffer.toString('utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split('\n').filter((l) => l.trim().length > 0);

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

const REQUIRED_FIELDS = ['recipientName', 'certificateTitle', 'issuerName', 'issueDate'];

export const validateBatchData = (
  rows: Record<string, string>[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (rows.length === 0) {
    return { valid: false, errors: ['CSV file is empty or has no data rows.'] };
  }

  const firstRow = rows[0];
  const missingFields = REQUIRED_FIELDS.filter((f) => !(f in firstRow));

  if (missingFields.length > 0) {
    errors.push(
      `Missing required columns: ${missingFields.join(', ')}. ` +
        `Accepted aliases: name/recipientName, title/certificateTitle, issuer/issuerName, date/issueDate.`
    );
  }

  rows.forEach((row, index) => {
    REQUIRED_FIELDS.forEach((field) => {
      if (field in row && !row[field]) {
        errors.push(`Row ${index + 2}: "${field}" is empty.`);
      }
    });

    if (row.issueDate) {
      const d = new Date(row.issueDate);
      if (isNaN(d.getTime())) {
        errors.push(`Row ${index + 2}: Invalid date "${row.issueDate}".`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
};
