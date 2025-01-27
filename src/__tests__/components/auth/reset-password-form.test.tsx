import { render, screen, waitFor } from '@/utils/test-utils'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import userEvent from '@testing-library/user-event'
import { useSearchParams } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

// Mock fetch
global.fetch = jest.fn()

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
    // Mock token in URL
    ;(useSearchParams as jest.Mock).mockImplementation(() => ({
      get: () => 'valid-token',
    }))
  })

  it('renders reset password form', () => {
    render(<ResetPasswordForm />)
    
    expect(screen.getByText('Reset Password', { selector: '.text-2xl' })).toBeInTheDocument()
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })

  it('shows validation error for short password', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm />)

    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    // Type short password
    await user.type(passwordInput, 'short')
    await user.type(confirmInput, 'short')
    await user.click(submitButton)

    // Wait for validation message
    expect(await screen.findByText('Password must be at least 8 characters.')).toBeInTheDocument()
  })

  it('shows validation error for mismatched passwords', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm />)

    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    // Type different passwords
    await user.type(passwordInput, 'password123')
    await user.type(confirmInput, 'password456')
    await user.click(submitButton)

    // Wait for validation message
    expect(await screen.findByText("Passwords don't match")).toBeInTheDocument()
  })

  it('shows error when token is missing', async () => {
    // Mock missing token
    ;(useSearchParams as jest.Mock).mockImplementation(() => ({
      get: () => null,
    }))

    const user = userEvent.setup()
    render(<ResetPasswordForm />)

    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    await user.type(passwordInput, 'password123')
    await user.type(confirmInput, 'password123')
    await user.click(submitButton)

    expect(await screen.findByText('Reset token is missing')).toBeInTheDocument()
  })

  it('handles successful password reset', async () => {
    const user = userEvent.setup()
    ;(fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Password reset successful' }),
      })
    )

    render(<ResetPasswordForm />)

    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    await user.type(passwordInput, 'newpassword123')
    await user.type(confirmInput, 'newpassword123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'valid-token',
          password: 'newpassword123',
        }),
      })
    })
  })

  it('handles password reset error', async () => {
    const user = userEvent.setup()
    ;(fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid or expired token' }),
      })
    )

    render(<ResetPasswordForm />)

    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    await user.type(passwordInput, 'newpassword123')
    await user.type(confirmInput, 'newpassword123')
    await user.click(submitButton)

    expect(await screen.findByText('Invalid or expired token')).toBeInTheDocument()
  })
}) 