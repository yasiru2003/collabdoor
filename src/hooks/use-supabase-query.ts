
// This file now serves as a central export point for all query hooks
// to maintain backward compatibility with existing code

export {
  useProjects,
  useProject,
  useUserProjects,
  useSavedProjects,
} from "./use-projects-query";

export {
  usePartners,
  usePartnerships,
} from "./use-organizations-query";

export {
  useMessages,
  useConversation,
} from "./use-messages-query";

export {
  useProjectApplications,
  useUserApplications,
} from "./use-applications-query";
