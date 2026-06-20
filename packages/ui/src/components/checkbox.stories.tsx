import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from './checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Checkbox>

export const Unchecked: Story = {}

export const Checked: Story = { args: { defaultChecked: true } }

export const Disabled: Story = { args: { disabled: true } }

export const WithLabel: Story = {
  render: () => (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
      <Checkbox defaultChecked />
      Electrical
    </label>
  ),
}

export const CategoryGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-2 w-56">
      {['Plumbing', 'Electrical', 'Roofing', 'Carpentry', 'Painting', 'Tiling'].map((cat) => (
        <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox />
          {cat}
        </label>
      ))}
    </div>
  ),
}
