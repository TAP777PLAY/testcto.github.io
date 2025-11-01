import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }
  
  const userRole = (session.user as any).role;
  
  if (userRole !== 'admin') {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      ),
    };
  }
  
  return {
    authorized: true,
    session,
    userId: (session.user as any).id,
  };
}

export async function getSession() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }
  
  return {
    authorized: true,
    session,
    userId: (session.user as any).id,
    userRole: (session.user as any).role,
  };
}
