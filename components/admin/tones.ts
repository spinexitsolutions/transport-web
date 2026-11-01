// Plain (non-client) module so server components can read these values.
export const LEAD_TONE: Record<string, string> = {
  new: "blue",
  contacted: "violet",
  quoted: "amber",
  negotiation: "accent",
  won: "green",
  lost: "red",
};

export const SHIPMENT_TONE: Record<string, string> = {
  booked: "gray",
  picked: "blue",
  in_transit: "violet",
  customs: "amber",
  out_for_delivery: "accent",
  delivered: "green",
  exception: "red",
};
