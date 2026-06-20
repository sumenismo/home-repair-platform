import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
import { Button } from './button'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Card>

export const Basic: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent className="pt-6">
        <p className="text-sm">A simple card with content.</p>
      </CardContent>
    </Card>
  ),
}

export const WithHeader: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Post a Job</CardTitle>
        <CardDescription>Describe the work you need done</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Form fields would go here.</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Submit</Button>
      </CardFooter>
    </Card>
  ),
}

export const JobListingCard: Story = {
  render: () => (
    <Card className="w-96 cursor-pointer hover:bg-accent/10 transition-colors">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="font-semibold">Fix leaking roof</p>
            <p className="text-muted-foreground text-sm">Roofing</p>
          </div>
          <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            Open
          </span>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
          <span>3 bids</span>
          <span>Quezon City</span>
          <span>Jun 18, 2026</span>
        </div>
      </CardContent>
    </Card>
  ),
}
