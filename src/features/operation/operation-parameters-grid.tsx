import { Subtitle } from "@/shared/components/subtitle";

export const OperationParametersGrid = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  return (
    <div className="space-y-2">
      <Subtitle as="p" size="micro">
        {title}
      </Subtitle>

      <div className="rounded-lg border border-white/[0.05] overflow-x-auto overflow-y-hidden">
        <table className="w-full text-left border-collapse table-fixed min-w-[360px]">
          <thead>
            <tr className="border-b border-white/[0.05] h-8 bg-white/[0.02]">
              {/* Checkbox — always visible */}
              <th className="px-2 w-8" scope="col" />
              {/* Name — always visible */}
              <th className="px-2 w-1/5 max-w-24" scope="col">
                <Subtitle as="span" size="micro">
                  Name
                </Subtitle>
              </th>
              {/* Value — always visible */}
              <th className="pl-5 pr-2 w-1/4" scope="col">
                <Subtitle as="span" size="micro">
                  Value
                </Subtitle>
              </th>
              {/* Type — hidden below md */}
              <th className="px-2 hidden md:table-cell w-28" scope="col">
                <Subtitle as="span" size="micro">
                  Type
                </Subtitle>
              </th>
              {/* Explode — hidden below md */}
              <th className="px-2 hidden md:table-cell w-28" scope="col">
                <Subtitle as="span" size="micro">
                  Explode
                </Subtitle>
              </th>
              {/* Description — hidden below lg */}
              <th className="px-2 hidden lg:table-cell w-auto" scope="col">
                <Subtitle as="span" size="micro">
                  Description
                </Subtitle>
              </th>
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
};
