const UNIVERSITY_SLUGS: Record<string, string> = {
  'uct': 'University of Cape Town',
  'wits': 'University of the Witwatersrand',
  'uj': 'University of Johannesburg',
  'up': 'University of Pretoria',
  'stellenbosch': 'Stellenbosch University',
  'ukzn': 'University of KwaZulu-Natal',
  'rhodes': 'Rhodes University',
  'nwu': 'North-West University',
  'tut': 'Tshwane University of Technology',
  'cput': 'Cape Peninsula University of Technology',
  'dut': 'Durban University of Technology',
  'uwc': 'University of the Western Cape',
  'ufh': 'University of Fort Hare',
  'ufs': 'University of the Free State',
  'unizulu': 'University of Zululand',
  'wsu': 'Walter Sisulu University',
  'nmu': 'Nelson Mandela University',
  'mut': 'Mangosuthu University of Technology',
  'spu': 'Sol Plaatje University',
  'unisa': 'University of South Africa (UNISA)',
  'cut': 'Central University of Technology',
  'vut': 'Vaal University of Technology',
  'ul': 'University of Limpopo',
  'ump': 'University of Mpumalanga',
  'smu': 'Sefako Makgatho Health Sciences University',
};

const REVERSE_UNI_SLUGS: Record<string, string> = {};
Object.entries(UNIVERSITY_SLUGS).forEach(([slug, name]) => {
  REVERSE_UNI_SLUGS[name.toLowerCase()] = slug;
});

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function deslugify(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getUniversityFromSlug(slug: string): string | null {
  if (UNIVERSITY_SLUGS[slug]) return UNIVERSITY_SLUGS[slug];
  for (const [, name] of Object.entries(UNIVERSITY_SLUGS)) {
    if (slugify(name) === slug) return name;
  }
  return null;
}

export function getUniversitySlug(universityName: string): string {
  const key = universityName.toLowerCase();
  if (REVERSE_UNI_SLUGS[key]) return REVERSE_UNI_SLUGS[key];
  return slugify(universityName);
}

export function buildListingUrl(city: string, university: string, propertyName: string, id?: string): string {
  const citySlug = slugify(city || 'south-africa');
  const uniSlug = university ? getUniversitySlug(university) : 'all';
  const propSlug = slugify(propertyName);
  // Separate property name and ID with a slash as requested
  const idPath = id ? `/${id.replace(/-/g, '').slice(0, 8)}` : '';
  return `/student-accommodation/${citySlug}/${uniSlug}/${propSlug}${idPath}`;
}

export function buildBrowseUrl(city?: string, university?: string): string {
  const parts = ['/student-accommodation'];
  if (city) parts.push(slugify(city));
  if (university) {
    if (!city) parts.push('all');
    parts.push(getUniversitySlug(university));
  }
  return parts.join('/');
}
