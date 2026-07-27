import { LucideIcon, LucideProps } from 'lucide-react';

export interface IconProps extends Omit<LucideProps, "size" | "strokeWidth"> {
  icon: LucideIcon;
}

export function Icon({ icon: IconComponent, className, ...props }: IconProps) {
  return (
    <IconComponent 
      size={20} 
      strokeWidth={2} 
      className={className} 
      {...props} 
    />
  );
}
