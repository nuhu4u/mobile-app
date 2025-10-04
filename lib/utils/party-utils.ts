// Party utility functions copied from web app
export interface CandidateDetails {
  id: string
  name: string
  party: string
  partyAcronym: string
  partyPicture: string
  age: number
  qualification: string
  runningMate: string
  manifesto: string
  experience: string
  education: string
  position: number
  votes: number
}

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.137.1:3001';

export const STATIC_CANDIDATES: CandidateDetails[] = [
  {
    id: "candidate-1",
    name: "Adebayo Ogundimu",
    party: "All Progressives Congress (APC)",
    partyAcronym: "APC",
    partyPicture: `${baseUrl}/party-logos/apc.webp`,
    age: 58,
    qualification: "PhD Political Science, Former Governor",
    runningMate: "Dr. Fatima Abdullahi",
    manifesto: "Building a prosperous Nigeria through economic diversification, youth empowerment, and infrastructure development. Focus on creating 10 million jobs, improving healthcare access, and strengthening our educational system.",
    experience: "Former Governor of Lagos State (2015-2023), Minister of Works (2010-2015), Senator (2007-2010). Led major infrastructure projects including the Lagos-Ibadan Expressway and Second Niger Bridge.",
    education: "PhD Political Science (University of Lagos), MBA (Harvard Business School), BSc Economics (University of Ibadan)",
    position: 1,
    votes: 0
  },
  {
    id: "candidate-2", 
    name: "Chinedu Okwu",
    party: "Peoples Democratic Party (PDP)",
    partyAcronym: "PDP",
    partyPicture: `${baseUrl}/party-logos/pdp.webp`,
    age: 62,
    qualification: "LLB, Former Senator",
    runningMate: "Prof. Amina Hassan",
    manifesto: "Restoring Nigeria's greatness through good governance, transparency, and inclusive development. Priority on fighting corruption, improving security, and ensuring every Nigerian has access to quality education and healthcare.",
    experience: "Former Senator (2011-2019), Minister of Justice (2007-2010), Attorney General of Rivers State (2003-2007). Championed several anti-corruption bills and judicial reforms.",
    education: "LLB Law (University of Nigeria), LLM International Law (London School of Economics), Called to the Nigerian Bar (1985)",
    position: 2,
    votes: 0
  },
  {
    id: "candidate-3",
    name: "Ibrahim Musa", 
    party: "Labour Party (LP)",
    partyAcronym: "LP",
    partyPicture: `${baseUrl}/party-logos/labour-party.jpg`,
    age: 55,
    qualification: "MBA, Business Executive",
    runningMate: "Mrs. Grace Okafor",
    manifesto: "A new Nigeria for all - focusing on workers' rights, social justice, and economic equality. Committed to minimum wage increases, better working conditions, and reducing the gap between rich and poor.",
    experience: "CEO of major manufacturing company (2010-2023), Former President of Manufacturers Association of Nigeria (2018-2021), Trade Union Leader (1995-2010). Created over 50,000 jobs in manufacturing sector.",
    education: "MBA Business Administration (University of Manchester), BSc Mechanical Engineering (Ahmadu Bello University), Professional Certifications in Management",
    position: 3,
    votes: 0
  },
  {
    id: "candidate-4",
    name: "Funmilayo Adeyemi",
    party: "New Nigeria Peoples Party (NNPP)", 
    partyAcronym: "NNPP",
    partyPicture: `${baseUrl}/party-logos/nnpp.jpg`,
    age: 51,
    qualification: "MSc Economics, Former Minister",
    runningMate: "Alhaji Suleiman Bello",
    manifesto: "Transforming Nigeria through innovation, technology, and sustainable development. Focus on digital economy, renewable energy, and creating opportunities for women and youth in leadership.",
    experience: "Former Minister of Science and Technology (2019-2023), Director General of National Information Technology Development Agency (2015-2019), Tech Entrepreneur (2005-2015). Led Nigeria's digital transformation initiatives.",
    education: "MSc Economics (University of Cambridge), BSc Computer Science (University of Lagos), Executive Education (MIT Sloan), PhD in Progress (Innovation Management)",
    position: 4,
    votes: 0
  }
]

// Helper function to get candidate by ID
export const getCandidateById = (id: string): CandidateDetails | undefined => {
  return STATIC_CANDIDATES.find(candidate => candidate.id === id)
}

// Helper function to get candidates by party
export const getCandidatesByParty = (party: string): CandidateDetails[] => {
  return STATIC_CANDIDATES.filter(candidate => 
    candidate.party.toLowerCase().includes(party.toLowerCase()) ||
    candidate.partyAcronym.toLowerCase() === party.toLowerCase()
  )
}

// Helper function to get all candidates
export const getAllCandidates = (): CandidateDetails[] => {
  return STATIC_CANDIDATES
}

