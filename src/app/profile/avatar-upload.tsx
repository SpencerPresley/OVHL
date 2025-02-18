'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Camera, Pencil, X } from 'lucide-react';
import { useRef } from 'react';
import { CldImage } from 'next-cloudinary';

interface AvatarUploadProps {
  imageUrl: string | null;
  initials: string;
  name: string;
  username: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
}

export function AvatarUpload({ 
  imageUrl, 
  initials, 
  name, 
  username, 
  onUpload,
  onRemove 
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
      // Reset the input value so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative group">
        <Avatar className="h-24 w-24 ring-2 ring-white/20">
          {imageUrl ? (
            <CldImage
              src={imageUrl}
              width={96}
              height={96}
              crop="fill"
              gravity="face"
              alt={`${name}'s avatar`}
              className="rounded-full"
            />
          ) : (
            <AvatarFallback className="text-2xl bg-gray-800">{initials}</AvatarFallback>
          )}
        </Avatar>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 p-0 hover:bg-blue-700"
              aria-label="Change avatar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => inputRef.current?.click()}>
              <Camera className="mr-2 h-4 w-4" />
              Upload photo
            </DropdownMenuItem>
            {imageUrl && (
              <DropdownMenuItem onClick={onRemove} className="text-red-600">
                <X className="mr-2 h-4 w-4" />
                Remove photo
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="sr-only">
          <Label htmlFor="avatar-upload">Upload avatar</Label>
          <input
            id="avatar-upload"
            type="file"
            ref={inputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            aria-label="Upload avatar image"
          />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-medium">{name || 'Add your name'}</h3>
        <p className="text-gray-300">
          {username ? `@${username}` : 'Set a username'}
        </p>
      </div>
    </div>
  );
} 
