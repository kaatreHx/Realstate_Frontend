export type PropertyType = "House" | "Apartment" | "Land" | "Commercial";
export type ListingStatus = "For Sale" | "For Rent";

export interface Property {
  id: string;
  plotRef: string;
  title: string;
  address: string;
  city: string;
  price: number;
  status: ListingStatus;
  type: PropertyType;
  beds: number;
  baths: number;
  areaSqm: number;
  imageSeed: string;
  ownerId: string;
  ownerName: string;
}

export interface PropertyFilters {
  query: string;
  type: PropertyType | "All";
  minPrice: number | null;
  maxPrice: number | null;
  minBeds: number | null;
}

export const DEFAULT_FILTERS: PropertyFilters = {
  query: "",
  type: "All",
  minPrice: null,
  maxPrice: null,
  minBeds: null,
};
