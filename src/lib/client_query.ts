import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      structuralSharing: true,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
