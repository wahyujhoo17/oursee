import { AntdRegistry } from "@ant-design/nextjs-registry";
import AdminLayout from "@/components/AdminLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <AdminLayout>{children}</AdminLayout>
    </AntdRegistry>
  );
}
