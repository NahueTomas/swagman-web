import { useStore } from "@/hooks/use-store";
import { Tag } from "@/components/tag";

export const SidebarTagList = ({ className }: { className?: string }) => {
  const tagList = useStore((state) => state.spec?.getTagList());

  return (
    <div className={className}>
      {tagList?.map((t) => <Tag key={t.title} tag={t} />)}
    </div>
  );
};
