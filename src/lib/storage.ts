// Local storage management for offline data
export interface Proposal {
  id: string;
  acronym: string;
  programme: string;
  call: string;
  type: string;
  fundedPercent: number;
  deadline: string;
  isGranted: boolean;
  durationMonths?: number;
  startDate?: string;
  extensionMonths?: number;
  isCompleted?: boolean;
  totalBudget: number;
  phixBudget: number;
  projectApplication: string;
  wavelengths: string[];
  picPlatform: string;
  phixRole: string;
  phixProcesses: string[];
  partners: Array<{ name: string; country: string }>;
  participants: Array<{
    department: string;
    street: string;
    town: string;
    postcode: string;
    country: string;
  }>;
  mainContact: {
    title: string;
    gender: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    department: string;
    address: string;
    phone: string;
  };
  otherContacts: Array<{
    title: string;
    gender: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    department: string;
    address: string;
    phone: string;
  }>;
  researchers: Array<{
    title: string;
    name: string;
    gender: string;
    nationality: string;
    email: string;
    careerStage: string;
    role: string;
    identifierType: string;
    identifier: string;
  }>;
  rolesInProject: string[];
  phixOrgRoles: string[];
  selectedPeople: Array<{ personId: string; role: string }>;
  publications: string[];
  relatedProjects: string[];
  infrastructure: string[];
  organizations: string[];
  personnelInvolvement: string[];
  exploitation: string[];
  companyDescription: string[];
  workPackages: Array<{
    number: string;
    description: string;
    leadPartner: string;
    involvedPartners: string[];
    phixPersonMonths: number;
    personMonthRate: number;
    otherCosts: Array<{ description: string; value: number }>;
    travelCosts: Array<{ description: string; value: number }>;
    tasks: Array<{
      name: string;
      durationMonths: number;
      deliverable: string;
      milestone: string;
      risk: string;
      mitigation: string;
    }>;
  }>;
}

export interface Project {
  id: string;
  name: string;
  call: string;
  website: string;
  shortDescription: string;
  status: 'Ongoing' | 'Completed';
}

export interface Process {
  id: string;
  name: string;
  description: string;
}

export interface Publication {
  id: string;
  title: string;
  metadata: string;
}

export interface Infrastructure {
  id: string;
  name: string;
  description: string;
}

export interface Person {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  gender: string;
  nationality: string;
  careerStage: string;
}

export interface Organization {
  id: string;
  legalName: string;
  shortName: string;
  picNumber: string;
  departments: Array<{
    name: string;
    street: string;
    town: string;
    postcode: string;
    country: string;
  }>;
}

export interface PersonnelInvolvement {
  id: string;
  mainContact: {
    title: string;
    gender: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    department: string;
    street: string;
    town: string;
    postcode: string;
    country: string;
    phone: string;
  };
  otherContacts: Array<{
    title: string;
    gender: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    department: string;
    street: string;
    town: string;
    postcode: string;
    country: string;
    phone: string;
  }>;
}

export interface Exploitation {
  id: string;
  name: string;
  description: string;
  targetedEndUsers: string;
  competitors: string;
  marketOverview: string;
  valueProposition: string;
  commercializationMeasures: string;
  additionalSupport: string;
  expectedRevenues: string;
}

export interface CompanyDescription {
  id: string;
  description: string;
}


const STORAGE_KEYS = {
  proposals: 'phixforge_proposals',
  projects: 'phixforge_projects',
  processes: 'phixforge_processes',
  publications: 'phixforge_publications',
  infrastructure: 'phixforge_infrastructure',
  people: 'phixforge_people',
  organizations: 'phixforge_organizations',
  customProgrammes: 'phixforge_custom_programmes',
  personnelInvolvement: 'phixforge_personnel_involvement',
  exploitation: 'phixforge_exploitation',
  companyDescription: 'phixforge_company_description',
};

export const storage = {
  get: <T>(key: keyof typeof STORAGE_KEYS): T[] => {
    const data = localStorage.getItem(STORAGE_KEYS[key]);
    return data ? JSON.parse(data) : [];
  },

  set: <T>(key: keyof typeof STORAGE_KEYS, data: T[]): void => {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  },

  exportAll: () => {
    const allData = {
      proposals: storage.get<Proposal>('proposals'),
      projects: storage.get<Project>('projects'),
      processes: storage.get<Process>('processes'),
      publications: storage.get<Publication>('publications'),
      infrastructure: storage.get<Infrastructure>('infrastructure'),
      people: storage.get<Person>('people'),
      organizations: storage.get<Organization>('organizations'),
      customProgrammes: storage.get<string>('customProgrammes'),
      personnelInvolvement: storage.get<PersonnelInvolvement>('personnelInvolvement'),
      exploitation: storage.get<Exploitation>('exploitation'),
      companyDescription: storage.get<CompanyDescription>('companyDescription'),
    };
    return JSON.stringify(allData, null, 2);
  },

  importAll: (jsonString: string) => {
    try {
      const allData = JSON.parse(jsonString);
      Object.keys(STORAGE_KEYS).forEach((key) => {
        if (allData[key]) {
          storage.set(key as keyof typeof STORAGE_KEYS, allData[key]);
        }
      });
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  },
};
