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
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { signIn } from 'next-auth/react'; // Use client-side imports for client components

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

type SignInFormProps = {
  callbackUrl?: string;
  error?: string;
};

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
export function SignInForm({ callbackUrl, error: initialError }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(initialError || '');
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
   * - Signs in with Auth.js
   * - Cookie expiration varies based on rememberMe
   * - Redirects to dashboard
   */
  async function onSubmit(values: SignInValues) {
    setIsLoading(true);
    setError('');

    try {
      // Use Auth.js signIn function
      const formData = new FormData();
      formData.append('email', values.email);
      formData.append('password', values.password);
      
      await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: true,
        redirectTo: callbackUrl || '/',
      });
      
      // If redirect is false, we'd handle the redirect manually
      // But Auth.js will handle the redirect if redirect: true
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setIsLoading(false);
    }
  }

  // If there's an initial error (e.g., from the URL), display it
  React.useEffect(() => {
    if (initialError) {
      let errorMessage = 'An error occurred during sign in';
      
      // Map error codes to user-friendly messages
      if (initialError === 'CredentialsSignin') {
        errorMessage = 'Invalid email or password';
      }
      
      setError(errorMessage);
    }
  }, [initialError]);

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
