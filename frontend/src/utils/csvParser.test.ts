import { describe, it, expect } from 'vitest';
import { parseCsvText } from './csvParser';

describe('parseCsvText', () => {
  it('returns empty array when fewer than 2 lines', () => {
    expect(parseCsvText('')).toEqual([]);
    expect(parseCsvText('name,title')).toEqual([]);
  });

  it('parses basic CSV correctly', () => {
    const csv = `name,title,issuer,date
Alice,Certificate of Excellence,Tech Academy,2024-03-15`;
    const result = parseCsvText(csv);
    expect(result).toHaveLength(1);
    expect(result[0].recipientName).toBe('Alice');
    expect(result[0].certificateTitle).toBe('Certificate of Excellence');
    expect(result[0].issuerName).toBe('Tech Academy');
    expect(result[0].issueDate).toBe('2024-03-15');
  });

  it('normalizes column aliases correctly', () => {
    const csv = `recipient,course,issuedBy,issueDate
Bob,React Mastery,Certify,2024-01-01`;
    const result = parseCsvText(csv);
    expect(result[0].recipientName).toBe('Bob');
    expect(result[0].certificateTitle).toBe('React Mastery');
    expect(result[0].issuerName).toBe('Certify');
    expect(result[0].issueDate).toBe('2024-01-01');
  });

  it('handles quoted fields with commas inside', () => {
    const csv = `name,title,issuer,date
Alice,"Certificate, Advanced",Tech Academy,2024-03-15`;
    const result = parseCsvText(csv);
    expect(result[0].certificateTitle).toBe('Certificate, Advanced');
  });

  it('handles escaped double quotes inside quoted fields', () => {
    const csv = `name,title,issuer,date
Alice,"He said ""well done""",Tech Academy,2024-03-15`;
    const result = parseCsvText(csv);
    expect(result[0].certificateTitle).toBe('He said "well done"');
  });

  it('handles Windows-style CRLF line endings', () => {
    const csv = 'name,title,issuer,date\r\nAlice,Excellence,Academy,2024-01-01';
    const result = parseCsvText(csv);
    expect(result).toHaveLength(1);
    expect(result[0].recipientName).toBe('Alice');
  });

  it('skips blank lines', () => {
    const csv = `name,title,issuer,date
Alice,Excellence,Academy,2024-01-01

Bob,Completion,Academy,2024-01-02`;
    const result = parseCsvText(csv);
    expect(result).toHaveLength(2);
  });

  it('parses multiple rows', () => {
    const csv = `name,title,issuer,date
Alice,Excellence,Academy,2024-01-01
Bob,Completion,Academy,2024-01-02
Carol,Leadership,Academy,2024-01-03`;
    const result = parseCsvText(csv);
    expect(result).toHaveLength(3);
    expect(result[2].recipientName).toBe('Carol');
  });

  it('fills missing values with empty string', () => {
    const csv = `name,title,issuer,date,email
Alice,Excellence,Academy,2024-01-01`;
    const result = parseCsvText(csv);
    expect(result[0].recipientEmail).toBe('');
  });

  it('normalizes header with spaces and dashes', () => {
    const csv = `recipient-name,certificate-title,issuer-name,issue-date
Alice,Excellence,Academy,2024-01-01`;
    const result = parseCsvText(csv);
    expect(result[0].recipientName).toBe('Alice');
  });
});
