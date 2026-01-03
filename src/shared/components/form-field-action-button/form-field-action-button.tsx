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
        "p-0.5 text-foreground-500 transition-colors border border-foreground-700 rounded-full hover:text-primary-500 hover:border-primary-500 disabled:cursor-not-allowed",
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
