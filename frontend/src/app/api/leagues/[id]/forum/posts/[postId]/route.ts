import { NextResponse } from 'next/server';
import { ForumService } from '@/lib/services/forum-service';

export async function GET(
  request: Request,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    const resolvedParams = await params;
    const { postId } = resolvedParams;
    const post = await ForumService.getPost(postId);

    if (!post) {
      return NextResponse.json({ error: 'Post not found or not published' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
