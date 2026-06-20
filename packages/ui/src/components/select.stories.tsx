import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from './select'

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Select>

export const Default: Story = {
  render: () => (
    <Select className="w-56">
      <option value="">Select a category…</option>
      <option value="Plumbing">Plumbing</option>
      <option value="Electrical">Electrical</option>
      <option value="Roofing">Roofing</option>
      <option value="Carpentry">Carpentry</option>
      <option value="Painting">Painting</option>
    </Select>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Select disabled className="w-56">
      <option>Select province…</option>
    </Select>
  ),
}
