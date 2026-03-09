import { XIcon } from "../icons";

import { cn } from "@/shared/utils/cn";

interface FormFieldActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action: "delete" | "add";
}

export const FormFieldActionButton = ({
  action,
  ...props
}: FormFieldActionButtonProps) => {
  return (
    <button
      className={cn(
        "p-0.5 rounded-full border",
        "text-foreground-600 border-white/[0.08]",
        "transition-[color,border-color,transform,background-color] duration-150 ease-out",
        "hover:text-primary-400 hover:border-primary-500/30 hover:bg-primary-500/[0.06] hover:scale-110",
        "active:scale-95",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100",
        props.className
      )}
      type="button"
      {...props}
    >
      {action === "delete" ? (
        <XIcon className="size-3" />
      ) : (
        <XIcon className="size-3 rotate-45" />
      )}
    </button>
  );
};
