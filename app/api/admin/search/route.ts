import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';

    if (!query || query.length < 2) {
      return NextResponse.json({
        sites: [],
        pages: [],
        users: [],
      });
    }

    const searchPromises: any = {};

    if (type === 'all' || type === 'sites') {
      searchPromises.sites = prisma.site.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { slug: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        take: 10,
      });
    }

    if (type === 'all' || type === 'pages') {
      searchPromises.pages = prisma.page.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { slug: { contains: query, mode: 'insensitive' } },
            { metaTitle: { contains: query, mode: 'insensitive' } },
            { metaDescription: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          site: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        take: 10,
      });
    }

    if (type === 'all' || type === 'users') {
      searchPromises.users = prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          createdAt: true,
        },
        take: 10,
      });
    }

    const results = await Promise.all(
      Object.entries(searchPromises).map(async ([key, promise]) => [key, await promise])
    );

    return NextResponse.json(Object.fromEntries(results));
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
