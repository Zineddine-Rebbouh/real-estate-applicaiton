import { MOCK_RENTALS, RentalProperty } from "./rentals-data";

export type FeeItem = {
  name: string;
  amount: string;
  frequency?: string;
  description?: string;
  required: boolean;
};

export type PointOfInterest = {
  id: string;
  name: string;
  category: "hotel" | "restaurant" | "bank" | "school" | "shop" | "fitness";
  distance: string;
  walkTime: string;
  coords: { x: number; y: number }; // relative map percentage (0-100)
};

export type ReviewItem = {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  date: string;
  comment: string;
  stayDuration: string;
  verifiedTenant: boolean;
};

export type HostProfile = {
  name: string;
  role: string;
  company: string;
  avatar: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  responseRate: string;
  responseTime: string;
  languages: string[];
  viewingHours: {
    weekdays: string;
    weekends: string;
  };
  verified: boolean;
};

export type RentalDetail = RentalProperty & {
  breadcrumbs: {
    country: string;
    region: string;
    city: string;
    neighborhood: string;
  };
  deposit: number;
  leaseTerm: string;
  aboutText: string[];
  highlights: string[];
  detailedGallery: {
    url: string;
    caption: string;
    tag?: string;
  }[];
  feesBreakdown: {
    requiredFees: FeeItem[];
    petFees: FeeItem[];
    parkingFees: FeeItem[];
  };
  policies: {
    petPolicy: {
      allowed: boolean;
      summary: string;
      rules: string[];
    };
    parkingPolicy: {
      included: boolean;
      type: string;
      summary: string;
      rules: string[];
    };
  };
  host: HostProfile;
  nearbyPOIs: PointOfInterest[];
  reviews: {
    overall: number;
    totalReviews: number;
    breakdown: {
      cleanliness: number;
      accuracy: number;
      communication: number;
      location: number;
      value: number;
    };
    list: ReviewItem[];
  };
};

const COMMON_GALLERY_COLLECTION = [
  { url: "/landing-splash.jpg", caption: "Sunlit open-concept living and dining lounge", tag: "Living Room" },
  { url: "/gallery-living-room.jpg", caption: "Floor-to-ceiling windows with panoramic city view", tag: "Living Room" },
  { url: "/gallery-kitchen.jpg", caption: "Gourmet chef kitchen with quartz countertops and island", tag: "Kitchen" },
  { url: "/gallery-bedroom.jpg", caption: "Primary bedroom suite with plush wool carpeting", tag: "Bedroom" },
  { url: "/property-large-flat.jpg", caption: "Spa-grade bathroom with walk-in rain shower", tag: "Bathroom" },
  { url: "/singlelisting-2.jpg", caption: "Private balcony overlooking the landscaped courtyard", tag: "Balcony" },
  { url: "/singlelisting-3.jpg", caption: "Dedicated home office alcove with custom shelving", tag: "Office" },
  { url: "/featured-listing.jpg", caption: "Building exterior architecture and secured lobby entrance", tag: "Building" },
];

const DEFAULT_HOST: HostProfile = {
  name: "Karolina Wiśniewska",
  role: "Senior Property Advisor",
  company: "Linden Prime Residences",
  avatar: "/landing-i1.png",
  phone: "+48 71 892 4100",
  email: "karolina.w@lindenresidences.pl",
  rating: 4.96,
  reviewCount: 142,
  responseRate: "100%",
  responseTime: "Within 15 minutes",
  languages: ["English", "Polish", "German"],
  viewingHours: {
    weekdays: "Mon – Fri: 9:00 AM – 6:30 PM",
    weekends: "Sat: 10:00 AM – 3:00 PM (by appointment)",
  },
  verified: true,
};

