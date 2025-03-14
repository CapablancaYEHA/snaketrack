import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000,
      structuralSharing: true,
      refetchOnWindowFocus: false,
      retry: 1,
      //   refetchOnWindowFocus: false,
      //   staleTime: Infinity,
      //   gcTime: Infinity,
    },
  },
});
