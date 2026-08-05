import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta = {
  title: 'Lumina/Components/Button',
  component: Button,
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'medium',
  },
  argTypes: {
    onClick: { action: 'clicked' },
  },
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
}

export const Loading: Story = {
  args: { children: 'Saving', loading: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </div>
  ),
}
