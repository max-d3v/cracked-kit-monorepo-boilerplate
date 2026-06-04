import { useParams } from "next/navigation";

export const getOrganizationSlug = () => {
  const params = useParams<{ slug?: string | string[] }>();
  return typeof params?.slug === "string" ? params.slug : null;
};
