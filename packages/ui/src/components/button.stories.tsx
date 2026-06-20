import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'yellow', 'outline', 'secondary', 'ghost', 'link', 'destructive'],
    },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = { args: { children: 'Hanapin' } }

export const Yellow: Story = { args: { variant: 'yellow', children: 'Aprub!' } }

export const Outline: Story = { args: { variant: 'outline', children: 'Log In' } }

export const Secondary: Story = { args: { variant: 'secondary', children: 'Secondary' } }

export const Ghost: Story = { args: { variant: 'ghost', children: 'Sign out' } }

export const Destructive: Story = { args: { variant: 'destructive', children: 'Delete' } }

export const Large: Story = { args: { size: 'lg', children: 'Sign Up' } }

export const Small: Story = { args: { size: 'sm', children: 'See All' } }

export const Disabled: Story = { args: { children: 'Submitting…', disabled: true } }

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <Button>Default</Button>
      <Button variant="yellow">Yellow</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
}
