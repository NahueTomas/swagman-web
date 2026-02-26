import { useState, useId } from "react";
import { useNavigate } from "react-router-dom";

import { Dropdown } from "@/shared/components/dropdown";
import { ActionButton } from "@/shared/components/action-button";
import { SendIcon, ChevronDownIcon } from "@/shared/components/icons";
import { escapeUrl } from "@/shared/utils/helpers";
import { ROUTES } from "@/shared/constants/constants";
import { FormFieldText } from "@/shared/components/form-field-text";

export const QuickNav = () => {
  const [url, setUrl] = useState("");
  const urlInputId = useId();

  const navigate = useNavigate();

  const handleGo = () => {
    if (url.trim()) {
      navigate(`/${escapeUrl(url)}`);
    }
  };

  const handleLocal = () => {
    navigate(ROUTES.APP);
  };

  return (
    <Dropdown
      className="w-full"
      trigger={
        <ActionButton
          className="w-full text-foreground-400 justify-between px-3"
          label="Change Specification"
          size="md"
          variant="default"
        >
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </ActionButton>
      }
    >
      <div className="flex flex-col gap-2 p-1">
        <button
          className="px-3 py-2 rounded bg-primary-500/5 hover:bg-primary-500/10 text-xs text-center 
                     text-primary-400 transition-all border border-primary-500/10 group w-full"
          onClick={handleLocal}
        >
          Go to local
        </button>

        <div className="h-px bg-white/10 my-1" />

        <div className="flex flex-col gap-2 px-1 pb-1">
          <label
            className="text-xs font-semibold text-foreground-500"
            htmlFor={urlInputId}
          >
            Use a custom URL
          </label>
          <div className="flex gap-1">
            <FormFieldText
              placeholder="https://api.example.com/openapi.json"
              value={url}
              onChange={(value) => typeof value === "string" && setUrl(value)}
            />
            <button
              className="px-2 bg-primary-500 hover:bg-primary-600 text-background-900 rounded transition-colors"
              type="button"
              onClick={handleGo}
            >
              <SendIcon className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Dropdown>
  );
};
