import React from 'react';
import {
  ShoppingCart,
  Home,
  Zap,
  Car,
  Baby,
  HeartPulse,
  UtensilsCrossed,
  ShoppingBag,
  Film,
  Sparkles,
  Shield,
  TrendingUp,
  Briefcase,
  Coins,
  PieChart,
  Landmark,
  Wallet,
  Smartphone,
  Tag,
  CreditCard,
  Building2,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  ShoppingCart,
  Home,
  Zap,
  Car,
  Baby,
  HeartPulse,
  Utensils: UtensilsCrossed,
  UtensilsCrossed,
  ShoppingBag,
  Film,
  Sparkles,
  ShieldCheck: Shield,
  Shield,
  TrendingUp,
  Briefcase,
  Coins,
  PieChart,
  Landmark,
  Wallet,
  Smartphone,
  CreditCard,
  Building2,
  Tag,
};

interface CategoryIconProps {
  name?: string;
  className?: string;
  size?: number;
}

export function CategoryIcon({ name = 'Tag', className = 'w-4 h-4', size = 16 }: CategoryIconProps) {
  const IconComponent = ICON_MAP[name] || Tag;
  return <IconComponent className={className} size={size} strokeWidth={1.8} />;
}
