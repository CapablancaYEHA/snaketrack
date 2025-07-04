export const cuteScrollHoris = (start: number) => `
  overflow-x: auto;
  top: auto !important;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
  &::-webkit-scrollbar-track-piece:start {
    background-color: transparent;
    margin-left: ${start}px;
  }
  &::-webkit-scrollbar-track-piece:end {
    background-color: transparent;
  }
  &::-webkit-scrollbar-corner {
    border-radius: 4px;
    width: 6px;
    height: 6px;
    background-color: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--mantine-color-yellow-8);
    border-radius: 4px;
  }`;
