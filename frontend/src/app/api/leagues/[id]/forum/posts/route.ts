import { NextResponse } from 'next/server';
import { ForumService } from '@/lib/services/forum-service';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const posts = await ForumService.getLeaguePosts(id);
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    return NextResponse.json({ error: 'Failed to fetch forum posts' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { title, content, authorId } = await request.json();

    const post = await ForumService.createPost({
      title,
      content,
      authorId,
      leagueId: id,
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error creating forum post:', error);
    return NextResponse.json({ error: 'Failed to create forum post' }, { status: 500 });
  }
}
