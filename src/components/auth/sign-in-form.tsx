'use client';

import * as React from 'react';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { signIn } from 'next-auth/react';

/**
 * Zod schema for sign-in form validation
 * - email: Must be a valid email address
 * - password: Required, no minimum length for sign-in
 * - rememberMe: Boolean flag for extended session duration
 */
const signInSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(1, {
    message: 'Password is required.',
  }),
  rememberMe: z.boolean().default(false),
});

type SignInValues = z.infer<typeof signInSchema>;

/**
 * SignInForm Component
 *
 * A form component that handles user authentication with email/password.
 * Features:
 * - Email and password validation
 * - Remember me functionality for extended sessions
 * - Error handling and loading states
 * - Links to forgot password and sign up
 */
export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Initialize form with zod validation
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  /**
   * Handle form submission
   * @param values - Form values containing email, password, and rememberMe
   *
   * On successful sign-in:
   * - Signs in with NextAuth
   * - Cookie expiration varies based on rememberMe
   * - Redirects to dashboard
   */
  async function onSubmit(values: SignInValues) {
    setIsLoading(true);
    setError('');

    try {
      // Use NextAuth's signIn function instead of custom API
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl: '/',
      });

      if (!result?.ok) {
        throw new Error(result?.error || 'Failed to sign in');
      }

      // Wait for session to be set up
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect to home
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-[400px] card-gradient">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your email and password to sign in</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remember Me Checkbox */}
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Remember me</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Forgot Password Link */}
            <div className="text-sm text-right">
              <Link href="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Form>
      </CardContent>

      {/* Sign Up Link */}
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-gray-400 text-center">Don&#39;t have an account?</div>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/sign-up">Create an account</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
