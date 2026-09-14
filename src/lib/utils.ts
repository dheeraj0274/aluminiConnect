export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function calculateProfileCompletion(profile: Record<string, unknown>): number {
  const weights: Record<string, number> = {
    basic: 20,
    education: 20,
    professional: 25,
    skills: 15,
    profilePhoto: 10,
    socialLinks: 10,
  };

  let completion = 0;

  // Basic info
  if (profile.fullName && profile.email && profile.phone && profile.currentCity) {
    completion += weights.basic;
  } else {
    const basicFields = ['fullName', 'email', 'phone', 'currentCity', 'currentCountry'];
    const filledBasic = basicFields.filter(f => profile[f]).length;
    completion += Math.floor((filledBasic / basicFields.length) * weights.basic);
  }

  // Education
  if (profile.degree && profile.department && profile.graduationYear) {
    completion += weights.education;
  } else {
    const eduFields = ['degree', 'department', 'graduationYear'];
    const filledEdu = eduFields.filter(f => profile[f]).length;
    completion += Math.floor((filledEdu / eduFields.length) * weights.education);
  }

  // Professional
  if (profile.jobTitle && profile.company && profile.industry) {
    completion += weights.professional;
  } else {
    const proFields = ['jobTitle', 'company', 'industry', 'yearsOfExperience'];
    const filledPro = proFields.filter(f => profile[f]).length;
    completion += Math.floor((filledPro / proFields.length) * weights.professional);
  }

  // Skills
  if (Array.isArray(profile.skills) && profile.skills.length > 0) {
    completion += weights.skills;
  }

  // Profile photo
  if (profile.profilePhoto) {
    completion += weights.profilePhoto;
  }

  // Social links
  if (profile.linkedIn || profile.github || profile.portfolio) {
    completion += weights.socialLinks;
  }

  return Math.min(completion, 100);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
