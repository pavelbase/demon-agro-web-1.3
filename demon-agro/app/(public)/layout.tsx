import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ImageSyncProvider from "@/components/ImageSyncProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ImageSyncProvider>
      <Navigation />
      <main className="min-h-screen pt-24">
        {children}
      </main>
      <Footer />
    </ImageSyncProvider>
  );
}