const SAMPLE_POIS: PointOfInterest[] = [
  { id: "poi-1", name: "Grand Monopol Hotel", category: "hotel", distance: "280m", walkTime: "3 min walk", coords: { x: 35, y: 32 } },
  { id: "poi-2", name: "Bistro La Rive Riverfront", category: "restaurant", distance: "190m", walkTime: "2 min walk", coords: { x: 39, y: 36 } },
  { id: "poi-3", name: "Santander Central Bank Branch", category: "bank", distance: "340m", walkTime: "4 min walk", coords: { x: 41, y: 30 } },
  { id: "poi-4", name: "International Bilingual Academy", category: "school", distance: "620m", walkTime: "8 min walk", coords: { x: 45, y: 40 } },
  { id: "poi-5", name: "Organic Market & Gourmet Deli", category: "shop", distance: "210m", walkTime: "3 min walk", coords: { x: 36, y: 38 } },
  { id: "poi-6", name: "Fitness First Platinum Club", category: "fitness", distance: "450m", walkTime: "6 min walk", coords: { x: 43, y: 28 } },
  { id: "poi-7", name: "The Bridge Boutique Suites", category: "hotel", distance: "510m", walkTime: "6 min walk", coords: { x: 32, y: 28 } },
  { id: "poi-8", name: "Trattoria Pasta Fresca", category: "restaurant", distance: "310m", walkTime: "4 min walk", coords: { x: 42, y: 37 } },
  { id: "poi-9", name: "PKO Bank Polski 24/7 ATM", category: "bank", distance: "240m", walkTime: "3 min walk", coords: { x: 37, y: 33 } },
  { id: "poi-10", name: "Galeria Dominikańska Mall", category: "shop", distance: "680m", walkTime: "9 min walk", coords: { x: 47, y: 35 } },
  { id: "poi-11", name: "CrossFit Oder Box", category: "fitness", distance: "520m", walkTime: "7 min walk", coords: { x: 34, y: 42 } },
  { id: "poi-12", name: "Wrocław University Main Campus", category: "school", distance: "750m", walkTime: "10 min walk", coords: { x: 38, y: 22 } },
];

const SAMPLE_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    authorName: "Marta Krawczyk",
    authorAvatar: "/landing-i2.png",
    rating: 5,
    date: "August 2026",
    comment: "Lived here for 14 months and it has been absolute perfection. The triple-glazed windows completely isolate street noise, and the radiant floor heating during winter is fantastic. The building management team responds within minutes to any request.",
    stayDuration: "Rented 1 year, 2 months",
    verifiedTenant: true,
  },
  {
    id: "rev-2",
    authorName: "Tomasz Adamski",
    authorAvatar: "/landing-i5.png",
    rating: 5,
    date: "July 2026",
    comment: "The morning light in the living room and balcony is breathtaking. The kitchen appliances are top-notch Bosch and Siemens, and the underground parking spot with EV charging made owning a Tesla effortless. Highly recommended!",
    stayDuration: "Rented 8 months",
    verifiedTenant: true,
  },
  {
    id: "rev-3",
    authorName: "Elena Rostova",
    authorAvatar: "/landing-i4.png",
    rating: 4.8,
    date: "June 2026",
    comment: "Outstanding location right next to the river promenade. Lots of cozy coffee shops and boutique bakeries within a 3-minute stroll. Move-in process with Karolina was seamless and transparent.",
    stayDuration: "Rented 6 months",
    verifiedTenant: true,
  },
  {
    id: "rev-4",
    authorName: "David Miller",
    authorAvatar: "/landing-i7.png",
    rating: 4.9,
    date: "May 2026",
    comment: "High-speed 1Gbps fiber internet was ready on day one which was essential for my remote software engineering job. Sound isolation between neighbors is 10/10.",
    stayDuration: "Rented 11 months",
    verifiedTenant: true,
  },
];

