import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidUrl,
  isValidImageFile,
  isValidSignatureFile,
} from './validators';

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
    expect(isValidEmail('user123@sub.domain.org')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user @example.com')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('accepts valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
    expect(isValidUrl('https://api.example.com/webhooks/certify')).toBe(true);
  });

  it('rejects invalid URLs', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
  });
});

describe('isValidImageFile', () => {
  const makeFile = (type: string, sizeBytes: number) =>
    new File(['x'.repeat(sizeBytes)], 'test', { type });

  it('accepts allowed image types under 2MB', () => {
    expect(isValidImageFile(makeFile('image/jpeg', 1024))).toBe(true);
    expect(isValidImageFile(makeFile('image/png', 1024))).toBe(true);
    expect(isValidImageFile(makeFile('image/svg+xml', 1024))).toBe(true);
    expect(isValidImageFile(makeFile('image/webp', 1024))).toBe(true);
  });

  it('rejects files over 2MB', () => {
    expect(isValidImageFile(makeFile('image/png', 2 * 1024 * 1024 + 1))).toBe(
      false
    );
  });

  it('rejects disallowed file types', () => {
    expect(isValidImageFile(makeFile('image/gif', 1024))).toBe(false);
    expect(isValidImageFile(makeFile('application/pdf', 1024))).toBe(false);
    expect(isValidImageFile(makeFile('text/plain', 1024))).toBe(false);
  });
});

describe('isValidSignatureFile', () => {
  const makeFile = (type: string, sizeBytes: number) =>
    new File(['x'.repeat(sizeBytes)], 'sig', { type });

  it('accepts PNG under 1MB', () => {
    expect(isValidSignatureFile(makeFile('image/png', 512 * 1024))).toBe(true);
  });

  it('rejects files over 1MB', () => {
    expect(isValidSignatureFile(makeFile('image/png', 1024 * 1024 + 1))).toBe(
      false
    );
  });

  it('rejects non-PNG types', () => {
    expect(isValidSignatureFile(makeFile('image/jpeg', 1024))).toBe(false);
    expect(isValidSignatureFile(makeFile('image/webp', 1024))).toBe(false);
  });
});
