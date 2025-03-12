import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Authenticate with NextAuth
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    // Convert File to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(fileBase64, {
        folder: 'avatars',
        transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
      });

      return NextResponse.json({ url: result.secure_url });
    } catch (cloudinaryError: unknown) {
      const errorMessage =
        cloudinaryError instanceof Error
          ? cloudinaryError.message
          : 'Failed to upload to Cloudinary';
      console.error('Cloudinary upload error:', errorMessage);
      return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Failed to process upload request' }, { status: 500 });
  }
}
