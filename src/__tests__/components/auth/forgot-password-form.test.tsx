import { render, screen, waitFor } from '@/utils/test-utils'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import userEvent from '@testing-library/user-event'

// Mock fetch
global.fetch = jest.fn()

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('renders forgot password form', () => {
    render(<ForgotPasswordForm />)
    
    expect(screen.getByText('Reset Password', { selector: '.text-2xl' })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to sign in/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    // First submit with empty field to trigger validation
    await user.click(submitButton)
    
    // Then type invalid email and submit again
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    // Wait for the input to be marked as invalid
    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
    })

    // Now look for the validation message
    const formMessage = await screen.findByText('Please enter a valid email address.')
    expect(formMessage).toBeInTheDocument()
  })

  it('handles successful password reset request', async () => {
    const user = userEvent.setup()
    ;(fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' }),
      })
    )

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      })
    })

    expect(await screen.findByText(/if an account exists with this email, you will receive password reset instructions/i)).toBeInTheDocument()
  })

  it('handles password reset request error', async () => {
    const user = userEvent.setup()
    ;(fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to send reset email' }),
      })
    )

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    expect(await screen.findByText(/failed to send reset email/i)).toBeInTheDocument()
  })
})
