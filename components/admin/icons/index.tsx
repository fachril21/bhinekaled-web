// Ikon nav/aksi admin — kini memakai Solar (Iconify) lewat <Icon>. Nama komponen
// dipertahankan supaya AdminSidebar / AdminTopbar / dashboard tidak perlu diubah.
// Peta ikon: lib/icons/solar.json.

import { Icon } from "@/components/ui/Icon";

type IconRenderProps = { className?: string; size?: number };

export const DashboardIcon = (props: IconRenderProps) => <Icon name="dashboard" {...props} />;
export const ProductIcon = (props: IconRenderProps) => <Icon name="product" {...props} />;
export const CategoryIcon = (props: IconRenderProps) => <Icon name="category" {...props} />;
export const OrderIcon = (props: IconRenderProps) => <Icon name="order" {...props} />;
export const FeeIcon = (props: IconRenderProps) => <Icon name="fee" {...props} />;
export const ShippingIcon = (props: IconRenderProps) => <Icon name="shipping" {...props} />;
export const StoreIcon = (props: IconRenderProps) => <Icon name="store" {...props} />;
export const LogoutIcon = (props: IconRenderProps) => <Icon name="logout" {...props} />;
export const MenuToggleIcon = (props: IconRenderProps) => <Icon name="menu" {...props} />;
export const UserIcon = (props: IconRenderProps) => <Icon name="user" {...props} />;
