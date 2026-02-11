import { AntdRegistry } from "@ant-design/nextjs-registry";
import AdminLayout from "@/components/AdminLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <div style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <AdminLayout>{children}</AdminLayout>
      </div>
    </AntdRegistry>
  );
}
