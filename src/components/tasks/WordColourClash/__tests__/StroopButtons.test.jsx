import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StroopButtons } from '../StroopButtons.jsx'

afterEach(cleanup)

describe('StroopButtons', () => {
  it('renders one button per ink colour, with its keyboard shortcut', () => {
    render(<StroopButtons onSelect={() => {}} enabled />)

    const group = screen.getByRole('group', { name: 'Colour response buttons' })
    const buttons = group.querySelectorAll('button')
    expect([...buttons].map((b) => b.textContent)).toEqual(['Red', 'Blue', 'Green', 'Yellow'])
    expect([...buttons].map((b) => b.getAttribute('aria-keyshortcuts'))).toEqual(['1', '2', '3', '4'])
  })

  it('reports the colour that was clicked', async () => {
    const onSelect = vi.fn()
    render(<StroopButtons onSelect={onSelect} enabled />)

    await userEvent.click(screen.getByRole('button', { name: 'Green' }))

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('green')
  })

  it('ignores clicks while responses are closed', async () => {
    const onSelect = vi.fn()
    render(<StroopButtons onSelect={onSelect} enabled={false} />)

    const red = screen.getByRole('button', { name: 'Red' })
    expect(red.disabled).toBe(true)
    await userEvent.click(red)

    expect(onSelect).not.toHaveBeenCalled()
  })
})
