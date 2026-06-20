import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './input'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: { disabled: { control: 'boolean' } },
}
export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = { args: { placeholder: 'Anong serbisyo ang hanap mo?' } }

export const WithValue: Story = { args: { defaultValue: 'Santos Electrical' } }

export const Disabled: Story = { args: { placeholder: 'Disabled input', disabled: true } }

export const Error: Story = {
  args: { defaultValue: 'invalid@', className: 'border-destructive ring-destructive' },
}

export const Password: Story = { args: { type: 'password', placeholder: 'Password' } }
