import type { Meta, StoryObj } from '@storybook/react-vite'
import { PageHeading, PageLead, SectionHeading, Overline, Muted } from './typography'

const meta: Meta = {
  title: 'Components/Typography',
  tags: ['autodocs'],
}
export default meta

export const PageHeadingDefault: StoryObj = {
  name: 'PageHeading — default',
  render: () => <PageHeading>My Dashboard</PageHeading>,
}

export const PageHeadingHero: StoryObj = {
  name: 'PageHeading — hero override',
  render: () => (
    <PageHeading className="text-4xl font-bold tracking-tight">Home Repair Platform</PageHeading>
  ),
}

export const PageLeadDefault: StoryObj = {
  name: 'PageLead',
  render: () => <PageLead>Manage your job listings below.</PageLead>,
}

export const SectionHeadingDefault: StoryObj = {
  name: 'SectionHeading',
  render: () => <SectionHeading>Open jobs</SectionHeading>,
}

export const OverlineDefault: StoryObj = {
  name: 'Overline',
  render: () => <Overline>Trade categories</Overline>,
}

export const MutedLoading: StoryObj = {
  name: 'Muted — loading',
  render: () => <Muted>Loading…</Muted>,
}

export const MutedEmpty: StoryObj = {
  name: 'Muted — empty state',
  render: () => <Muted>No results found. Try adjusting your filters.</Muted>,
}

export const AllTogether: StoryObj = {
  name: 'All Together',
  render: () => (
    <div className="space-y-6 p-6">
      <div>
        <PageHeading>Welcome, Maria</PageHeading>
        <PageLead>Browse open jobs and place your bids.</PageLead>
      </div>

      <section className="space-y-3">
        <SectionHeading>Open jobs</SectionHeading>
        <div className="rounded-xl border border-dashed p-8 text-center">
          <Muted>No open jobs right now. Check back soon.</Muted>
        </div>
      </section>

      <section className="space-y-2">
        <Overline className="mb-1">Trade categories</Overline>
        <Muted>Plumbing · Electrical · Carpentry</Muted>
      </section>
    </div>
  ),
}
