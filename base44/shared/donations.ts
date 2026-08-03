// Authoritative donation tiers for the "Buy Me a Coffee" supporter feature.
// Prices are in major units (USD). create-checkout resolves these SERVER-SIDE so the
// client never sends a price — only a tier id — preventing amount tampering.
export const DONATION_TIERS = [
  { id: "coffee_3", name: "Coffee", price: "3.00", currency: "USD" },
  { id: "coffee_5", name: "Double Shot", price: "5.00", currency: "USD" },
  { id: "coffee_10", name: "Round for the Crew", price: "10.00", currency: "USD" },
  { id: "coffee_25", name: "Patron of the Stars", price: "25.00", currency: "USD" },
];