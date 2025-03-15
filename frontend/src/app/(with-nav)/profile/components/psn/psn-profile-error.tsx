'use client';

import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2 } from 'lucide-react';

interface PSNProfileErrorProps {
  error: string;
  needsVerification?: boolean;
}

export function PSNProfileError({ error, needsVerification = false }: PSNProfileErrorProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          PlayStation Network Profile
        </CardTitle>
        <CardDescription className="text-gray-300">
          {error || 'No PSN profile found. Connect your PSN account in the Integrations tab.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {needsVerification && (
          <div className="p-4 border border-blue-600 bg-blue-950/30 rounded-md">
            <p className="flex items-center">
              <span className="mr-2 text-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </span>
              <span>
                To display your PSN profile data, you need to connect your PlayStation Network
                account.
              </span>
            </p>
            <div className="mt-4">
              <button
                onClick={() => {
                  const element = document.querySelector('button[value="integrations"]');
                  if (element) {
                    (element as HTMLButtonElement).click();
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors"
              >
                Go to Integrations Tab
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </>
  );
}
