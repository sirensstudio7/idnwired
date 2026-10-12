export type Accent = "cyan" | "ink" | "pink" | "yellow";

export interface Series {
  title: string;
  date: string;
  blurb: string;
  tag: string;
}

export interface Creator {
  slug: string;
  name: string;
  handle: string;
  role: string;
  location: string;
  platforms: string[];
  followerLabel: string;
  blurb: string;
  bio: string;
  tags: string[];
  portrait: string;
  cover: string;
  accent: Accent;
  series: Series[];
}

export const agency = {
  name: "IDNWIRED",
  city: "Los Angeles",
  status: "Available for brand partnerships",
  tagline: "We represent outstanding creators.",
  hero: {
    eyebrow: "Indonesia News Wire · Press & Media Distribution",
    headline: "Your Story, Told Where Indonesia Reads, Scrolls, Watches and Shares.",
    subheadline:
      "Indonesia News Wire distributes press releases across 3,000+ media outlets, 1,000+ creators, and print & TV partners, targeted by niche, city, and audience.",
    cta: "Start Your Project",
    trustScore: "5.0 on",
    trustLink: "https://clutch.co/profile/fikri-studio#highlights",
    trustLinkText: "Clutch",
  },
  about:
    "A Connected Market, a Growing Economy, Capital That Keeps Coming In",
  marketStats: {
    title: "A Connected Market, a Growing Economy, Capital That Keeps Coming In",
    sections: [
      {
        title: "Digital market",
        rows: [
          {
            number: "235.26M",
            meaning: "Internet users in Indonesia, 81.72% penetration (APJII 2026)",
          },
          {
            number: "4–6 hours",
            meaning: "Daily online time for most users (43.4%)",
          },
          {
            number: "82.8%",
            meaning: "Social media users active 1–3 hours a day",
          },
        ],
      },
      {
        title: "Economy",
        rows: [
          {
            number: "5.29%",
            meaning: "GDP growth in Q2 2026 (year on year), above market consensus",
          },
          {
            number: "5.45%",
            meaning: "GDP growth in the first half of 2026",
          },
          {
            number: "IDR 6,552T",
            meaning: "Nominal GDP, Q2 2026",
          },
          {
            number: "17 provinces",
            meaning: "Growing faster than the national average, not just Java",
          },
        ],
      },
      {
        title: "Investment",
        rows: [
          {
            number: "IDR 1,010.6T",
            meaning: "Realized investment in H1 2026, up 7.2% year on year",
          },
          {
            number: "50.2% / 49.8%",
            meaning: "Share of foreign (PMA) and domestic (PMDN) capital, almost balanced",
          },
          {
            number: "IDR 507.8T",
            meaning: "Investment outside Java, 50.2% of the national total",
          },
          {
            number: "1.44M",
            meaning: "Jobs absorbed by H1 2026 investment",
          },
        ],
      },
      {
        title: "Our network",
        rows: [
          {
            number: "3,000+",
            meaning: "Online media outlets in our distribution network",
          },
          {
            number: "1,000+",
            meaning: "Social media creators",
          },
          {
            number: "Print and TV",
            meaning: "Newspaper, magazine and television partners",
          },
        ],
      },
    ],
  },
  whyIndonesia: {
    kicker: "Why Indonesia",
    marqueeLabel: "Where Indonesians live online every day",
    headline: [
      "A Market Already Online,",
      "Waiting to Be Reached the Right Way",
    ],
    body: [
      "Indonesia is a market that lives on screens. Of roughly 287 million people, 235 million are online, most spending one to three hours a day on TikTok, Facebook and Instagram. Java alone holds 58% of internet users. With growth above 5% and over IDR 1,000 trillion invested in H1 2026, half of it outside Java, opportunity reaches well beyond Jakarta.",
      "The audience, the attention and the capital are all there. What decides the outcome is reaching the right place, in the right language, through the right channel.",
      "Reach the people who shape the rules. We can also select the media that regulators and policymakers follow, such as national business outlets, sector trade publications, and print and TV programs, so companies in finance, crypto, energy, health or telecom put their story and data in front of decision makers through trusted channels.",
    ],
    marqueeRows: [
      {
        reverse: false,
        items: [
          { kind: "text", value: "235M online" },
          { kind: "pill", tone: "purple", label: "Social" },
          { kind: "text", value: "TikTok · Facebook · Instagram" },
        ],
      },
      {
        reverse: true,
        items: [
          { kind: "text", value: "5%+ growth" },
          { kind: "pill", tone: "yellow", label: "Capital" },
          { kind: "text", value: "IDR 1,000T+ · half outside Java" },
        ],
      },
      {
        reverse: false,
        items: [
          { kind: "text", value: "3,000+ outlets" },
          { kind: "pill", tone: "mint", label: "Policy" },
          { kind: "text", value: "Reach decision makers" },
        ],
      },
    ],
  },
  howItWorks: {
    headline: ["We guide your", "problems through to solution"],
    kicker: "How It Works",
    nodes: [
      { id: "material", label: "Send your material", tone: "active" },
      { id: "targets", label: "Choose your targets", tone: "soft" },
      { id: "live", label: "Go live", tone: "mint" },
    ],
    scenes: [
      {
        title: "Send your material",
        body: "A press release, a campaign brief, or just an idea. Our team helps sharpen the angle and rewrites it for Indonesian readers.",
        point: "Create a strong foundation so the story lands with Indonesian readers.",
      },
      {
        title: "Choose your targets",
        body: "Niche, city or region, channel mix (online, creators, print, TV) and budget. We build the package that fits.",
        point: "You choose the mix. We map the outlets and creators that match it.",
      },
      {
        title: "Go live",
        body: "You receive a report with placements, links and channel reach.",
        point: "Proof in links and reach, not a vague “we sent it out.”",
      },
    ],
    fact: {
      title: "The audience, attention and capital are already here.",
      source: "Source : APJII 2026 · BKPM H1 2026",
      legend: [
        { label: "Internet users", tone: "solid" },
        { label: "Investment outside Java", tone: "hatch" },
      ],
      bars: [
        { label: "Online", filled: 82, outlined: 50 },
        { label: "Social", filled: 13, outlined: 32 },
        { label: "Capital", filled: 4, outlined: 16 },
      ],
    },
  },
  impact: {
    kicker: "Impact on Your Business and Investment",
    headline: "Known Names Win First",
    intro: "5%+ growth and IDR 1,000T in H1 2026, half of it outside Java.",
    niches: [
      "Finance & banking",
      "Technology",
      "Entertainment",
      "Healthcare",
      "Retail",
      "Property",
    ],
    facts: [
      { value: "5%+", label: "GDP growth" },
      { value: "IDR 1,000T", label: "Realized investment, H1 2026" },
      { value: "50%", label: "Investment outside Java" },
    ],
    cards: [
      {
        title: "Competition for attention is getting tougher.",
        body: "As more foreign and local brands enter, being known before your competitors matters more.",
      },
      {
        title: "Trust helps decide.",
        body: "Indonesian partners, investors and consumers usually check whether a name has already been covered and talked about.",
      },
      {
        title: "Built for your niche.",
        body: "We match outlets and creators to the sector you are in — finance, tech, entertainment, healthcare, and more — so the story lands with the right readers.",
      },
      {
        title: "Multi-channel proof.",
        body: "Coverage in online media, print and television, backed by creator content, gives your brand credibility that a single channel cannot.",
      },
      {
        title: "A foundation for SEO and AI search.",
        body: "Articles with clear structure are easier for Google to rank and for AI answer engines to cite.",
      },
      {
        title: "Material for sales and partnerships.",
        body: "Coverage becomes assets for your sales team, investor relations and partnership proposals.",
      },
      {
        title: "Reports you can stand behind.",
        body: "Proof of placement for headquarters or investors.",
      },
    ],
  },
  whyUs: {
    kicker: "Why Us",
    headline: "Built by People Who Know the Newsroom",
    intro:
      "Indonesia News Wire is run by a team with years of experience in journalism and PR distribution. We know how editors judge a release, when a story deserves to run, and how Indonesian media, creators and community channels actually work. That knowledge sits behind a network of 3,000+ online media outlets, 1,000+ creators, and print and television partners.",
    principles: [
      {
        index: "01",
        title: "Guaranteed Publication After Initial Assessment",
        body: "We guarantee publication once your content passes our initial assessment and meets the agreed requirements.",
        tone: "yellow",
      },
      {
        index: "02",
        title: "Direct-to-Publisher Access",
        body: "Work directly with publishers through our media network for a more efficient, transparent, and streamlined publication process.",
        tone: "mint",
      },
      {
        index: "03",
        title: "Free Editorial Consultation",
        body: "Get complimentary guidance to tailor your content to Indonesian readers, local audience preferences, and the editorial policies of Indonesian media outlets.",
        tone: "navy",
      },
    ],
  },
  faq: {
    label: "FAQs",
    headline: ["Have questions?", "Find answers."],
    items: [
      {
        question: "What do you actually distribute?",
        answer:
          "A press release, a campaign brief, or an idea. We help sharpen the angle, rewrite it for Indonesian readers, and send it through the network of outlets and creators that fit.",
      },
      {
        question: "Which channels can a campaign use?",
        answer:
          "Online media across 3,000+ outlets, 1,000+ social creators, and print and television partners. You choose the mix by niche, city or region, and budget. We map the list that matches it.",
      },
      {
        question: "Can you reach cities outside Jakarta?",
        answer:
          "Yes. Campaigns can run in Bandung, Surabaya, Medan, Makassar, Bali and beyond. We build by city and region, not only Java, so the story can land where competitors have not.",
      },
      {
        question: "How is paid content labeled?",
        answer:
          "Paid content is labeled according to each outlet's policy. We do not bury a sponsor line, and we do not promise an editorial mention we cannot stand behind.",
      },
      {
        question: "What do we receive when it goes live?",
        answer:
          "A report with placements, links and channel reach. Every campaign ends with something you can send to headquarters or investors, not a vague published message.",
      },
      {
        question: "How do we start?",
        answer:
          "Send a press release, a brief, or just an idea. Our team helps shape the angle and maps the outlets and creators that match it.",
      },
    ],
  },
  cta: {
    eyebrow: "Now booking campaigns across Indonesia",
    headline: [
      "Ready to put your story",
      "where the country reads it?",
    ],
    button: "Start Your Project",
    href: "#why",
  },
  footer: {
    copyright: "© {year} Indonesia News Wire. All rights reserved.",
    menuGroups: [
      {
        title: "Main",
        links: [
          { href: "/#services", label: "Services" },
          { href: "/#about", label: "About" },
          { href: "/#how-it-works", label: "How it works" },
          { href: "/#faq", label: "FAQ" },
          { href: "/#why", label: "Contact" },
        ],
      },
      {
        title: "Network",
        links: [
          { href: "/network", label: "Our network" },
          { href: "/#about", label: "Creators" },
          { href: "/#about", label: "Print & TV" },
          { href: "/#why", label: "Why us" },
        ],
      },
      {
        title: "Legal",
        links: [
          { href: "#", label: "Privacy Policy" },
          { href: "#", label: "Terms & Conditions" },
        ],
      },
      {
        title: "Social",
        links: [
          { href: "https://www.linkedin.com", label: "LinkedIn" },
          { href: "https://www.instagram.com", label: "Instagram" },
          { href: "https://www.x.com", label: "X" },
          { href: "mailto:hello@idnwired.com", label: "Mail" },
        ],
      },
    ],
  },
  closer:
    "We're most energized by campaigns where a creator's voice stays intact, the brief is actually interesting, and the work shows up in someone's For You page.",
  contactNote:
    "Open to brand partnerships, roster inquiries, and conversations about what culture is paying attention to next.",
  email: "hello@idnwired.com",
};

