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

      <div className="border-b border-t border-divider">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="border-b border-divider h-9">
              {/* Set explicit widths for small columns, let others flex */}
              <th className="w-10 px-3 py-1" />
              <th className="w-1/5 max-w-24 px-3 py-1">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-foreground-600">
                  Name
                </span>
              </th>
              <th className="w-1/4 px-3 py-1">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-foreground-600">
                  Value
                </span>
              </th>
              <th className="w-24 px-3 py-1">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-foreground-600">
                  Type
                </span>
              </th>
              <th className="w-24 px-3 py-1">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-foreground-600">
                  Explode
                </span>
              </th>
              <th className="w-auto px-3 py-1">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-foreground-600">
                  Description
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider/50">{children}</tbody>
        </table>
      </div>
    </div>
  );
};
