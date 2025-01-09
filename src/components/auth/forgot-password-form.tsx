"use client"

import * as React from "react"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

/**
 * @typedef {Object} ForgotPasswordValues
 * @property {string} email - The user's email address for password reset
 */

/**
 * Zod schema for forgot password form validation
 * @type {z.ZodObject<{email: z.ZodString}>}
 */
const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

/**
 * ForgotPasswordForm Component
 * 
 * Handles password reset requests by sending a reset link to the user's email.
 * Uses Resend for email delivery and includes security measures to prevent
 * email enumeration.
 * 
 * @component
 * @example
 * ```tsx
 * <ForgotPasswordForm />
 * ```
 * 
 * Features:
 * - Email validation
 * - Loading states
 * - Error handling with toast notifications
 * - Success feedback without email enumeration
 * - Back to sign-in link
 */
export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  /**
   * Initialize form with Zod validation
   * @type {UseFormReturn<ForgotPasswordValues>}
   */
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  /**
   * Handles the form submission for password reset requests
   * 
   * @async
   * @param {ForgotPasswordValues} values - Form values containing email
   * @throws {Error} When the API request fails
   * 
   * On success:
   * - Generates a reset token
   * - Sends reset email via Resend
   * - Shows success message without revealing if email exists
   * - Stores token in database with expiration
   */
  async function onSubmit(values: ForgotPasswordValues) {
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send reset email")
      }

      setSuccess(true)
      toast.success(data?.message || "Reset instructions sent if email exists")
    } catch (error) {
      console.error(error)
      setError(error instanceof Error ? error.message : "An error occurred")
      toast.error("Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[400px] card-gradient">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter your email to reset your password</CardDescription>
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
            {/* Success Alert */}
            {success && (
              <Alert>
                <AlertDescription>
                  If an account exists with this email, you will receive password reset instructions.
                </AlertDescription>
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
            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading || success}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </Form>
      </CardContent>
      {/* Back to Sign In */}
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-gray-400 text-center">
          Remember your password?
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/sign-in">Back to Sign In</Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 