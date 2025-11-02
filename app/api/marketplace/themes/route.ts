import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    const where: any = { active: true };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const themes = await prisma.marketplaceTheme.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { downloadCount: 'desc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        version: true,
        author: true,
        price: true,
        preview: true,
        screenshots: true,
        category: true,
        tags: true,
        downloadCount: true,
        rating: true,
        reviewCount: true,
        featured: true,
      },
    });

    return NextResponse.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 });
  }
}
