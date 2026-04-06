export interface CarBrand {
  id: number;
  name: string;
  initial: string;
  bg: string;
  accent: string;
  text: string;
}

export const carBrands: CarBrand[] = [
  { id: 1, name: 'Toyota', initial: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Toyota_EU.svg/960px-Toyota_EU.svg.png', bg: 'bg-[#FFE8E8]', accent: 'bg-[#E53935]', text: 'text-[#C62828]' },
  { id: 2, name: 'BMW', initial: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/3840px-BMW.svg.png', bg: 'bg-[#E3F2FD]', accent: 'bg-[#1E88E5]', text: 'text-[#1565C0]' },
  { id: 3, name: 'Mercedes', initial: 'https://rukminim2.flixcart.com/image/480/480/kh0vonk0-0/magnet/c/j/b/cnh-00825-mercedes-logo-badges-fridge-magnet-click-n-home-original-imafx4ssen56dccy.jpeg?q=90', bg: 'bg-[#F3E5F5]', accent: 'bg-[#8E24AA]', text: 'text-[#6A1B9A]' },
  { id: 4, name: 'Nissan', initial: 'https://thumbs.dreamstime.com/b/nissan-motor-company-ltd-trading-as-nissan-motor-corporation-often-shortened-to-nissan-japanese-multinational-204759382.jpg', bg: 'bg-[#FFF3E0]', accent: 'bg-[#FB8C00]', text: 'text-[#E65100]' },
  { id: 5, name: 'Honda', initial: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpoQhRH798FL1NPyETASXUpve_UWkjNA1YBQ&s', bg: 'bg-[#E8F5E9]', accent: 'bg-[#43A047]', text: 'text-[#2E7D32]' },
  { id: 6, name: 'Hyundai', initial: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQudO8lwJk7GmXxUvigoWkRaRItLyJVBxPt-g&s', bg: 'bg-[#E0F7FA]', accent: 'bg-[#00ACC1]', text: 'text-[#00838F]' },
  { id: 7, name: 'Ford', initial: 'https://asilverliningfoundation.org/wp-content/uploads/2021/07/ford-logo.png.png', bg: 'bg-[#E8EAF6]', accent: 'bg-[#3949AB]', text: 'text-[#283593]' },
  { id: 8, name: 'Audi', initial: 'https://loodibee.com/wp-content/uploads/Audi-Logo-300x300.png', bg: 'bg-[#ECEFF1]', accent: 'bg-[#546E7A]', text: 'text-[#37474F]' },
];

export const modelsByBrand: Record<string, string[]> = {
  Toyota: ['Camry', 'Corolla', 'Land Cruiser', 'Yaris', 'RAV4', 'Hilux', 'Fortuner', 'Prado', 'Rush', 'Avalon', 'Supra', 'C-HR', 'Innova', 'Sequoia'],
  BMW: ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'M3', 'M5', 'Z4', 'iX', 'i4', '4 Series', '8 Series'],
  Mercedes: ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'AMG GT', 'EQS', 'CLA', 'GLB'],
  Nissan: ['Patrol', 'Altima', 'Sentra', 'Kicks', 'X-Trail', 'Pathfinder', 'Sunny', 'Maxima', '370Z', 'Navara', 'Juke', 'Magnite', 'Terrano', 'Qashqai'],
  Honda: ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'City', 'Jazz', 'Odyssey', 'BR-V', 'WR-V'],
  Hyundai: ['Tucson', 'Santa Fe', 'Elantra', 'Sonata', 'Creta', 'Kona', 'Palisade', 'Venue', 'Accent', 'i10', 'i20'],
  Ford: ['Mustang', 'Explorer', 'Expedition', 'Edge', 'Bronco', 'F-150', 'Ranger', 'Escape', 'EcoSport', 'Territory'],
  Audi: ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'RS5', 'e-tron', 'TT', 'RS7'],
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

export function searchVehicles(query: string): VehicleSuggestion[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
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

export function parseVehicleInput(input: string): { brand?: string; model?: string; year?: number; isBrandNew?: boolean } {
  const currentYear = 2026;
  const raw = input.trim().toLowerCase();
  let brand: string | undefined;
  let model: string | undefined;
  let year: number | undefined;
  let isBrandNew: boolean | undefined;

  // Extract relative age: "5 years old", "3 year old", "5 yr"
  const ageMatch = raw.match(/(\d+)\s*(?:years?|yrs?)\s*(?:old)?/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1]);
    if (age >= 0 && age <= 20) {
      year = currentYear - age;
    }
  }

  // Extract "brand new" / "new"
  if (/\bbrand\s*new\b/.test(raw) || /\bnew\b/.test(raw)) {
    if (!year) year = currentYear;
    isBrandNew = true;
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
    .replace(/\s+/g, ' ')
    .trim();

  // Try to match brand
  for (const b of carBrands) {
    if (cleaned.includes(b.name.toLowerCase())) {
      brand = b.name;
      const remaining = cleaned.replace(b.name.toLowerCase(), '').trim();
      if (remaining) {
        const models = modelsByBrand[b.name] ?? [];
        const match = models.find((m) => m.toLowerCase() === remaining || remaining.includes(m.toLowerCase()));
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

  return { brand, model, year, isBrandNew };
}
