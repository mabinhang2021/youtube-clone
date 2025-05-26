import { StudioLayout } from "@/modules/studio/ui/layouts/studio-layout";
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) =>{
  return (
    <StudioLayout>
        <Toaster />
        {children}
    </StudioLayout>
  );
};
export default Layout;
