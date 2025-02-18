'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  player: {
    id: string;
    gamertags: {
      gamertag: string;
    }[];
  } | null;
}

interface UserSearchProps {
  onSelect: (userId: string) => void;
  teamId: string;
}

export function UserSearch({ onSelect, teamId }: UserSearchProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Load initial list of players when component mounts or teamId changes
  useEffect(() => {
    if (teamId) {
      searchUsers('');
    }
  }, [teamId]);

  const searchUsers = async (query: string) => {
    if (!teamId) {
      console.error('TeamId is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users/search?teamId=${teamId}&q=${encodeURIComponent(query || '')}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to search users');
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (user: User) => {
    setSelectedUser(user);
    onSelect(user.id);
    setOpen(false);
  };

  const getDisplayName = (user: User) => {
    return (
      user.name ||
      user.username ||
      user.player?.gamertags[0]?.gamertag ||
      user.email
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-gray-800/50 border-white/10 text-white"
        >
          {selectedUser ? getDisplayName(selectedUser) : 'Search users...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search users..."
            onValueChange={searchUsers}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>{loading ? 'Searching...' : 'No users found.'}</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={() => handleSelect(user)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedUser?.id === user.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{getDisplayName(user)}</span>
                    <span className="text-sm text-gray-500">{user.email}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 
