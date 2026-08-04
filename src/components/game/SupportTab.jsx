// "Buy Me a Coffee" supporter tab — lets players make a one-time donation to support
// development. Calls create-checkout with only a tier id; the price is resolved server-side.
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Coffee, Heart, Loader2, Users } from 'lucide-react';
import { CONTRIBUTORS, getCreditLine, getContributorCount } from '@/lib/contributors';

// Mirror of base44/shared/donations.ts for display only. The authoritative price is
// resolved server-side in create-checkout, so these values are never trusted for charging.
const DONATION_TIERS = [
  { id: 'coffee_3', label: 'Coffee', amount: '$3', blurb: 'A small thanks' },
  { id: 'coffee_5', label: 'Double Shot', amount: '$5', blurb: 'Keep the engines running' },
  { id: 'coffee_10', label: 'Round for the Crew', amount: '$10', blurb: 'Fuel the jump drive' },
  { id: 'coffee_25', label: 'Patron of the Stars', amount: '$25', blurb: 'Bankroll the expedition' },
];

export default function SupportTab() {
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const handleDonate = async (tier) => {
    setError(null);
    setLoadingId(tier.id);
    try {
      const response = await base44.functions.invoke('create-checkout', { productId: tier.id });
      const redirectUrl = response.data?.redirectUrl;
      if (!redirectUrl) throw new Error('No checkout URL returned');
      // Hard redirect to Wix's hosted checkout page.
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('Donation checkout failed', err);
      setError('Could not start checkout. Please try again.');
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-orange-700 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Buy Me a Coffee</h2>
        </div>
        <p className="text-orange-600 text-xs leading-relaxed">
          o7 is free to play, with no ads — ever. If you're enjoying the simulation and want to
          support continued development, the road to the Play Store, and new sectors, consider
          buying the developer a coffee. Every contribution goes directly into building the galaxy.
        </p>
        <p className="text-orange-700 text-[10px]">Payments are processed securely by Base44 Payments. No account required.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DONATION_TIERS.map((tier) => (
          <button
            key={tier.id}
            onClick={() => handleDonate(tier)}
            disabled={!!loadingId}
            className="flex items-center gap-3 border border-orange-800 p-3 text-left hover:border-orange-500 hover:bg-orange-950/30 transition-all disabled:opacity-50"
          >
            <Coffee className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-orange-300 font-bold text-sm">{tier.label}</span>
                <span className="text-orange-400 font-bold">{tier.amount}</span>
              </div>
              <div className="text-orange-700 text-[10px]">{tier.blurb}</div>
            </div>
            {loadingId === tier.id && <Loader2 className="w-4 h-4 text-orange-500 animate-spin flex-shrink-0" />}
          </button>
        ))}
      </div>

      {error && <div className="text-red-500 text-xs border border-red-900 p-2">{error}</div>}

      {getContributorCount() > 0 && (
        <div className="border border-cyan-900 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-500" />
            <h2 className="text-cyan-300 font-bold uppercase">Credits</h2>
          </div>
          <p className="text-orange-600 text-xs leading-relaxed">
            The people who helped build the galaxy. Each founder's alias appears as a background
            NPC — you may encounter them flying the stars during your travels.
          </p>
          <div className="space-y-1">
            {CONTRIBUTORS.map((c, i) => (
              <div key={i} className="flex items-baseline justify-between border-b border-orange-950/50 pb-1">
                <span className="text-orange-300 text-xs font-bold">{c.alias}</span>
                <span className="text-orange-700 text-[10px]">played by {c.firstName} {c.lastName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}