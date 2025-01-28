import { render, screen, waitFor } from '@testing-library/react'
import { SeasonSignupCard } from '@/components/season-signup-card'
import userEvent from '@testing-library/user-event'
import React, { ReactElement } from 'react'

// Mock Select component
jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => {
    // Extract options from SelectItem components
    const options = React.Children.toArray(children)
      .find((child: ReactElement) => child.type?.name === 'SelectContent')
      ?.props?.children || [];
    
    return (
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        data-testid="position-select"
        aria-label="Position"
        title="Position"
      >
        {React.Children.toArray(options).map((option: ReactElement) => (
          <option key={option.props.value} value={option.props.value}>
            {option.props.children}
          </option>
        ))}
      </select>
    );
  },
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => children,
  SelectItem: ({ value, children }: { value: string, children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}));

// Mock fetch
global.fetch = jest.fn()

// Mock window.location.reload
const mockReload = jest.fn()
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

describe('SeasonSignupCard', () => {
  const mockSeason = {
    id: 'season1',
    seasonId: '2024',
  }

  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
    mockReload.mockClear()
  })

  describe('Unauthenticated State', () => {
    it('shows sign in prompt when not authenticated', () => {
      render(<SeasonSignupCard season={mockSeason} isAuthenticated={false} />)
      
      expect(screen.getByText(/please sign in to register for the season/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/sign-in')
    })
  })

  describe('Authenticated State', () => {
    it('renders signup form when authenticated', () => {
      render(<SeasonSignupCard season={mockSeason} isAuthenticated={true} />)
      
      expect(screen.getByText(`Season ${mockSeason.seasonId}`)).toBeInTheDocument()
      expect(screen.getByTestId('position-select')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign up for season/i })).toBeInTheDocument()
    })

    it('shows validation error when trying to submit without position', async () => {
      const user = userEvent.setup()
      render(<SeasonSignupCard season={mockSeason} isAuthenticated={true} />)
      
      const submitButton = screen.getByRole('button', { name: /sign up for season/i })
      await user.click(submitButton)

      expect(await screen.findByText(/position is required/i)).toBeInTheDocument()
    })

    it('allows position selection', async () => {
      const user = userEvent.setup()
      render(<SeasonSignupCard season={mockSeason} isAuthenticated={true} />)
      
      // Select a position
      const select = screen.getByTestId('position-select')
      await user.selectOptions(select, 'Center')

      expect(select).toHaveValue('Center')
    })

    it('handles successful signup', async () => {
      // Mock successful fetch response
      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      )

      const user = userEvent.setup()
      render(<SeasonSignupCard season={mockSeason} isAuthenticated={true} />)
      
      // Select position
      const select = screen.getByTestId('position-select')
      await user.selectOptions(select, 'Center')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign up for season/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/seasons/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            seasonId: mockSeason.id,
            position: 'Center',
          }),
        })
      })

      expect(mockReload).toHaveBeenCalled()
    })

    it('handles signup error', async () => {
      // Mock failed fetch response
      const errorMessage = 'Already signed up for this season'
      ;(fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: errorMessage }),
        })
      )

      const user = userEvent.setup()
      render(<SeasonSignupCard season={mockSeason} isAuthenticated={true} />)
      
      // Select position
      const select = screen.getByTestId('position-select')
      await user.selectOptions(select, 'Center')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign up for season/i })
      await user.click(submitButton)

      expect(await screen.findByText(errorMessage)).toBeInTheDocument()
    })

    it('disables submit button while loading', async () => {
      // Mock slow fetch response
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const user = userEvent.setup()
      render(<SeasonSignupCard season={mockSeason} isAuthenticated={true} />)
      
      // Select position
      const select = screen.getByTestId('position-select')
      await user.selectOptions(select, 'Center')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign up for season/i })
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent(/signing up\.\.\./i)
    })
  })

  it('returns null when no season provided', () => {
    const { container } = render(<SeasonSignupCard season={null as any} isAuthenticated={true} />)
    expect(container.querySelector('.card')).not.toBeInTheDocument()
  })
}); 