import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { cloudinary } from '@/lib/cloudinary';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No authentication token found' }, { status: 401 });
    }

    try {
      verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { message: 'Invalid or expired authentication token' },
        { status: 401 }
      );
    }

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
    } catch (cloudinaryError: any) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return NextResponse.json(
        { message: cloudinaryError.message || 'Failed to upload to Cloudinary' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Failed to process upload request' }, { status: 500 });
  }
}
