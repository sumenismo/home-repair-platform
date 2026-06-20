import type { Meta, StoryObj } from '@storybook/react-vite'
import { Label } from './label'
import { Input } from './input'

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Label>

export const Default: Story = { args: { children: 'Email address' } }

export const WithInput: Story = {
  render: () => (
    <div className="space-y-1.5 w-72">
      <Label htmlFor="email-demo">Email</Label>
      <Input id="email-demo" type="email" placeholder="you@example.com" />
    </div>
  ),
}
