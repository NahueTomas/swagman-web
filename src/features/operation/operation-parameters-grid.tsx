export const OperationParametersGrid = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-foreground-600">
        {title}
      </p>

      <div className="rounded-lg border border-white/[0.07] overflow-x-auto overflow-y-hidden">
        <table className="w-full text-left border-collapse table-fixed min-w-[360px]">
          <thead>
            <tr className="border-b border-white/[0.07] h-8 bg-background-500/20">
              {/* Checkbox — always visible */}
              <th className="px-2 w-8" />
              {/* Name — always visible */}
              <th className="px-2 w-1/5 max-w-24">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground-600">
                  Name
                </span>
              </th>
              {/* Value — always visible */}
              <th className="pl-5 pr-2 w-1/4">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground-600">
                  Value
                </span>
              </th>
              {/* Type — hidden below md */}
              <th className="px-2 hidden md:table-cell w-24">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground-600">
                  Type
                </span>
              </th>
              {/* Explode — hidden below md */}
              <th className="px-2 hidden md:table-cell w-24">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground-600">
                  Explode
                </span>
              </th>
              {/* Description — hidden below lg */}
              <th className="px-2 hidden lg:table-cell w-auto">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground-600">
                  Description
                </span>
              </th>
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
};
