import type { BidsQuery } from '@/generated/graphql'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, cn, Overline } from '@home-repair/ui'

type Bid = BidsQuery['bids'][number]

interface Props {
  bid: Bid | null
  open: boolean
  onClose: () => void
}

export default function ServiceProviderProfileModal({ bid, open, onClose }: Props) {
  const sp = bid?.serviceProvider
  const profile = sp?.serviceProviderProfile

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {sp && (
          <>
            <DialogHeader className="pb-4">
              <div className="flex items-center gap-2 flex-wrap pr-6">
                <DialogTitle className="text-lg">
                  {sp.fullName ?? sp.email}
                </DialogTitle>
                {profile?.verified && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    Verified
                  </span>
                )}
              </div>
              {profile?.businessName && (
                <DialogDescription className="text-sm">
                  {profile.businessName}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-5 p-6 pt-4">
              {/* Account type */}
              {profile && (
                <div>
                  <Overline className="mb-1">Account type</Overline>
                  <p className="text-sm">{profile.isCompany ? 'Company' : 'Individual'}</p>
                </div>
              )}

              {/* Trade categories */}
              {profile && profile.tradeCategories.length > 0 && (
                <div>
                  <Overline className="mb-2">Trade categories</Overline>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.tradeCategories.map((cat) => (
                      <span
                        key={cat}
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                          'bg-secondary text-secondary-foreground',
                        )}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {profile?.bio && (
                <div>
                  <Overline className="mb-1">About</Overline>
                  <p className="text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Contact */}
              <div className="border-t pt-4">
                <Overline className="mb-2">Contact</Overline>
                <div className="space-y-1 text-sm">
                  {sp.phone && <p>{sp.phone}</p>}
                  <p>{sp.email}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
