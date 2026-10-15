export const TARGET_CITY_PLACEHOLDER = "Select city";

/** Kemendagri-style name → title case for labels. */
export function formatAreaName(name: string) {
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Kemendagri KOTA name → short city label (no province, no Selatan/Barat/… splits). */
export function simplifyKotaLabel(kotaName: string) {
  let name = formatAreaName(kotaName.replace(/^KOTA\s+/i, ""));
  name = name.replace(/^Administrasi\s+/i, "");
  name = name.replace(/\s+(Selatan|Utara|Barat|Timur|Tengah|Pusat)$/i, "");
  return name.trim();
}

export type TargetCityOption = {
  value: string;
  label: string;
  searchText: string;
};
