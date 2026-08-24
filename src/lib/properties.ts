import type {
  ListingStatus,
  Property,
  PropertyFilters,
  PropertyType,
} from "@/types/property";

// Mock signed-in seller. Replace with the authenticated user's id
// (from auth/session state) once that's wired up.
export const CURRENT_SELLER_ID = "u-seller-1";
export const CURRENT_SELLER_NAME = "Asha Gurung";

// Replace this with a real fetch to your backend once the listings
// endpoint exists, e.g. GET `${API_BASE_URL}/properties`
export const MOCK_PROPERTIES: Property[] = [
  {
    id: "p1",
    plotRef: "LOT-014",
    title: "Riverside two-bed apartment",
    address: "12 Willow Court",
    city: "Kathmandu",
    price: 185000,
    status: "For Sale",
    type: "Apartment",
    beds: 2,
    baths: 2,
    areaSqm: 86,
    imageSeed: "meridian-1",
    ownerId: "u-seller-1",
    ownerName: "Asha Gurung",
  },
  {
    id: "p2",
    plotRef: "LOT-027",
    title: "Family house with garden",
    address: "45 Birchwood Lane",
    city: "Lalitpur",
    price: 342000,
    status: "For Sale",
    type: "House",
    beds: 4,
    baths: 3,
    areaSqm: 210,
    imageSeed: "meridian-2",
    ownerId: "u-seller-1",
    ownerName: "Asha Gurung",
  },
  {
    id: "p3",
    plotRef: "LOT-033",
    title: "Studio near city center",
    address: "8 Market Row",
    city: "Kathmandu",
    price: 950,
    status: "For Rent",
    type: "Apartment",
    beds: 1,
    baths: 1,
    areaSqm: 42,
    imageSeed: "meridian-3",
    ownerId: "u-seller-2",
    ownerName: "Bikash Shrestha",
  },
  {
    id: "p4",
    plotRef: "LOT-041",
    title: "Corner plot, ready to build",
    address: "Ring Road, Sector 6",
    city: "Bhaktapur",
    price: 96000,
    status: "For Sale",
    type: "Land",
    beds: 0,
    baths: 0,
    areaSqm: 320,
    imageSeed: "meridian-4",
    ownerId: "u-seller-2",
    ownerName: "Bikash Shrestha",
  },
  {
    id: "p5",
    plotRef: "LOT-052",
    title: "Modern loft, top floor",
    address: "3 Foundry Street",
    city: "Kathmandu",
    price: 1450,
    status: "For Rent",
    type: "Apartment",
    beds: 2,
    baths: 1,
    areaSqm: 78,
    imageSeed: "meridian-5",
    ownerId: "u-seller-1",
    ownerName: "Asha Gurung",
  },
  {
    id: "p6",
    plotRef: "LOT-060",
    title: "Retail unit, high footfall",
    address: "22 High Street",
    city: "Lalitpur",
    price: 410000,
    status: "For Sale",
    type: "Commercial",
    beds: 0,
    baths: 1,
    areaSqm: 150,
    imageSeed: "meridian-6",
    ownerId: "u-seller-1",
    ownerName: "Asha Gurung",
  },
  {
    id: "p7",
    plotRef: "LOT-071",
    title: "Quiet cul-de-sac townhouse",
    address: "6 Sparrow Close",
    city: "Bhaktapur",
    price: 265000,
    status: "For Sale",
    type: "House",
    beds: 3,
    baths: 2,
    areaSqm: 165,
    imageSeed: "meridian-7",
    ownerId: "u-seller-3",
    ownerName: "Priya Maharjan",
  },
  {
    id: "p8",
    plotRef: "LOT-083",
    title: "Furnished one-bed, short walk to metro",
    address: "19 Alder Avenue",
    city: "Kathmandu",
    price: 1100,
    status: "For Rent",
    type: "Apartment",
    beds: 1,
    baths: 1,
    areaSqm: 54,
    imageSeed: "meridian-8",
    ownerId: "u-seller-3",
    ownerName: "Priya Maharjan",
  },
];

export function getPropertiesByOwner(
  properties: Property[],
  ownerId: string
): Property[] {
  return properties.filter((property) => property.ownerId === ownerId);
}

export function filterProperties(
  properties: Property[],
  filters: PropertyFilters
): Property[] {
  const query = filters.query.trim().toLowerCase();

  return properties.filter((property) => {
    if (
      query &&
      !`${property.title} ${property.address} ${property.city} ${property.plotRef}`
        .toLowerCase()
        .includes(query)
    ) {
      return false;
    }
    if (filters.type !== "All" && property.type !== filters.type) {
      return false;
    }
    if (filters.minPrice !== null && property.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== null && property.price > filters.maxPrice) {
      return false;
    }
    if (filters.minBeds !== null && property.beds < filters.minBeds) {
      return false;
    }
    return true;
  });
}

export function formatPrice(price: number, status: Property["status"]) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);

  return status === "For Rent" ? `${formatted}/mo` : formatted;
}

export interface NewPropertyInput {
  title: string;
  address: string;
  city: string;
  price: number;
  status: ListingStatus;
  type: PropertyType;
  beds: number;
  baths: number;
  areaSqm: number;
}

// Builds a Property from the "List a property" form. Replace this with
// a real POST to your backend once the create-listing endpoint exists,
// e.g. POST `${API_BASE_URL}/properties`
export function createDraftProperty(
  input: NewPropertyInput,
  ownerId: string,
  ownerName: string
): Property {
  const id = `p-${Date.now()}`;
  return {
    ...input,
    id,
    plotRef: `LOT-${Math.floor(100 + Math.random() * 900)}`,
    imageSeed: `meridian-${id}`,
    ownerId,
    ownerName,
  };
}