export const skills = [
  { label: "Storytelling", tone: "pink" },
  { label: "Short-form", tone: "red" },
  { label: "Brand Collabs", tone: "cyan" },
  { label: "Production", tone: "blue" },
] as const;

export interface Service {
  name: string;
  date: string;
  blurb: string;
  tags: string[];
  cover: string;
  accent: Accent;
}

export const services: Service[] = [
  {
    name: "UGC Campaigns",
    date: "Creator-led",
    blurb: "Native ads that look like the feed, not a media kit. We brief talent, shoot, and ship assets brands can actually run.",
    tags: ["UGC", "Paid Social"],
    cover:
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1400&q=80",
    accent: "cyan",
  },
  {
    name: "Social Media Management",
    date: "Always-on",
    blurb: "Calendars, community, and the comments that turn a post into a relationship. We run the channels so the voice stays consistent.",
    tags: ["Content", "Community"],
    cover:
      "https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&fit=crop&w=1400&q=80",
    accent: "ink",
  },
  {
    name: "Media Handling",
    date: "End-to-end",
    blurb: "Shoot days, edits, rights, and delivery. One team owns the files from the first take to the last export.",
    tags: ["Production", "Delivery"],
    cover:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1400&q=80",
    accent: "pink",
  },
];

export const creators: Creator[] = [
  {
    slug: "jules-park",
    name: "Jules Park",
    handle: "@julespark",
    role: "Short-form comic",
    location: "Los Angeles",
    platforms: ["TikTok", "Reels", "YouTube"],
    followerLabel: "4.8M",
    blurb: "Fifteen seconds, one raised eyebrow, and the comment section writes itself.",
    bio: "Jules builds comedy that brands are usually too scared to green-light — then watches it outperform the safe cut. Based in LA, she treats every brief like a bit that has to land on the first watch.",
    tags: ["Comedy", "4.8M"],
    portrait:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80",
    accent: "cyan",
    series: [
      {
        title: "Desk Job Diaries",
        date: "Mar 2026",
        blurb: "Office micro-skits that made three HR teams nervously subscribe.",
        tag: "Comedy",
      },
      {
        title: "Soft Launch",
        date: "Jan 2026",
        blurb: "A beverage brand let Jules ad-lib. The legal team survived.",
        tag: "Paid",
      },
      {
        title: "Night Shift",
        date: "Nov 2025",
        blurb: "Late-night street interviews that turned into a weekly series.",
        tag: "Series",
      },
    ],
  },
  {
    slug: "rio-hale",
    name: "Rio Hale",
    handle: "@riohale",
    role: "Travel vlogger",
    location: "Lisbon",
    platforms: ["YouTube", "Instagram"],
    followerLabel: "2.1M",
    blurb: "From 'where even is this' to 'I booked the flight in the comments.'",
    bio: "Rio films the in-between: delayed trains, bad espresso, and the one conversation that makes a city feel like a person. His long-form still gets finished. That is the whole pitch.",
    tags: ["Travel", "2.1M"],
    portrait:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80",
    accent: "ink",
    series: [
      {
        title: "One Bag, Six Weeks",
        date: "Feb 2026",
        blurb: "A packing-list series that accidentally became a packing-list product.",
        tag: "YouTube",
      },
      {
        title: "Off-Season",
        date: "Oct 2025",
        blurb: "Cities after the influencers leave. Hotels still answered email.",
        tag: "Travel",
      },
    ],
  },
  {
    slug: "mira-sol",
    name: "Mira Sol",
    handle: "@mirasol",
    role: "Beauty & lifestyle",
    location: "Seoul",
    platforms: ["Instagram", "TikTok", "YouTube"],
    followerLabel: "3.4M",
    blurb: "The routine people screenshot, then actually try before breakfast.",
    bio: "Mira treats beauty like industrial design: fewer steps, better light, no voice that sounds like a press release. Seoul-based, she is the reason a moisturizer sold out on a Tuesday.",
    tags: ["Beauty", "3.4M"],
    portrait:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80",
    accent: "pink",
    series: [
      {
        title: "Glass Hour",
        date: "Apr 2026",
        blurb: "A five-product shelfie that read like a manifesto.",
        tag: "Beauty",
      },
      {
        title: "Night Market Skin",
        date: "Dec 2025",
        blurb: "Street-food lighting, still-perfect texture. Brands noticed.",
        tag: "Lifestyle",
      },
      {
        title: "No Filter Week",
        date: "Aug 2025",
        blurb: "A dare that became her most-saved highlight.",
        tag: "Series",
      },
    ],
  },
  {
    slug: "kenji-ito",
    name: "Kenji Ito",
    handle: "@kenjicodes",
    role: "Tech educator",
    location: "Tokyo",
    platforms: ["YouTube", "X", "TikTok"],
    followerLabel: "1.6M",
    blurb: "He explains the thing you were pretending you already understood.",
    bio: "Kenji makes technical ideas feel like a friend drawing on a napkin. Developers watch. So do the PMs who have to present tomorrow. Tokyo timezone, global comment section.",
    tags: ["Education", "1.6M"],
    portrait:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80",
    accent: "yellow",
    series: [
      {
        title: "Build This Tonight",
        date: "Mar 2026",
        blurb: "45-minute builds with no 'as you can see' energy.",
        tag: "YouTube",
      },
      {
        title: "Explain Like I'm Shipping",
        date: "Jan 2026",
        blurb: "A SaaS launch series that doubled as onboarding.",
        tag: "Paid",
      },
    ],
  },
  {
    slug: "ada-nwosu",
    name: "Ada Nwosu",
    handle: "@adacooks",
    role: "Food storyteller",
    location: "Lagos / NYC",
    platforms: ["Instagram", "YouTube", "TikTok"],
    followerLabel: "2.9M",
    blurb: "Recipes that taste like a place, not a content calendar.",
    bio: "Ada cooks like she is introducing you to someone. The plating is considered. The story is the point. Brands that want 'authentic food content' usually mean they want Ada.",
    tags: ["Food", "2.9M"],
    portrait:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80",
    accent: "cyan",
    series: [
      {
        title: "Sunday Stock",
        date: "Feb 2026",
        blurb: "A pot, a city, and the relative who taught her the recipe.",
        tag: "Food",
      },
      {
        title: "Counter Service",
        date: "Sep 2025",
        blurb: "A restaurant group let her rewrite the menu shoot.",
        tag: "Paid",
      },
      {
        title: "Carry-On Spice",
        date: "Jun 2025",
        blurb: "Airport-to-kitchen cooking with one backpack of ingredients.",
        tag: "Series",
      },
    ],
  },
  {
    slug: "leo-voss",
    name: "Leo Voss",
    handle: "@leovoss",
    role: "Fitness creator",
    location: "Miami",
    platforms: ["TikTok", "YouTube", "Instagram"],
    followerLabel: "5.2M",
    blurb: "Training that looks cinematic and still makes your legs complain.",
    bio: "Leo films like a sports director and programs like a coach who actually answers DMs. Miami light, serious sets, zero 'day in the life of a grindset' monologue.",
    tags: ["Fitness", "5.2M"],
    portrait:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80",
    accent: "ink",
    series: [
      {
        title: "Sunrise Split",
        date: "Apr 2026",
        blurb: "6am sessions that a running brand used as the whole campaign.",
        tag: "Fitness",
      },
      {
        title: "Hotel Gym, No Excuse",
        date: "Nov 2025",
        blurb: "A travel-fitness series shot in eleven ugly hotel gyms.",
        tag: "Series",
      },
    ],
  },
];

export function getCreator(slug: string) {
  return creators.find((creator) => creator.slug === slug);
}
