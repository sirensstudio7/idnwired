export const INQUIRY_STATUSES = ["new", "contacted", "closed"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const COMPANY_SECTORS = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance & fintech" },
  { value: "retail_ecommerce", label: "Retail & e-commerce" },
  { value: "education", label: "Education" },
  { value: "government", label: "Government & public sector" },
  { value: "energy", label: "Energy & utilities" },
  { value: "travel_hospitality", label: "Travel & hospitality" },
  { value: "media_entertainment", label: "Media & entertainment" },
  { value: "real_estate", label: "Real estate & construction" },
  { value: "food_beverage", label: "Food & beverage" },
  { value: "automotive", label: "Automotive" },
  { value: "nonprofit", label: "Nonprofit & NGOs" },
  { value: "other", label: "Other" },
] as const;

export type CompanySector = (typeof COMPANY_SECTORS)[number]["value"];

export const COMPANY_SECTOR_PLACEHOLDER = "Select sector";

const COMPANY_SECTOR_VALUES = new Set<string>(COMPANY_SECTORS.map((s) => s.value));

export function companySectorLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return COMPANY_SECTORS.find((s) => s.value === value)?.label ?? value;
}

export const BUDGET_BANDS = [
  { value: "", label: "Prefer not to say" },
  { value: "under_25m", label: "Under $2,500" },
  { value: "25m_75m", label: "$2,500 – $5,000" },
  { value: "75m_200m", label: "$5,000 – $15,000" },
  { value: "200m_plus", label: "$15,000+" },
] as const;

export interface InquiryInsert {
  company_name: string;
  company_sector: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  targets: string | null;
  launch_date: string | null;
  budget_band: string | null;
  project_details: string;
  source: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimStr(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

function optionalStr(value: unknown, maxLen: number): string | null {
  const s = trimStr(value, maxLen);
  return s.length ? s : null;
}

/** Optional budget amount: digits only (commas/spaces stripped). */
function optionalDigits(value: unknown, maxDigits: number): string | null {
  const s = trimStr(value, maxDigits + 16);
  if (!s.length) return null;
  const digits = s.replace(/\D/g, "").slice(0, maxDigits);
  return digits.length ? digits : null;
}

const TARGETS_NICHE_MARKER = "\nNiche & audience: ";

/** Stored in `targets` column from split form fields. */
export function buildTargets(cities: string | null, niche: string | null): string | null {
  if (!cities && !niche) return null;
  if (cities && niche) return `Cities: ${cities}${TARGETS_NICHE_MARKER}${niche}`;
  if (cities) return `Cities: ${cities}`;
  return `Niche & audience: ${niche}`;
}

export function parseTargetsStored(targets: string | null): {
  cities: string | null;
  niche: string | null;
  legacy: boolean;
} {
  if (!targets) return { cities: null, niche: null, legacy: false };

  if (targets.startsWith("Cities:") && targets.includes(TARGETS_NICHE_MARKER)) {
    const [citiesPart, nichePart] = targets.split(TARGETS_NICHE_MARKER);
    return {
      cities: citiesPart.replace(/^Cities:\s*/, "").trim() || null,
      niche: nichePart.trim() || null,
      legacy: false,
    };
  }

  if (targets.startsWith("Cities:")) {
    return {
      cities: targets.replace(/^Cities:\s*/, "").trim() || null,
      niche: null,
      legacy: false,
    };
  }

  if (targets.startsWith("Niche & audience:")) {
    return {
      cities: null,
      niche: targets.replace(/^Niche & audience:\s*/, "").trim() || null,
      legacy: false,
    };
  }

  return { cities: null, niche: null, legacy: true };
}

export function parseInquiryBody(
  body: unknown,
): { ok: true; data: InquiryInsert } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const raw = body as Record<string, unknown>;

  if (trimStr(raw._hp, 200)) {
    return { ok: false, error: "Unable to submit." };
  }

  const company_name = trimStr(raw.company_name, 200);
  const contact_name = trimStr(raw.contact_name, 200);
  const email = trimStr(raw.email, 320).toLowerCase();
  const project_details = trimStr(raw.project_details, 8000);

  if (!company_name) return { ok: false, error: "Company name is required." };

  const company_sector = trimStr(raw.company_sector, 64);
  if (!company_sector || !COMPANY_SECTOR_VALUES.has(company_sector)) {
    return { ok: false, error: "Please select a company sector." };
  }

  if (!contact_name) return { ok: false, error: "Contact name is required." };
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "A valid email is required." };
  }
  if (!project_details || project_details.length < 20) {
    return {
      ok: false,
      error: "Please share a bit more about your project (at least 20 characters).",
    };
  }

  const budget_band = optionalDigits(raw.budget_band, 15);

  const targetCities = optionalStr(raw.target_cities, 500);
  const targetNiche = optionalStr(raw.target_niche, 1500);
  const targetsFromSplit = buildTargets(targetCities, targetNiche);
  const targets =
    raw.target_cities !== undefined || raw.target_niche !== undefined
      ? targetsFromSplit
      : optionalStr(raw.targets, 2000);

  return {
    ok: true,
    data: {
      company_name,
      company_sector,
      contact_name,
      email,
      phone: optionalStr(raw.phone, 64),
      website: optionalStr(raw.website, 500),
      targets,
      launch_date: optionalStr(raw.launch_date, 120),
      budget_band,
      project_details,
      source: trimStr(raw.source, 64) || "footer_cta",
    },
  };
}

export function parseStatusUpdate(
  body: unknown,
): { ok: true; status: InquiryStatus } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid body." };
  }
  const status = (body as Record<string, unknown>).status;
  if (typeof status !== "string" || !INQUIRY_STATUSES.includes(status as InquiryStatus)) {
    return { ok: false, error: "Invalid status." };
  }
  return { ok: true, status: status as InquiryStatus };
}
