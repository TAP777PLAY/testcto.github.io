import { NextResponse } from 'next/server';

const CURRENT_VERSION = '0.1.0';
const LATEST_VERSION_URL = 'https://api.github.com/repos/sitebuilder/sitebuilder/releases/latest';

export async function GET() {
  try {
    const currentVersion = CURRENT_VERSION;
    
    // Fetch latest version from GitHub
    let latestVersion = CURRENT_VERSION;
    let releaseNotes = '';
    let downloadUrl = '';

    try {
      const response = await fetch(LATEST_VERSION_URL, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (response.ok) {
        const data = await response.json();
        latestVersion = data.tag_name.replace('v', '');
        releaseNotes = data.body || '';
        downloadUrl = data.html_url || '';
      }
    } catch (error) {
      console.error('Failed to fetch latest version:', error);
    }

    const updateAvailable = compareVersions(latestVersion, currentVersion) > 0;

    return NextResponse.json({
      currentVersion,
      latestVersion,
      updateAvailable,
      releaseNotes,
      downloadUrl,
      checkDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Version check error:', error);
    return NextResponse.json(
      { error: 'Failed to check version' },
      { status: 500 }
    );
  }
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}
