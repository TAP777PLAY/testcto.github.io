import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const themesDir = path.join(process.cwd(), 'themes');
    
    let themeDirs: string[] = [];
    try {
      themeDirs = await fs.readdir(themesDir);
    } catch (error) {
      return NextResponse.json({ themes: [] });
    }

    const themes = await Promise.all(
      themeDirs.map(async (dir) => {
        try {
          const manifestPath = path.join(themesDir, dir, 'theme.json');
          const manifestContent = await fs.readFile(manifestPath, 'utf-8');
          return JSON.parse(manifestContent);
        } catch (error) {
          return null;
        }
      })
    );

    const validThemes = themes.filter((theme) => theme !== null);

    return NextResponse.json({ themes: validThemes });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}
