
import { Project, Organization, User } from "@/types";

// Mock users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://source.unsplash.com/random/100×100/?portrait&user=1",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "https://source.unsplash.com/random/100×100/?portrait&user=2",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert@example.com",
    avatar: "https://source.unsplash.com/random/100×100/?portrait&user=3",
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah@example.com",
    avatar: "https://source.unsplash.com/random/100×100/?portrait&user=4",
  },
  {
    id: "5",
    name: "Michael Brown",
    email: "michael@example.com",
    avatar: "https://source.unsplash.com/random/100×100/?portrait&user=5",
  }
];

// Mock organizations
export const mockOrganizations: Organization[] = [
  {
    id: "1",
    name: "Tech Solutions Inc.",
    description: "A leading provider of innovative technology solutions.",
    industry: "Technology",
    location: "San Francisco, CA",
    size: "50-100",
    founded_year: 2010,
    website: "https://techsolutions.example.com",
    logo: "https://source.unsplash.com/random/200×200/?tech&1",
    owner_id: "1",
    status: "active"
  },
  {
    id: "2",
    name: "Green Earth Foundation",
    description: "Working towards a sustainable future for our planet.",
    industry: "Environmental",
    location: "Portland, OR",
    size: "20-50",
    founded_year: 2015,
    website: "https://greenearth.example.org",
    logo: "https://source.unsplash.com/random/200×200/?nature&1",
    owner_id: "2",
    status: "active"
  },
  {
    id: "3",
    name: "Community Builders Association",
    description: "Building stronger communities through volunteer initiatives.",
    industry: "Non-profit",
    location: "Chicago, IL",
    size: "10-20",
    founded_year: 2018,
    website: "https://communitybuilders.example.org",
    logo: "https://source.unsplash.com/random/200×200/?community&1",
    owner_id: "3",
    status: "active"
  },
  {
    id: "4",
    name: "Future Education Group",
    description: "Revolutionizing education for the next generation.",
    industry: "Education",
    location: "Boston, MA",
    size: "100-200",
    founded_year: 2005,
    website: "https://futureedu.example.com",
    logo: "https://source.unsplash.com/random/200×200/?education&1",
    owner_id: "4",
    status: "active"
  },
  {
    id: "5",
    name: "Health For All Initiative",
    description: "Providing accessible healthcare solutions worldwide.",
    industry: "Healthcare",
    location: "New York, NY",
    size: "50-100",
    founded_year: 2012,
    website: "https://healthforall.example.org",
    logo: "https://source.unsplash.com/random/200×200/?health&1",
    owner_id: "5",
    status: "active"
  },
  {
    id: "6",
    name: "Urban Development Partners",
    description: "Creating sustainable urban spaces for future generations.",
    industry: "Construction & Development",
    location: "Denver, CO",
    size: "20-50",
    founded_year: 2014,
    website: "https://urbandevelopment.example.com",
    logo: "https://source.unsplash.com/random/200×200/?city&1",
    owner_id: "1",
    status: "active"
  }
];

// Mock projects
export const mockProjects: Project[] = [
  {
    id: "1",
    title: "Community Garden Revitalization",
    description: "Transforming abandoned urban spaces into thriving community gardens that provide fresh produce and green spaces for local residents.",
    image: "https://source.unsplash.com/random/800×600/?garden&1",
    category: "Environment",
    location: "Portland, OR",
    status: "published",
    organizer_id: "2",
    organization_id: "2",
    organization_name: "Green Earth Foundation",
    created_at: "2023-01-15T10:30:00Z",
    partnership_types: ["skilled", "volunteering"],
    applications_enabled: true
  },
  {
    id: "2",
    title: "Tech Literacy for Seniors",
    description: "Teaching essential digital skills to senior citizens, helping them connect with family, access services, and participate in the modern digital world.",
    image: "https://source.unsplash.com/random/800×600/?seniors&tech&1",
    category: "Education",
    location: "San Francisco, CA",
    status: "in-progress",
    organizer_id: "1",
    organization_id: "1",
    organization_name: "Tech Solutions Inc.",
    created_at: "2023-02-20T09:15:00Z",
    partnership_types: ["knowledge", "volunteering"],
    applications_enabled: false
  },
  {
    id: "3",
    title: "Youth Mentorship Program",
    description: "Connecting at-risk youth with professional mentors who provide guidance, support, and career development opportunities.",
    image: "https://source.unsplash.com/random/800×600/?youth&mentorship&1",
    category: "Education",
    location: "Chicago, IL",
    status: "published",
    organizer_id: "3",
    organization_id: "3",
    organization_name: "Community Builders Association",
    created_at: "2023-03-05T14:45:00Z",
    partnership_types: ["monetary", "knowledge"],
    applications_enabled: true
  },
  {
    id: "4",
    title: "Clean Water Initiative",
    description: "Implementing sustainable water filtration systems in underserved communities to provide clean, safe drinking water.",
    image: "https://source.unsplash.com/random/800×600/?water&1",
    category: "Environment",
    location: "Boston, MA",
    status: "draft",
    organizer_id: "4",
    organization_id: "4",
    organization_name: "Future Education Group",
    created_at: "2023-04-10T11:20:00Z",
    partnership_types: ["monetary", "skilled"],
    applications_enabled: false
  },
  {
    id: "5",
    title: "Mobile Healthcare Clinic",
    description: "Bringing essential healthcare services to remote and underserved communities through a fully-equipped mobile clinic.",
    image: "https://source.unsplash.com/random/800×600/?healthcare&1",
    category: "Healthcare",
    location: "New York, NY",
    status: "completed",
    organizer_id: "5",
    organization_id: "5",
    organization_name: "Health For All Initiative",
    created_at: "2023-05-15T13:30:00Z",
    completed_at: "2023-10-15T13:30:00Z",
    partnership_types: ["monetary", "skilled", "volunteering"],
    applications_enabled: false
  }
];

// Automatically generate both camelCase and snake_case versions for compatibility
mockProjects.forEach(project => {
  project.organizerId = project.organizer_id;
  project.organizationId = project.organization_id;
  project.organizationName = project.organization_name;
  project.partnershipTypes = project.partnership_types;
  project.applicationsEnabled = project.applications_enabled;
  if (project.completed_at) {
    project.completedAt = project.completed_at;
  }
});
