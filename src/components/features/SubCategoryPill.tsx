import { Pill } from '@/components/ui/Pill';
import { getIcon } from '@/constants/icons';
import type { SubCategory } from '@/types';

interface SubCategoryPillProps {
  subcategory: SubCategory;
  active?: boolean;
  onClick?: () => void;
}

export function SubCategoryPill({ subcategory, active, onClick }: SubCategoryPillProps) {
  const IconComponent = getIcon(subcategory.icon);
  const color = subcategory.color;

  return (
    <Pill
      label={subcategory.name}
      icon={<IconComponent className="w-4 h-4" />}
      active={active}
      color={color}
      onClick={onClick}
    />
  );
}