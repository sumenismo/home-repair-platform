import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CityMultiSelect } from './city-multi-select'

const meta: Meta<typeof CityMultiSelect> = {
  title: 'Components/CityMultiSelect',
  component: CityMultiSelect,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof CityMultiSelect>

export const Default: Story = {
  render: () => {
    const [cities, setCities] = useState<string[]>([])
    return (
      <div className="w-96">
        <CityMultiSelect value={cities} onChange={setCities} />
        {cities.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Selected: {cities.join(', ')}
          </p>
        )}
      </div>
    )
  },
}

export const WithPreselected: Story = {
  render: () => {
    const [cities, setCities] = useState<string[]>(['Quezon City', 'Makati', 'Pasig'])
    return (
      <div className="w-96">
        <CityMultiSelect value={cities} onChange={setCities} />
      </div>
    )
  },
}
