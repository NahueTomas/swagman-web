import { useStore } from "@/hooks/use-store";
import { ApiExplorerTag } from "@/features/api-explorer/api-explorer-tag";

export const ApiExplorerTagList = ({ className }: { className?: string }) => {
  const tagList = useStore((state) => state.spec?.getTagList());

  return (
    <div className={className}>
      {tagList?.map((t) => <ApiExplorerTag key={t.title} tag={t} />)}
    </div>
  );
};
