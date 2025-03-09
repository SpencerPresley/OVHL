'use client';

import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Laugh, Brain, Heart } from 'lucide-react';
import { ReactionType } from '@/types/forum';

interface ReactionButtonsProps {
  reactions: Array<{
    type: ReactionType;
    userId: string;
  }>;
  currentUserId?: string;
  onReact: (type: ReactionType) => void;
}

export function ReactionButtons({ reactions, currentUserId, onReact }: ReactionButtonsProps) {
  const reactionButtons = [
    { type: ReactionType.LIKE, icon: ThumbsUp },
    { type: ReactionType.DISLIKE, icon: ThumbsDown },
    { type: ReactionType.LAUGH, icon: Laugh },
    { type: ReactionType.THINKING, icon: Brain },
    { type: ReactionType.HEART, icon: Heart },
  ];

  return (
    <div className="flex items-center gap-2">
      {reactionButtons.map(({ type, icon: Icon }) => (
        <Button
          key={type}
          variant="ghost"
          size="sm"
          onClick={() => onReact(type)}
          className={`gap-1 ${
            reactions?.some((r) => r.type === type && r.userId === currentUserId)
              ? 'text-blue-400'
              : ''
          }`}
        >
          <Icon className="w-4 h-4" />
          <span>{reactions?.filter((r) => r.type === type).length || 0}</span>
        </Button>
      ))}
    </div>
  );
}