// Public Thank-You page for donors returning from Wix checkout.
// Rendered outside the auth gate (see App.jsx short-circuit) so anonymous buyers
// can always land here after paying.
import React from 'react';
import { Coffee, Rocket } from 'lucide-react';

export default function ThankYou() {
  return (
    <div className="crt-container min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full border border-orange-700 bg-black p-8 text-center space-y-4">
        <Coffee className="w-12 h-12 text-orange-500 mx-auto" />
        <h1 className="text-orange-300 font-bold uppercase text-lg">Transmission Received</h1>
        <p className="text-orange-500 text-sm leading-relaxed">
          Thank you, Commander. Your support fuels the expedition and keeps the stars spinning.
          Every credit goes directly into building the next sector of o7.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/40 text-xs font-bold uppercase"
        >
          <Rocket className="w-4 h-4" /> Return to Flight
        </a>
      </div>
    </div>
  );
}