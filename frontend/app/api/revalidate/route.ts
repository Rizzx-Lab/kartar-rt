import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

// POST /api/revalidate
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path, tag } = body;

    // Revalidate by path if provided
    if (path) {
      revalidatePath(path);
    }

    // Revalidate by tag if provided
    if (tag) {
      revalidateTag(tag);
    }

    // Revalidate specific paths for about page
    revalidatePath('/tentang-kami');
    revalidateTag('about');

    return NextResponse.json({
      success: true,
      message: 'Cache revalidated',
      revalidated: { path: '/tentang-kami', tag: 'about' }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}