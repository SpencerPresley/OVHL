import { render, screen, waitFor } from '@/utils/test-utils'
import { SignInForm } from './sign-in-form'
import userEvent from '@testing-library/user-event'

// Mock fetch
global.fetch = jest.fn()

describe('SignInForm', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('renders sign in form', () => {
    render(<SignInForm />)
    
    expect(screen.getByText('Sign In', { selector: '.text-2xl' })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(<SignInForm />)
    
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await userEvent.click(signInButton)

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument()
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
  })

  it('handles successful sign in', async () => {
    // Mock successful fetch response
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    )

    const user = userEvent.setup()
    render(<SignInForm />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(signInButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/sign-in', expect.any(Object))
    })
  })
}) 