export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.decoreventz.com").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "Decor Eventz";

export const CONTACT = {
  phone: "+91 98862 85028",
  phoneHref: "tel:+919886285028",
  whatsappHref: "https://wa.me/919886285028",
  email: "baraabarevents@gmail.com",
  address: {
    line1: "No 11, 4th Cross, 2nd Main Road",
    line2: "Shampura",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560045",
    country: "IN",
  },
} as const;

export const CONTACT_ADDRESS_FULL = `${CONTACT.address.line1}, ${CONTACT.address.line2}, ${CONTACT.address.city}, ${CONTACT.address.state} ${CONTACT.address.postalCode}`;

export const CONTACT_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  CONTACT_ADDRESS_FULL,
)}`;
