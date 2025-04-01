import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20 * 1000,
      structuralSharing: true,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
