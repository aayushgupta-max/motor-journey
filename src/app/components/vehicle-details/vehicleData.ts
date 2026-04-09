export interface CarBrand {
  id: number;
  name: string;
  initial: string;
  bg: string;
  accent: string;
  text: string;
}

export const carBrands: CarBrand[] = [
  // Most popular first (for home page grid display)
  { id: 1, name: 'Toyota', initial: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Toyota_EU.svg/960px-Toyota_EU.svg.png', bg: 'bg-[#FFE8E8]', accent: 'bg-[#E53935]', text: 'text-[#C62828]' },
  { id: 4, name: 'Nissan', initial: 'https://thumbs.dreamstime.com/b/nissan-motor-company-ltd-trading-as-nissan-motor-corporation-often-shortened-to-nissan-japanese-multinational-204759382.jpg', bg: 'bg-[#FFF3E0]', accent: 'bg-[#FB8C00]', text: 'text-[#E65100]' },
  { id: 5, name: 'Honda', initial: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpoQhRH798FL1NPyETASXUpve_UWkjNA1YBQ&s', bg: 'bg-[#E8F5E9]', accent: 'bg-[#43A047]', text: 'text-[#2E7D32]' },
  { id: 6, name: 'Hyundai', initial: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQudO8lwJk7GmXxUvigoWkRaRItLyJVBxPt-g&s', bg: 'bg-[#E0F7FA]', accent: 'bg-[#00ACC1]', text: 'text-[#00838F]' },
  { id: 3, name: 'Mercedes', initial: 'https://rukminim2.flixcart.com/image/480/480/kh0vonk0-0/magnet/c/j/b/cnh-00825-mercedes-logo-badges-fridge-magnet-click-n-home-original-imafx4ssen56dccy.jpeg?q=90', bg: 'bg-[#F3E5F5]', accent: 'bg-[#8E24AA]', text: 'text-[#6A1B9A]' },
  { id: 2, name: 'BMW', initial: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/3840px-BMW.svg.png', bg: 'bg-[#E3F2FD]', accent: 'bg-[#1E88E5]', text: 'text-[#1565C0]' },
  { id: 7, name: 'Ford', initial: 'https://asilverliningfoundation.org/wp-content/uploads/2021/07/ford-logo.png.png', bg: 'bg-[#E8EAF6]', accent: 'bg-[#3949AB]', text: 'text-[#283593]' },
  { id: 8, name: 'Audi', initial: 'https://loodibee.com/wp-content/uploads/Audi-Logo-300x300.png', bg: 'bg-[#ECEFF1]', accent: 'bg-[#546E7A]', text: 'text-[#37474F]' },
];

export const modelsByBrand: Record<string, string[]> = {
  // Least popular → most popular per brand (bottom = most popular)
  Toyota: ['Sequoia', 'Supra', 'Avalon', 'Rush', 'C-HR', 'Innova', 'RAV4', 'Hilux', 'Yaris', 'Fortuner', 'Prado', 'Land Cruiser', 'Corolla', 'Camry'],
  BMW: ['Z4', 'iX', 'i4', '8 Series', '4 Series', 'M3', 'M5', 'X1', 'X7', '7 Series', 'X3', 'X5', '5 Series', '3 Series'],
  Mercedes: ['EQS', 'AMG GT', 'CLA', 'GLB', 'A-Class', 'GLS', 'S-Class', 'GLA', 'E-Class', 'GLE', 'GLC', 'C-Class'],
  Nissan: ['Terrano', 'Magnite', '370Z', 'Maxima', 'Juke', 'Navara', 'Qashqai', 'Pathfinder', 'Sentra', 'X-Trail', 'Kicks', 'Sunny', 'Altima', 'Patrol'],
  Honda: ['WR-V', 'BR-V', 'Jazz', 'Odyssey', 'Pilot', 'HR-V', 'City', 'CR-V', 'Accord', 'Civic'],
  Hyundai: ['i10', 'i20', 'Sonata', 'Kona', 'Palisade', 'Accent', 'Venue', 'Elantra', 'Creta', 'Santa Fe', 'Tucson'],
  Ford: ['EcoSport', 'Edge', 'Escape', 'Bronco', 'Expedition', 'F-150', 'Territory', 'Ranger', 'Explorer', 'Mustang'],
  Audi: ['TT', 'RS7', 'RS5', 'e-tron', 'A3', 'A8', 'Q8', 'Q3', 'A6', 'Q7', 'Q5', 'A4'],
};

export function getYearRange(): number[] {
  const currentYear = 2026;
  return Array.from({ length: 20 }, (_, i) => currentYear - 19 + i);
}

export function shouldAskBrandNew(year: number): boolean {
  const currentYear = 2026;
  return year === currentYear || year === currentYear - 1;
}

export interface VehicleSuggestion {
  brand: string;
  model: string;
  logo: string;
  display: string;
}

export type VehicleSpec = 'gcc' | 'non-gcc';
export type CoverageType = 'third-party' | 'comprehensive';

const typoCorrections: Array<[RegExp, string]> = [
  [/\btoyta\b/g, 'toyota'],
  [/\btoytoa\b/g, 'toyota'],
  [/\bnisan\b/g, 'nissan'],
  [/\bhonda\b/g, 'honda'],
  [/\bhyund?ai\b/g, 'hyundai'],
  [/\bmercedez\b/g, 'mercedes'],
  [/\bmercedesz\b/g, 'mercedes'],
  [/\bbmwv?\b/g, 'bmw'],
  [/\baudii\b/g, 'audi'],
  [/\bcorola\b/g, 'corolla'],
  [/\bcamm?ry\b/g, 'camry'],
  [/\blandcruiser\b/g, 'land cruiser'],
  [/\bfortuner\b/g, 'fortuner'],
  [/\bcompr?ih?ensive\b/g, 'comprehensive'],
  [/\bthird\s*pary\b/g, 'third party'],
  [/\bthird\s*prt?y\b/g, 'third party'],
  [/\bnon\s*gcc\b/g, 'non-gcc'],
  [/\bnon[-\s]?gccc\b/g, 'non-gcc'],
  [/\bgcc\s*specs?\b/g, 'gcc'],
];

export function normalizeVehicleQuery(input: string): string {
  let normalized = input.toLowerCase();
  for (const [pattern, replacement] of typoCorrections) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized.replace(/\s+/g, ' ').trim();
}

export function searchVehicles(query: string): VehicleSuggestion[] {
  if (!query.trim()) return [];

  // Strip conversational prefixes for searching
  const convPrefixes = [
    'i have a ', 'i have an ', 'i drive a ', 'i drive an ',
    'i own a ', 'i own an ', 'my car is a ', 'my car is an ',
    "it's a ", 'its a ', 'i got a ', 'i got an ',
    'my ', 'i have ', 'i drive ', 'i own ',
  ];
  let q = normalizeVehicleQuery(query);
  for (const p of convPrefixes) {
    if (q.startsWith(p)) {
      q = q.slice(p.length).trim();
      break;
    }
  }
  // Also strip age/year phrases for search
  q = q.replace(/(\d+)\s*(?:years?|yrs?)\s*(?:old)?/g, '').replace(/\bbrand\s*new\b/g, '').replace(/\bnew\b/g, '').replace(/\b(20\d{2})\b/g, '').replace(/,/g, '').replace(/\s+/g, ' ').trim();
  if (!q) return [];
  const results: VehicleSuggestion[] = [];

  for (const brand of carBrands) {
    const brandName = brand.name.toLowerCase();
    for (const model of modelsByBrand[brand.name] ?? []) {
      const modelName = model.toLowerCase();
      const combined = `${brandName} ${modelName}`;
      const reverseCombined = `${modelName} ${brandName}`;

      if (
        combined.includes(q) ||
        reverseCombined.includes(q) ||
        brandName.includes(q) ||
        modelName.includes(q)
      ) {
        results.push({
          brand: brand.name,
          model,
          logo: brand.initial,
          display: `${brand.name} ${model}`,
        });
      }
    }
  }

  // Sort: exact brand match first, then alphabetical
  results.sort((a, b) => {
    const aExact = a.brand.toLowerCase() === q || a.model.toLowerCase() === q;
    const bExact = b.brand.toLowerCase() === q || b.model.toLowerCase() === q;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return a.display.localeCompare(b.display);
  });

  return results.slice(0, 8);
}

export function parseVehicleInput(input: string): {
  brand?: string;
  model?: string;
  year?: number;
  isBrandNew?: boolean;
  spec?: VehicleSpec;
  coverage?: CoverageType;
} {
  const currentYear = 2026;

  // Strip conversational prefixes
  const convPrefixes = [
    'i have a ', 'i have an ', 'i drive a ', 'i drive an ',
    'i own a ', 'i own an ', 'my car is a ', 'my car is an ',
    "it's a ", 'its a ', 'i got a ', 'i got an ',
    'my ', 'i have ', 'i drive ', 'i own ',
  ];
  let stripped = normalizeVehicleQuery(input);
  for (const p of convPrefixes) {
    if (stripped.startsWith(p)) {
      stripped = stripped.slice(p.length);
      break;
    }
  }
  const raw = stripped;

  let brand: string | undefined;
  let model: string | undefined;
  let year: number | undefined;
  let isBrandNew: boolean | undefined;
  let spec: VehicleSpec | undefined;
  let coverage: CoverageType | undefined;

  // Extract relative age: "5 years old", "3 year old", "5 yr"
  const ageMatch = raw.match(/(\d+)\s*(?:years?|yrs?)\s*(?:old)?/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1]);
    if (age >= 0 && age <= 20) {
      year = currentYear - age;
    }
  }

  // Extract "brand new" / "new" / "pre-owned"
  if (/\bpre[-\s]?owned\b/.test(raw)) {
    isBrandNew = false;
  } else if (/\bbrand\s*new\b/.test(raw) || /\bnew\b/.test(raw)) {
    if (!year) year = currentYear;
    isBrandNew = true;
  }

  if (/\b(gcc|gulf)\b/.test(raw)) {
    spec = 'gcc';
  } else if (/\b(non[-\s]?gcc|imported|american|us|european|japanese)\b/.test(raw)) {
    spec = 'non-gcc';
  }

  if (/\bthird[-\s]?party\b/.test(raw)) {
    coverage = 'third-party';
  } else if (/\b(comprehensive|full)\b/.test(raw)) {
    coverage = 'comprehensive';
  }

  // Extract absolute year if any token is a 4-digit number in range
  if (!year) {
    const tokens = raw.split(/\s+/);
    for (const token of tokens) {
      const num = parseInt(token);
      if (num >= 2007 && num <= currentYear) {
        year = num;
      }
    }
  }

  // Clean input for brand/model matching — remove age/year/new phrases
  const cleaned = raw
    .replace(/(\d+)\s*(?:years?|yrs?)\s*(?:old)?/g, '')
    .replace(/\bbrand\s*new\b/g, '')
    .replace(/\bnew\b/g, '')
    .replace(/\b(20\d{2})\b/g, '')
    .replace(/[.,;:!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Try to match brand
  for (const b of carBrands) {
    if (cleaned.includes(b.name.toLowerCase())) {
      brand = b.name;
      const remaining = cleaned.replace(b.name.toLowerCase(), '').trim();
      if (remaining) {
        const models = modelsByBrand[b.name] ?? [];
        const match = models.find((m) => {
          const normalizedModel = m.toLowerCase();
          return (
            normalizedModel === remaining ||
            remaining.includes(normalizedModel) ||
            remaining.split(' ').some((token) => token === normalizedModel)
          );
        });
        if (match) model = match;
      }
      break;
    }
  }

  // If no brand found, try matching model directly (unique models)
  if (!brand && cleaned) {
    for (const b of carBrands) {
      for (const m of modelsByBrand[b.name] ?? []) {
        if (m.toLowerCase() === cleaned || cleaned.includes(m.toLowerCase())) {
          brand = b.name;
          model = m;
          break;
        }
      }
      if (brand) break;
    }
  }

  return { brand, model, year, isBrandNew, spec, coverage };
}
