// Styles for select
export const selectStyles = {
  button: {
    normal: `
      w-full px-3 py-2 
      text-sm text-left
      bg-content1 
      border border-divider
      rounded-full
      transition-all duration-200 
      hover:bg-content2
      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
      disabled:cursor-not-allowed
      disabled:opacity-70
    `,
    small: `
      w-full px-2 py-1.5 
      text-xs text-left
      bg-content1/50 
      border border-divider
      rounded-full
      transition-all duration-200 
      hover:bg-content2
      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
      disabled:cursor-not-allowed
      disabled:opacity-70
    `,
  },
  dropdown: `
    absolute z-10 w-full mt-1
    bg-content1
    border border-divider
    rounded-lg shadow-lg
    overflow-auto max-h-60
    focus:outline-none
  `,
  item: {
    normal: `
      w-full px-3 py-2 
      text-sm
      hover:bg-content2
      cursor-pointer
      transition-colors duration-150
    `,
    small: `
      w-full px-2 py-1.5 
      text-xs
      hover:bg-content2
      cursor-pointer
      transition-colors duration-150
    `,
  },
  selected: {
    normal: `
      bg-content2
    `,
    small: `
      bg-content2
    `,
  },
};
