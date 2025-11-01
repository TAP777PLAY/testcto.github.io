import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json(
        { error: 'siteId is required' },
        { status: 400 }
      );
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { userId: true },
    });

    if (!site || site.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const themePath = path.join(process.cwd(), 'themes', params.slug, 'theme.json');
    
    let themeManifest;
    try {
      const manifestContent = await fs.readFile(themePath, 'utf-8');
      themeManifest = JSON.parse(manifestContent);
    } catch (error) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    const existingTheme = await prisma.theme.findUnique({
      where: { siteId },
    });

    let theme;
    if (existingTheme) {
      theme = await prisma.theme.update({
        where: { siteId },
        data: {
          name: themeManifest.name,
          primaryColor: themeManifest.colors.primary,
          secondaryColor: themeManifest.colors.secondary,
          backgroundColor: themeManifest.colors.background,
          textColor: themeManifest.colors.foreground,
          fontFamily: themeManifest.typography.fontFamily.body,
        },
      });
    } else {
      theme = await prisma.theme.create({
        data: {
          name: themeManifest.name,
          primaryColor: themeManifest.colors.primary,
          secondaryColor: themeManifest.colors.secondary,
          backgroundColor: themeManifest.colors.background,
          textColor: themeManifest.colors.foreground,
          fontFamily: themeManifest.typography.fontFamily.body,
          siteId,
        },
      });
    }

    return NextResponse.json({ theme, manifest: themeManifest });
  } catch (error) {
    console.error('Error activating theme:', error);
    return NextResponse.json(
      { error: 'Failed to activate theme' },
      { status: 500 }
    );
  }
}
