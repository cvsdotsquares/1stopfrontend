import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the real IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  let ip = request.ip || '127.0.0.1';
  
  // Check for forwarded IPs (most reliable first)
  if (cfConnectingIP) {
    ip = cfConnectingIP;
  } else if (realIP) {
    ip = realIP;
  } else if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  }
  
  // Clean up IPv6 localhost
  if (ip === '::1') {
    ip = '127.0.0.1';
  }
  
  return NextResponse.json({ ip });
}