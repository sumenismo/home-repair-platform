import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './dialog'
import { Button } from './button'

const meta: Meta = {
  title: 'Components/Dialog',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>View Pro Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Santos Electrical Services</DialogTitle>
          <DialogDescription>Individual · Electrical</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-6 pt-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              About
            </p>
            <p className="text-sm leading-relaxed">
              Licensed electrician with 10+ years experience in residential wiring, panel upgrades,
              and appliance installation.
            </p>
          </div>
          <div className="border-t pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Contact
            </p>
            <p className="text-sm">+63 912 345 6789</p>
            <p className="text-sm">santos.elec@example.com</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ),
}
