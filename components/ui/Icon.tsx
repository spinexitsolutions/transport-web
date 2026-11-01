import {
  Anchor, Boxes, Building2, Clock, Container, Factory, Globe, Leaf, Package, PackageCheck,
  Plane, Route, Ship, ShieldCheck, Snowflake, Train, Truck, Warehouse, Zap,
  type LucideProps,
} from "lucide-react";

/** Icons selectable in the CMS. Imported explicitly so the bundle stays small. */
const ICONS = {
  Truck, Plane, Ship, Warehouse, PackageCheck, Snowflake, Train, ShieldCheck,
  Boxes, Container, Globe, Route, Zap, Leaf, Anchor, Building2, Factory, Clock,
} satisfies Record<string, React.ComponentType<LucideProps>>;

export const ICON_CHOICES = Object.keys(ICONS);

/** Render a lucide icon by its string name (names are stored in the CMS). */
export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = (ICONS as Record<string, React.ComponentType<LucideProps>>)[name] ?? Package;
  return <C {...props} />;
}
