import {
  Ban, BadgeCheck, Check, CircleCheck, CircleHelp, Construction, Inbox, Lightbulb, RotateCcw,
  Trash2, TrafficCone, TreePine, Users, Wrench,
} from "lucide-react";

const CATEGORY_ICONS = {
  STREET: Construction,
  LIGHTING: Lightbulb,
  CLEANING: Trash2,
  GREEN_AREAS: TreePine,
  TRAFFIC_LIGHT: TrafficCone,
  OTHER: CircleHelp,
};

const STATUS_ICONS = {
  REPORTED: Inbox,
  VALIDATED: BadgeCheck,
  ASSIGNED: Users,
  IN_PROGRESS: Wrench,
  RESOLVED: CircleCheck,
  CLOSED: Check,
  REOPENED: RotateCcw,
  REJECTED: Ban,
};

export const categoryIcon = (category) => CATEGORY_ICONS[category] || CircleHelp;
export const statusIcon = (status) => STATUS_ICONS[status] || Inbox;

export function CategoryIcon({ category, ...props }) {
  const Icon = categoryIcon(category);
  return <Icon aria-hidden="true" {...props} />;
}

export function StatusIcon({ status, ...props }) {
  const Icon = statusIcon(status);
  return <Icon aria-hidden="true" {...props} />;
}
