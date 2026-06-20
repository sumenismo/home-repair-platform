import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from './textarea'

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: { disabled: { control: 'boolean' } },
}
export default meta

type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: { placeholder: 'Describe the problem, any relevant details…', rows: 4 },
}

export const Disabled: Story = {
  args: { placeholder: 'Disabled', disabled: true, rows: 3 },
}
