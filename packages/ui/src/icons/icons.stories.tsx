import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AirconIcon, BoltIcon, CalendarCheckIcon, CloseIcon, HammerIcon,
  HomeIcon, LightningBoltIcon, PaintRollerIcon, PesoTagIcon,
  SearchIcon, ShieldCheckIcon, StarIcon, ThumbsUpIcon, WrenchIcon,
} from './index'

const meta: Meta = {
  title: 'Icons/All Icons',
}
export default meta

type Story = StoryObj

const ALL_ICONS = [
  { name: 'AirconIcon', Icon: AirconIcon },
  { name: 'BoltIcon', Icon: BoltIcon },
  { name: 'CalendarCheckIcon', Icon: CalendarCheckIcon },
  { name: 'CloseIcon', Icon: CloseIcon },
  { name: 'HammerIcon', Icon: HammerIcon },
  { name: 'HomeIcon', Icon: HomeIcon },
  { name: 'LightningBoltIcon', Icon: LightningBoltIcon },
  { name: 'PaintRollerIcon', Icon: PaintRollerIcon },
  { name: 'PesoTagIcon', Icon: PesoTagIcon },
  { name: 'SearchIcon', Icon: SearchIcon },
  { name: 'ShieldCheckIcon', Icon: ShieldCheckIcon },
  { name: 'StarIcon', Icon: StarIcon },
  { name: 'ThumbsUpIcon', Icon: ThumbsUpIcon },
  { name: 'WrenchIcon', Icon: WrenchIcon },
]

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-6 p-6">
      {ALL_ICONS.map(({ name, Icon }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-center text-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  ),
}

export const OnYellow: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-6 p-6 bg-accent rounded-xl">
      {ALL_ICONS.map(({ name, Icon }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary-foreground">
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-center text-xs text-accent-foreground">{name}</span>
        </div>
      ))}
    </div>
  ),
}
