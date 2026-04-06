import dns from 'dns';
import { promisify } from 'util';
import net from 'net';

const lookup = promisify(dns.lookup);

const BLOCKED_IP_RANGES = [
  { start: '0.0.0.0', end: '0.255.255.255' },
  { start: '10.0.0.0', end: '10.255.255.255' },
  { start: '127.0.0.0', end: '127.255.255.255' },
  { start: '169.254.0.0', end: '169.254.255.255' },
  { start: '172.16.0.0', end: '172.31.255.255' },
  { start: '192.0.0.0', end: '192.0.0.255' },
  { start: '192.0.2.0', end: '192.0.2.255' },
  { start: '192.168.0.0', end: '192.168.255.255' },
  { start: '198.18.0.0', end: '198.19.255.255' },
  { start: '198.51.100.0', end: '198.51.100.255' },
  { start: '203.0.113.0', end: '203.0.113.255' },
  { start: '224.0.0.0', end: '239.255.255.255' },
  { start: '240.0.0.0', end: '255.255.255.255' },
  { start: '::1', end: '::1' },
  { start: 'fc00::', end: 'fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff' },
  { start: 'fe80::', end: 'febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff' },
  { start: 'ff00::', end: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff' },
];

const ipToNumber = (ip: string): bigint => {
  if (net.isIPv6(ip)) {
    const parts = ip.split(':');
    let result = BigInt(0);
    for (const part of parts) {
      result = result * BigInt(65536) + BigInt(parseInt(part || '0', 16));
    }
    return result;
  }

  const parts = ip.split('.').map(Number);
  return (
    BigInt(parts[0]) * BigInt(16777216) +
    BigInt(parts[1]) * BigInt(65536) +
    BigInt(parts[2]) * BigInt(256) +
    BigInt(parts[3])
  );
};

const isIpInRange = (ip: string, start: string, end: string): boolean => {
  try {
    const ipNum = ipToNumber(ip);
    const startNum = ipToNumber(start);
    const endNum = ipToNumber(end);
    return ipNum >= startNum && ipNum <= endNum;
  } catch {
    return false;
  }
};

const isBlockedIp = (ip: string): boolean => {
  return BLOCKED_IP_RANGES.some((range) => isIpInRange(ip, range.start, range.end));
};

export const isSafeUrl = async (urlString: string): Promise<{ safe: boolean; reason?: string }> => {
  try {
    const url = new URL(urlString);

    if (url.protocol !== 'https:') {
      return { safe: false, reason: 'Only HTTPS URLs are allowed' };
    }

    const hostname = url.hostname.toLowerCase();

    if (hostname === 'localhost' || hostname === 'localtest.me') {
      return { safe: false, reason: 'Localhost URLs are not allowed' };
    }

    if (hostname.endsWith('.local') || hostname.endsWith('.localhost')) {
      return { safe: false, reason: 'Local domain URLs are not allowed' };
    }

    if (net.isIP(hostname)) {
      if (isBlockedIp(hostname)) {
        return { safe: false, reason: 'IP address is in a blocked range' };
      }
      return { safe: true };
    }

    try {
      const addresses = await lookup(hostname, { all: true });

      for (const addr of addresses) {
        if (isBlockedIp(addr.address)) {
          return {
            safe: false,
            reason: 'Domain resolves to a blocked IP address',
          };
        }
      }
    } catch {
      return { safe: false, reason: 'Failed to resolve hostname' };
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: 'Invalid URL format' };
  }
};

export const validateWebhookUrl = async (
  url: string
): Promise<{ valid: boolean; error?: string }> => {
  const result = await isSafeUrl(url);

  if (!result.safe) {
    return {
      valid: false,
      error: result.reason || 'URL is not allowed for security reasons',
    };
  }

  return { valid: true };
};
