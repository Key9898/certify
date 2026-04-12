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

type CellValue =
  | null
  | undefined
  | number
  | string
  | boolean
  | Date
  | { result: CellValue }
  | { richText: Array<{ text: string }> };

const parseCellValue = (value: CellValue): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'object' && 'result' in value) {
    return parseCellValue(value.result);
  }

  if (typeof value === 'object' && 'richText' in value) {
    return value.richText.map((rt) => rt.text).join('');
  }

  return String(value).trim();
};

const parseXlsxArrayBuffer = async (
  buffer: ArrayBuffer
): Promise<Record<string, string>[]> => {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return [];
  }

  const rows: Record<string, string>[] = [];
  let headers: string[] = [];
  let headerRowFound = false;

  worksheet.eachRow((row) => {
    const values = row.values as CellValue[];

    if (!headerRowFound) {
      const rawHeaders = values.slice(1).map((value) => parseCellValue(value));
      headers = rawHeaders.map(normalizeHeader);
      headerRowFound = true;
      return;
    }

    const hasContent = values
      .slice(1)
      .some((value) => parseCellValue(value).length > 0);
    if (!hasContent) {
      return;
    }

    const record: Record<string, string> = {};
    const cellValues = values.slice(1);

    headers.forEach((header, i) => {
      record[header] = parseCellValue(cellValues[i]);
    });

    rows.push(record);
  });

  return rows;
};

export const parseCsvFile = (file: File): Promise<Record<string, string>[]> => {
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

  if (ext === '.xlsx') {
    return file.arrayBuffer().then(parseXlsxArrayBuffer);
  }

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
