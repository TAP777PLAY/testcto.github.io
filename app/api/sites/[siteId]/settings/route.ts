import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activityLogger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const auth = await getSession();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { siteId } = await params;

    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        ...(auth.userRole !== 'admin' && { userId: auth.userId }),
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    let settings = await prisma.siteSettings.findUnique({
      where: { siteId },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { siteId },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const auth = await getSession();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { siteId } = await params;

    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        ...(auth.userRole !== 'admin' && { userId: auth.userId }),
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    const settings = await prisma.siteSettings.upsert({
      where: { siteId },
      create: {
        siteId,
        ...body,
      },
      update: body,
    });

    await logActivity({
      userId: auth.userId,
      action: 'update',
      entity: 'settings',
      entityId: siteId,
      details: body,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { error: 'Failed to update site settings' },
      { status: 500 }
    );
  }
}
