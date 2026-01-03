import { useState, useId } from "react";
import { useNavigate } from "react-router-dom";

import { Dropdown } from "@/shared/components/dropdown";
import { SendIcon } from "@/shared/components/icons";
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
        <p
          className="flex-1 text-xxs text-foreground-500 font-black flex items-center justify-center gap-2 p-2 rounded-md uppercase
        bg-background-500 hover:bg-background-400 hover:text-foreground-100 
          border border-transparent hover:border-white/15 transition-all duration-200"
        >
          Change Specification
        </p>
      }
    >
      <div className="flex flex-col gap-2 p-1">
        <button
          className="flex items-center gap-3 px-3 py-2 rounded bg-primary-500/5 hover:bg-primary-500/10 text-xs text-center 
                     text-primary-400 transition-all border border-primary-500/10 group w-full"
          onClick={handleLocal}
        >
          WINDOW.LOCAL_SPEC
        </button>

        <div className="h-px bg-white/10 my-1" />

        <div className="flex flex-col gap-1.5 px-1 pb-1">
          <label
            className="text-[9px] font-black uppercase tracking-widest text-foreground-600"
            htmlFor={urlInputId}
          >
            External Redirect
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
