import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export enum CodeViewerLanguage {
  JSON = "JSON",
  XML = "XML",
  TEXT = "TEXT",
}

export enum CodeLanguage {
  JSON = "JSON",
  XML = "XML",
  TEXT = "TEXT",
}
