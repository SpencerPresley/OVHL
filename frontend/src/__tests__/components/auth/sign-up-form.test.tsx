import { render, screen, waitFor } from '@/utils/test-utils';
import { SignUpForm } from '@/components/auth/sign-up-form';
import userEvent from '@testing-library/user-event';

// Mock fetch
global.fetch = jest.fn();

// Mock next/navigation
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: mockPush,
      refresh: mockRefresh,
    };
  },
}));

describe('SignUpForm', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockPush.mockClear();
    mockRefresh.mockClear();
  });

  it('renders sign up form', () => {
    render(<SignUpForm />);

    expect(screen.getByText('Create Account', { selector: '.text-2xl' })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<SignUpForm />);

    const createAccountButton = screen.getByRole('button', { name: /create account/i });
    await userEvent.click(createAccountButton);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(await screen.findByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('handles successful sign up', async () => {
    // Mock successful fetch response
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    const createAccountButton = screen.getByRole('button', { name: /create account/i });
    await user.click(createAccountButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        }),
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/sign-in?registered=true');
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('handles sign up error', async () => {
    // Mock failed fetch response
    const errorMessage = 'Email already exists';
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: errorMessage }),
      })
    );

    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    const createAccountButton = screen.getByRole('button', { name: /create account/i });
    await user.click(createAccountButton);

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});
