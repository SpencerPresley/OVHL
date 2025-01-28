"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface SeasonSignupCardProps {
  season: {
    id: string;
    seasonId: string;
  };
  isAuthenticated: boolean;
}

type Position = "Center" | "Left Wing" | "Right Wing" | "Left Defense" | "Right Defense" | "Goalie";

const positions: Position[] = [
  "Center",
  "Left Wing",
  "Right Wing",
  "Left Defense",
  "Right Defense",
  "Goalie",
];

export function SeasonSignupCard({ season, isAuthenticated }: SeasonSignupCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<Position | "">("");

  const handleSignup = async () => {
    // Validate first
    if (!position) {
      setError("Position is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/seasons/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seasonId: season.id,
          position,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up for season");
      }

      // Reload the page to reflect changes
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up for season");
    } finally {
      setLoading(false);
    }
  };

  if (!season) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Season {season.seasonId}</CardTitle>
        <CardDescription>Sign up for the current season</CardDescription>
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select
                value={position}
                onValueChange={(value: string) => setPosition(value as Position)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              onClick={handleSignup}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Signing up..." : "Sign up for Season"}
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4">Please sign in to register for the season</p>
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 