import { notFound } from "next/navigation";
import PropertyDetailView from "@/components/property/PropertyDetailView";
import { MOCK_PROPERTIES } from "@/lib/properties";

interface PropertyDetailPageProps {
  params: { id: string };
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const property = MOCK_PROPERTIES.find((p) => p.id === params.id);

  if (!property) {
    notFound();
  }

  return <PropertyDetailView property={property} />;
}