// Helper function to get party picture by party name or party ID
export const getPartyPicture = (partyInfo: string | { name?: string; id?: string; acronym?: string }): string => {
  console.log('🎨 getPartyPicture called with party info:', partyInfo);
  
  if (!partyInfo) {
    console.log('🎨 No party info provided, using placeholder');
    return 'https://via.placeholder.com/100x100/cccccc/666666?text=Party';
  }
  
  // Handle both string and object inputs
  let partyName = '';
  if (typeof partyInfo === 'string') {
    partyName = partyInfo.toLowerCase();
  } else if (typeof partyInfo === 'object') {
    partyName = (partyInfo.name || partyInfo.acronym || '').toLowerCase();
  }
  
  console.log('🎨 Normalized party name:', partyName);
  
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.137.1:3001';
  
  // Match by party name/acronym to get the correct party picture
  if (partyName.includes('apc') || partyName.includes('all progressives congress')) {
    const url = `${baseUrl}/party-logos/apc.webp`;
    console.log('🎨 Matched APC, returning:', url);
    return url;
  } else if (partyName.includes('pdp') || partyName.includes('peoples democratic party')) {
    const url = `${baseUrl}/party-logos/pdp.webp`;
    console.log('🎨 Matched PDP, returning:', url);
    return url;
  } else if (partyName.includes('lp') || partyName.includes('labour party')) {
    const url = `${baseUrl}/party-logos/labour-party.jpg`;
    console.log('🎨 Matched LP, returning:', url);
    return url;
  } else if (partyName.includes('nnpp') || partyName.includes('new nigeria peoples party')) {
    const url = `${baseUrl}/party-logos/nnpp.jpg`;
    console.log('🎨 Matched NNPP, returning:', url);
    return url;
  }
  
  console.log('🎨 No party match found, using placeholder');
  return 'https://via.placeholder.com/100x100/cccccc/666666?text=Party';
}

// Helper function to get party picture with candidate name fallback
export const getPartyPictureWithFallback = (candidateName: string, partyName: string): string => {
  console.log('🎨 getPartyPictureWithFallback called with:', { candidateName, partyName });
  
  // Handle "Independent" party by using candidate name fallback immediately
  if (partyName && partyName.toLowerCase().includes('independent')) {
    console.log('🎨 Detected Independent party, using candidate name fallback...');
    return getPartyPictureByCandidateName(candidateName);
  }
  
  // First try to match by party name
  const partyPicture = getPartyPicture(partyName);
  
  // If party matched and it's not a placeholder, return it
  if (!partyPicture.includes('placeholder')) {
    console.log('🎨 Party matched successfully:', partyPicture);
    return partyPicture;
  }
  
  // If party didn't match, try to match by candidate name
  console.log('🎨 Party did not match, trying candidate name fallback...');
  return getPartyPictureByCandidateName(candidateName);
}

// Helper function to get party picture by candidate name
const getPartyPictureByCandidateName = (candidateName: string): string => {
  if (!candidateName) {
    console.log('🎨 No candidate name provided for fallback');
    return 'https://via.placeholder.com/100x100/cccccc/666666?text=Party';
  }
  
  const name = candidateName.toLowerCase();
  console.log('🎨 Normalized candidate name for fallback:', name);
  
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.137.1:3001';
  
  // Match by candidate name to get their specific party picture
  if (name.includes('adebayo') || name.includes('ogundimu')) {
    const url = `${baseUrl}/party-logos/apc.webp`;
    console.log('🎨 Fallback matched Adebayo Ogundimu (APC), returning:', url);
    return url;
  } else if (name.includes('chinedu') || name.includes('okwu')) {
    const url = `${baseUrl}/party-logos/pdp.webp`;
    console.log('🎨 Fallback matched Chinedu Okwu (PDP), returning:', url);
    return url;
  } else if (name.includes('ibrahim') || name.includes('musa')) {
    const url = `${baseUrl}/party-logos/labour-party.jpg`;
    console.log('🎨 Fallback matched Ibrahim Musa (LP), returning:', url);
    return url;
  } else if (name.includes('funmilayo') || name.includes('adeyemi')) {
    const url = `${baseUrl}/party-logos/nnpp.jpg`;
    console.log('🎨 Fallback matched Funmilayo Adeyemi (NNPP), returning:', url);
    return url;
  }
  
  console.log('🎨 No candidate fallback match found, using placeholder');
  return 'https://via.placeholder.com/100x100/cccccc/666666?text=Party';
}

// Helper function to get party name with candidate name fallback
export const getPartyNameWithFallback = (candidateName: string, partyName: string): string => {
  console.log('🎨 getPartyNameWithFallback called with:', { candidateName, partyName });
  
  // If party name exists and is not "Independent", return it
  if (partyName && !partyName.toLowerCase().includes('independent') && partyName.trim() !== '') {
    console.log('🎨 Using provided party name:', partyName);
    return partyName;
  }
  
  // Use candidate name to determine party
  if (!candidateName) {
    console.log('🎨 No candidate name provided for party fallback');
    return 'Unknown Party';
  }
  
  const name = candidateName.toLowerCase();
  console.log('🎨 Using candidate name for party fallback:', name);
  
  if (name.includes('adebayo') || name.includes('ogundimu')) {
    console.log('🎨 Fallback matched Adebayo Ogundimu (APC)');
    return 'All Progressives Congress (APC)';
  } else if (name.includes('chinedu') || name.includes('okwu')) {
    console.log('🎨 Fallback matched Chinedu Okwu (PDP)');
    return 'Peoples Democratic Party (PDP)';
  } else if (name.includes('ibrahim') || name.includes('musa')) {
    console.log('🎨 Fallback matched Ibrahim Musa (LP)');
    return 'Labour Party (LP)';
  } else if (name.includes('funmilayo') || name.includes('adeyemi')) {
    console.log('🎨 Fallback matched Funmilayo Adeyemi (NNPP)');
    return 'New Nigeria Peoples Party (NNPP)';
  }
  
  console.log('🎨 No candidate fallback match found, using Unknown Party');
  return 'Unknown Party';
}
