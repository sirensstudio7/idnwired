export interface NewsAuthor {
  name: string;
  role: string;
  avatar: string;
}

export type NewsBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: Array<{ lead?: string; text: string }> }
  | { type: "image"; src: string; alt: string };

export interface NewsItem {
  slug: string;
  category: string;
  date: string;
  dateLabel: string;
  datetime: string;
  title: string;
  excerpt: string;
  blocks: NewsBlock[];
  image: string;
  imageAlt: string;
  href: string;
  cta: string;
  author: NewsAuthor;
}

const authors = {
  sari: {
    name: "Sari Wijaya",
    role: "Editor, Markets",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&q=80",
  },
  daniel: {
    name: "Daniel Hartono",
    role: "Media correspondent",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&q=80",
  },
  maya: {
    name: "Maya Putri",
    role: "Distribution editor",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&q=80",
  },
  arief: {
    name: "Arief Pratama",
    role: "Search & insights",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&q=80",
  },
  nadia: {
    name: "Nadia Kusuma",
    role: "Sector editor",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&q=80",
  },
  budi: {
    name: "Budi Santoso",
    role: "Insights editor",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&q=80",
  },
} as const;

export const newsItems: NewsItem[] = [
  {
    slug: "investment-flows-beyond-java",
    category: "Business",
    date: "Oct 2025",
    dateLabel: "October 14, 2025",
    datetime: "2025-10-14",
    title: "Investment flows shift beyond Java as regional hubs accelerate.",
    excerpt:
      "More than half of realized investment in H1 2026 landed outside Jakarta — changing how national campaigns need to be planned and localized.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&auto=format&fit=crop&q=80",
    imageAlt: "Modern city skyline at dusk",
    href: "/news/investment-flows-beyond-java",
    cta: "Read Article",
    author: authors.sari,
    blocks: [
      {
        type: "p",
        text: "For years, a “national” campaign in Indonesia often meant Jakarta first, then a light pass at the rest of the country. The H1 2026 investment numbers make that habit expensive. More than half of realized investment landed outside Jakarta, and half of the national total sat outside Java altogether.",
      },
      {
        type: "p",
        text: "That shift is already showing up in coverage requests. Brands entering Surabaya, Medan, Makassar, and Bali want the same proof they used to reserve for the capital: local outlets, local language, and a story that does not read like a Jakarta release with the city name swapped.",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&auto=format&fit=crop&q=80",
        alt: "Modern city skyline at dusk",
      },
      {
        type: "h2",
        text: "What changes in the brief",
      },
      {
        type: "p",
        text: "A single national wire run still matters for search and headquarters reporting. It is no longer enough if the audience, the capital, and the next office are in a different province. City and region targeting has to be in the plan from the start, not added after the Jakarta placements go live.",
      },
      {
        type: "ul",
        items: [
          {
            lead: "Stop treating “outside Java” as one bucket.",
            text: "Each hub has its own outlets, creator tiers, and editorial habits.",
          },
          {
            lead: "Localize before the first draft.",
            text: "The campaigns that land map those differences in the newsroom, not after publish.",
          },
          {
            lead: "Keep the national run.",
            text: "Use it for search and reporting — then add the city mix the investment map now requires.",
          },
        ],
      },
      {
        type: "h2",
        text: "Looking ahead",
      },
      {
        type: "p",
        text: "Teams that still write one Jakarta story and sprinkle city names will miss the readers — and the capital — that have already moved. Plan the mix the way the investment is already flowing.",
      },
    ],
  },
  {
    slug: "editors-tighten-ai-pitches",
    category: "People",
    date: "Sep 2025",
    dateLabel: "September 18, 2025",
    datetime: "2025-09-18",
    title: "Editors tighten standards as AI-generated pitches flood inboxes.",
    excerpt:
      "Newsrooms report a spike in generic releases. Teams that lead with verified facts, quotes, and Indonesia-specific context are still getting picked up.",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1400&auto=format&fit=crop&q=80",
    imageAlt: "Newspapers and reading glasses on a desk",
    href: "/news/editors-tighten-ai-pitches",
    cta: "Read Article",
    author: authors.daniel,
    blocks: [
      {
        type: "p",
        text: "Editors across Indonesian newsrooms are seeing the same inbox: a stack of releases that read polished, interchangeable, and slightly off. The spike tracks with generic AI drafts — copy that names a product, skips the reporter’s beat, and could have been written for any market.",
      },
      {
        type: "p",
        text: "The filter is getting stricter, not more automatic. Desks still pick up stories that lead with a verified number, a named source, and a reason the story matters here.",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1400&auto=format&fit=crop&q=80",
        alt: "Newspapers and reading glasses on a desk",
      },
      {
        type: "h2",
        text: "What still gets picked up",
      },
      {
        type: "ul",
        items: [
          {
            lead: "A verified fact in the first sentence.",
            text: "A quote from an Indonesia lead, a city, a regulator, or a customer on the ground still beats global boilerplate.",
          },
          {
            lead: "A reason it matters here.",
            text: "If the only localization is a translated headline, most editors will pass.",
          },
          {
            lead: "A draft that was actually edited.",
            text: "The bar is not anti-tool. It is anti-generic.",
          },
        ],
      },
      {
        type: "h2",
        text: "What is dying",
      },
      {
        type: "p",
        text: "The “announce and spray” brief. Editors have seen that version twenty times this week, and they can tell when nobody checked the facts against a local outlet’s standards. Teams that hit send on the first pass are training desks to ignore the next one.",
      },
    ],
  },
  {
    slug: "creator-clips-press-line",
    category: "People",
    date: "Aug 2025",
    dateLabel: "August 21, 2025",
    datetime: "2025-08-21",
    title: "Creator clips extend the half-life of a single press line.",
    excerpt:
      "Short-form explainers and regional creators are turning one wire story into multi-day conversation — if the angle fits the platform.",
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1400&auto=format&fit=crop&q=80",
    imageAlt: "Person recording video on a smartphone",
    href: "/news/creator-clips-press-line",
    cta: "Read Article",
    author: authors.maya,
    blocks: [
      {
        type: "p",
        text: "A press line used to have a one-day life: it published, it sat in a report, and the conversation moved on. Creator clips are stretching that window. One wire story, recut as a short explainer or a regional take, can keep the same fact in circulation for days.",
      },
      {
        type: "p",
        text: "The catch is the angle. A release written for a business desk does not automatically work as a TikTok or Reels script. Creators need a hook, a visual, and a reason their audience should care — not a pasted executive quote.",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1400&auto=format&fit=crop&q=80",
        alt: "Person recording video on a smartphone",
      },
      {
        type: "h2",
        text: "How to brief both from the start",
      },
      {
        type: "ul",
        items: [
          {
            lead: "Treat the wire story as the source, not the finished distribution.",
            text: "Publish it, keep the canonical URL live, then let creators extend the line.",
          },
          {
            lead: "Prefer regional voices over one national face.",
            text: "A clip that lands in Bandung or Makassar often does more for local trust than another pass at the same Jakarta account.",
          },
          {
            lead: "Match the city you actually need.",
            text: "Paying for reach that does not match the launch city is how budgets disappear.",
          },
        ],
      },
      {
        type: "h2",
        text: "What the report should show",
      },
      {
        type: "p",
        text: "Placements and the clips that kept the story alive. If the report only lists outlet logos, you have not captured the half-life you paid for.",
      },
    ],
  },
  {
    slug: "structured-releases-seo",
    category: "Tech",
    date: "Jul 2025",
    dateLabel: "July 9, 2025",
    datetime: "2025-07-09",
    title: "Structured releases rank longer when outlets keep canonical URLs live.",
    excerpt:
      "Clean headlines, datelines, and entity names help Google and answer engines cite your brand months after the first publish wave.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&auto=format&fit=crop&q=80",
    imageAlt: "Analytics dashboard on a laptop screen",
    href: "/news/structured-releases-seo",
    cta: "Read Article",
    author: authors.arief,
    blocks: [
      {
        type: "p",
        text: "Most teams still judge a release by the first 48 hours of pickups. Search does not. A clean headline, a dateline, and consistent entity names keep a story eligible to rank — and to be cited by answer engines — months after the publish wave is over.",
      },
      {
        type: "p",
        text: "The unglamorous work is structure. Use the real company name, the real product name, and the same spelling across every version. Put the fact in the first sentence. Keep the outbound links you promised.",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&auto=format&fit=crop&q=80",
        alt: "Analytics dashboard on a laptop screen",
      },
      {
        type: "h2",
        text: "What keeps a page eligible",
      },
      {
        type: "ul",
        items: [
          {
            lead: "Canonical URLs that stay live.",
            text: "When an outlet keeps the page up, it becomes an asset, not a screenshot in a slide deck.",
          },
          {
            lead: "One spelling for every entity.",
            text: "Three versions of the same executive name will get you a pickup and then disappear.",
          },
          {
            lead: "A report full of live links.",
            text: "If the URL dies, the SEO value dies with it.",
          },
        ],
      },
      {
        type: "h2",
        text: "Looking ahead",
      },
      {
        type: "p",
        text: "Google and AI overviews prefer pages they can parse. A clever headline that hides the brand will age badly. A structured wave can keep working after the campaign is closed.",
      },
    ],
  },
  {
    slug: "fintech-healthcare-coverage",
    category: "Regulation",
    date: "Jun 2025",
    dateLabel: "June 12, 2025",
    datetime: "2025-06-12",
    title: "Fintech and healthcare lead non-Jakarta coverage requests.",
    excerpt:
      "Brands in regulated categories are pairing national wire runs with city-level trade and community outlets for trust-building.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&auto=format&fit=crop&q=80",
    imageAlt: "Healthcare professional using a tablet",
    href: "/news/fintech-healthcare-coverage",
    cta: "Read Article",
    author: authors.nadia,
    blocks: [
      {
        type: "p",
        text: "Fintech and healthcare are leading the briefs that ask for coverage beyond Jakarta. Both categories sell trust as much as they sell a product, and both sit under rules that make a generic lifestyle placement the wrong proof.",
      },
      {
        type: "p",
        text: "The pattern is a split run. A national business or trade desk still carries the announcement. City-level trade titles and community outlets then carry the version that a customer, a clinic, or a regional partner will actually read.",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&auto=format&fit=crop&q=80",
        alt: "Healthcare professional using a tablet",
      },
      {
        type: "h2",
        text: "Why the split run works",
      },
      {
        type: "ul",
        items: [
          {
            lead: "National desks for the announcement.",
            text: "Headquarters and search still need the canonical story.",
          },
          {
            lead: "City trade and community outlets for trust.",
            text: "One without the other looks either too central or too small.",
          },
          {
            lead: "Cleaner labeling and tighter facts.",
            text: "Editors in these beats will not stretch a claim, and they will not hide a sponsor line.",
          },
        ],
      },
      {
        type: "h2",
        text: "If you are entering from outside Indonesia",
      },
      {
        type: "p",
        text: "Do not borrow a playbook from an unregulated consumer launch. Map the desks that already cover the category, pick the cities where you are actually licensed or launching, and build the mix before the first draft.",
      },
    ],
  },
  {
    slug: "national-reach-media-map",
    category: "Business",
    date: "May 2025",
    dateLabel: "May 8, 2025",
    datetime: "2025-05-08",
    title: "What “national reach” actually means in Indonesia’s media map.",
    excerpt:
      "A practical breakdown of online groups, creator tiers, and print/TV partners — and how to mix them without wasting budget.",
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1400&auto=format&fit=crop&q=80",
    imageAlt: "Map pins on a world map",
    href: "/news/national-reach-media-map",
    cta: "Read Article",
    author: authors.budi,
    blocks: [
      {
        type: "p",
        text: "“National reach” is the phrase that shows up in almost every brief. It is also the phrase that hides the most waste. Indonesia is not one audience and it is not one channel. A real map has online groups, creator tiers, and print and TV partners — and they do different jobs.",
      },
      {
        type: "p",
        text: "Online outlets give you speed, search, and a link you can send to headquarters. Creators give you time-in-feed and a voice that already has an audience in a city or niche. Print and TV still matter when the reader is a regulator, a board, or a household that does not live on a For You page.",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1400&auto=format&fit=crop&q=80",
        alt: "Map pins on a world map",
      },
      {
        type: "h2",
        text: "How to mix without wasting budget",
      },
      {
        type: "ul",
        items: [
          {
            lead: "Let the goal pick the channel.",
            text: "A product launch that needs Google citations is a different build from a trust campaign in a regulated category.",
          },
          {
            lead: "Do not buy all three by default.",
            text: "A city opening outside Java is a third build. Buying everything without a reason is how budgets disappear.",
          },
          {
            lead: "Start with who has to see the story.",
            text: "Then pick the outlets and creators that match — not the ones that merely sound national.",
          },
        ],
      },
      {
        type: "h2",
        text: "Looking ahead",
      },
      {
        type: "p",
        text: "That is the difference between a report full of logos and a campaign that actually landed.",
      },
    ],
  },
];

export function getNewsItem(slug: string) {
  return newsItems.find((item) => item.slug === slug);
}

export function getRelatedNews(slug: string, limit = 3) {
  return newsItems.filter((item) => item.slug !== slug).slice(0, limit);
}
