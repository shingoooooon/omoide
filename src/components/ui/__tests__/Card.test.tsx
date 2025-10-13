import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardContent } from '../Card'

describe('Card Components', () => {
  it('renders Card correctly', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
        <CardContent>Test Content</CardContent>
      </Card>
    )
    
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies variant styles correctly', () => {
    render(<Card variant="elevated" data-testid="elevated-card">Content</Card>)
    const card = screen.getByTestId('elevated-card')
    expect(card).toHaveClass('shadow-medium')
  })
})