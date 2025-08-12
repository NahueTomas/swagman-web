// Styles for select
export const selectStyles = {
  button: {
    normal: `
      w-full px-3 py-2 
      text-sm text-left
      rounded-lg
      transition-all duration-200 
      border-medium border-default-200
      hover:border-default-400
      focus:border-default-foreground
      disabled:cursor-not-allowed
      disabled:opacity-70
    `,
    small: `
      w-full px-2 py-1.5 
      text-xs text-left
      rounded-lg
      transition-all duration-200 
      border-medium border-default-200
      hover:border-default-400
      focus:border-default-foreground
      disabled:cursor-not-allowed
      disabled:opacity-70
    `,
  },
  dropdown: `
    absolute z-10 w-full mt-1
    border-medium border-default-200
    group-data-[focus=true]:border-default-foreground
    rounded-lg shadow-lg
    overflow-auto max-h-60
    focus:outline-none
  `,
  item: {
    normal: `
      w-full px-3 py-2 
      text-sm
      cursor-pointer
      transition-colors duration-150
    `,
    small: `
      w-full px-2 py-1.5 
      text-xs
      cursor-pointer
      transition-colors duration-150
    `,
  },
  selected: {
    normal: `bg-content1`,
    small: `bg-content1`,
  },
};
