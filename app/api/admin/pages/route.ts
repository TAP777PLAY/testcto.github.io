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
    const search = searchParams.get('search') || '';
    const published = searchParams.get('published');
    const siteId = searchParams.get('siteId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (published !== null && published !== undefined && published !== '') {
      where.published = published === 'true';
    }
    
    if (siteId) {
      where.siteId = siteId;
    }

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        include: {
          site: {
            select: {
              name: true,
              slug: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              blocks: true,
              pageViews: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.page.count({ where }),
    ]);

    return NextResponse.json({
      pages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}