export function getRentalDetailById(id: string): RentalDetail {
  const base = MOCK_RENTALS.find((p) => p.id === id) || MOCK_RENTALS[0];

  const gallerySources = [
    base.image,
    ...(base.gallery || []),
    ...COMMON_GALLERY_COLLECTION.map((c) => c.url),
  ];
  // Deduplicate URLs while preserving order
  const uniqueUrls = Array.from(new Set(gallerySources)).filter(Boolean);

  const detailedGallery = uniqueUrls.slice(0, 8).map((url, idx) => ({
    url,
    caption: COMMON_GALLERY_COLLECTION[idx]?.caption || `${base.title} - Interior view ${idx + 1}`,
    tag: COMMON_GALLERY_COLLECTION[idx]?.tag || "Residence",
  }));

  return {
    ...base,
    breadcrumbs: {
      country: "Poland",
      region: "Lower Silesia",
      city: base.city || "Wrocław",
      neighborhood: base.neighborhood || "Stare Miasto",
    },
    deposit: base.price,
    leaseTerm: "12-month lease (flexible renewals)",
    aboutText: [
      `Welcome to ${base.title}, an impeccably designed modern residence situated in the vibrant heart of ${base.neighborhood}. Thoughtfully conceived with clean architectural lines, soaring 3-meter ceilings, and expansive floor-to-ceiling soundproof windows, this home bathes in natural daylight throughout the day while maintaining utmost serenity from urban bustle.`,
      `The heart of the home features an open-concept living salon flowing seamlessly into a bespoke gourmet kitchen, outfitted with premium integrated appliances, seamless quartz waterfall countertops, and soft-close European cabinetry. Both bedrooms are generously proportioned, offering custom-built floor-to-ceiling wardrobes and motorized blackout roller shades.`,
      `Residents enjoy exclusive access to building amenities including a secure package reception hub, high-speed dual elevators with touchless keycards, private bicycle storage, and optional climate-controlled underground parking with dedicated EV charging stations. Located just steps from historic pedestrian boulevards, artisanal bakeries, and riverside walking paths.`,
    ],
    highlights: [
      "Newly modernized in 2025 with premium European materials",
      "Triple-glazed acoustic soundproof windows for maximum serenity",
      "High-speed optical fiber 1 Gbps internet pre-installed",
      "South-facing exposure providing all-day natural daylight",
      "Private secured basement storage unit included at no cost",
      "Energy Star Grade A certified heating & smart digital thermostats",
    ],
    detailedGallery,
    feesBreakdown: {
      requiredFees: [
        {
          name: "Monthly Rent",
          amount: `$${base.price.toLocaleString()}`,
          frequency: "/ month",
          description: "Base rent payable on the 1st of each calendar month",
          required: true,
        },
        {
          name: "Refundable Security Deposit",
          amount: `$${base.price.toLocaleString()}`,
          frequency: "one-time",
          description: "Held in escrow; fully refundable upon lease expiration pursuant to standard checkout inspection",
          required: true,
        },
        {
          name: "Application & Credit Screening Fee",
          amount: "$50",
          frequency: "one-time",
          description: "Covers third-party digital credit and tenant verification background check",
          required: true,
        },
        {
          name: "Estimated Utilities & Community Maintenance",
          amount: "~$180",
          frequency: "/ month",
          description: "Includes water, high-speed heating, trash disposal, elevator upkeep, and hallway cleaning",
          required: false,
        },
        {
          name: "Move-In & Key Handover Fee",
          amount: "$0",
          frequency: "one-time",
          description: "No move-in or administrative onboarding charges",
          required: false,
        },
      ],
      petFees: [
        {
          name: "Pet Deposit (Refundable)",
          amount: base.petFriendly ? "$300" : "N/A",
          frequency: "one-time",
          description: base.petFriendly ? "Refundable deposit per registered animal" : "Pets not allowed in this unit",
          required: base.petFriendly,
        },
        {
          name: "Monthly Pet Rent",
          amount: base.petFriendly ? "$35" : "N/A",
          frequency: "/ month per pet",
          description: base.petFriendly ? "Applies to registered cats and dogs under 25kg" : "Pets not allowed",
          required: base.petFriendly,
        },
      ],
      parkingFees: [
        {
          name: "Designated Garage Space",
          amount: base.parkingIncluded ? "$0 (Included)" : "$120",
          frequency: "/ month",
          description: base.parkingIncluded ? "1 dedicated underground heated parking space included with lease" : "Optional allocated garage space with remote gate fob",
          required: false,
        },
        {
          name: "EV Charging Station Access",
          amount: "$30 + usage",
          frequency: "/ month",
          description: "22kW Level 2 charger access at the resident's parking stall",
          required: false,
        },
        {
          name: "Guest Parking Pass",
          amount: "$0",
          frequency: "as needed",
          description: "Up to 5 complimentary overnight guest passes per calendar month",
          required: false,
        },
      ],
    },
    policies: {
      petPolicy: {
        allowed: base.petFriendly,
        summary: base.petFriendly
          ? "Pets warmly welcome with prior registration (maximum 2 domestic pets per residence)."
          : "Strict no-pet policy enforced for this residence due to owner allergy specifications.",
        rules: base.petFriendly
          ? [
              "Up to 2 domestic pets (cats or dogs) permitted per apartment",
              "Maximum weight limit of 25 kg (55 lbs) per dog",
              "Up-to-date vaccination records and pet profile required before lease signing",
              "Pets must remain leashed in all common lobbies and elevators",
            ]
          : [
              "No domestic animals permitted within the property",
              "Certified service assistance animals are exempted pursuant to local legislation",
            ],
      },
      parkingPolicy: {
        included: base.parkingIncluded,
        type: base.parkingIncluded ? "Dedicated Underground Garage Stall" : "Optional Resident Garage Stall",
        summary: base.parkingIncluded
          ? "One reserved underground heated parking spot is included in the lease price."
          : "Underground parking stall available for an optional monthly fee of $120.",
        rules: [
          "Heated underground garage secured by license-plate recognition and RFID gate fob",
          "Clearance height: 2.15 meters (suitable for standard SUVs and vans)",
          "Bicycle storage bays are free of charge in the designated basement room",
          "Visitor parking bays available on ground level for registered guests",
        ],
      },
    },
    host: DEFAULT_HOST,
    nearbyPOIs: SAMPLE_POIS,
    reviews: {
      overall: base.rating,
      totalReviews: base.reviewCount,
      breakdown: {
        cleanliness: 4.9,
        accuracy: 5.0,
        communication: 4.9,
        location: 4.9,
        value: 4.8,
      },
      list: SAMPLE_REVIEWS,
    },
  };
}

