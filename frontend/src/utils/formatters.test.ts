import { describe, it, expect } from 'vitest';
import { formatDate, formatDateShort, truncateText } from './formatters';

describe('formatDate', () => {
  it('formats a date string to long format', () => {
    const result = formatDate('2024-03-15');
    expect(result).toBe('March 15, 2024');
  });

  it('accepts custom Intl options', () => {
    const result = formatDate('2024-03-15', { month: 'short' });
    expect(result).toBe('Mar 15, 2024');
  });
});

describe('formatDateShort', () => {
  it('formats a date string to short format', () => {
    const result = formatDateShort('2024-03-15');
    expect(result).toBe('Mar 15, 2024');
  });
});

describe('truncateText', () => {
  it('returns original text when within limit', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
    expect(truncateText('Hello', 5)).toBe('Hello');
  });

  it('truncates and appends ellipsis when over limit', () => {
    expect(truncateText('Hello World', 5)).toBe('Hello...');
    expect(truncateText('Certificate of Excellence', 11)).toBe('Certificate...');
  });
});
