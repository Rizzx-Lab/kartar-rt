import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

// Whitelist of allowed paths to prevent abuse
const ALLOWED_PATHS = [
  '/',
  '/pengumuman',
  '/kegiatan',
  '/galeri',
  '/tentang-kami',
  '/kontak',
];

// Whitelist of allowed tags
const ALLOWED_TAGS = [
  'home',
  'announcements',
  'programs',
  'galleries',
  'about',
  'contact',
  'settings',
];

// POST /api/revalidate
// Called server-to-server from Laravel backend (never from browser/client JS)
// Secret lives only in server-side env vars, never sent to browsers
export async function POST(request: Request) {
  try {
    // Accept secret via x-revalidate-secret header OR Authorization: Bearer header
    const secretHeader = request.headers.get('x-revalidate-secret');
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;
    const secret = secretHeader || bearerToken;

    // Validate secret token — process.env.REVALIDATE_SECRET is server-only (no NEXT_PUBLIC_ prefix)
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Invalid secret token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paths = [], tags = [] } = body;

    // Revalidate allowed paths
    const validPaths = Array.isArray(paths)
      ? paths.filter((p: string) => ALLOWED_PATHS.includes(p))
      : [];
    for (const path of validPaths) {
      revalidatePath(path);
    }

    // Revalidate allowed tags
    const validTags = Array.isArray(tags)
      ? tags.filter((t: string) => ALLOWED_TAGS.includes(t))
      : [];
    for (const tag of validTags) {
      revalidateTag(tag);
    }

    return NextResponse.json({
      success: true,
      message: 'Cache revalidated',
      revalidated: {
        paths: validPaths,
        tags: validTags,
      },
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}
