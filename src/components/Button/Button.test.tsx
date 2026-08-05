import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders its accessible name and uses a safe default type', () => {
    render(<Button>Save changes</Button>)

    expect(
      screen.getByRole('button', { name: 'Save changes' }),
    ).toHaveAttribute('type', 'button')
  })

  it('forwards button events', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Continue</Button>)

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('prevents interaction while loading', () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Publish
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Publish' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')

    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies the requested variant, size, and custom class', () => {
    render(
      <Button className="custom-class" size="large" variant="secondary">
        Review
      </Button>,
    )

    expect(screen.getByRole('button', { name: 'Review' })).toHaveClass(
      'lumina-button--secondary',
      'lumina-button--large',
      'custom-class',
    )
  })
})
