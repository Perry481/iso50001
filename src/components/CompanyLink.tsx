// components/CompanyLink.tsx
import Link, { LinkProps } from "next/link";
import { useCompany } from "@/contexts/CompanyContext";
import { ReactNode, useMemo } from "react";

interface CompanyLinkProps extends Omit<LinkProps, "href"> {
  href: string;
  children: ReactNode;
  className?: string;
}

function CompanyLink({
  href,
  children,
  className,
  ...props
}: CompanyLinkProps) {
  const { companyName } = useCompany();

  // Build the URL correctly based on environment and current path
  const fullHref = useMemo(() => {
    // Clean the href
    let cleanHref = href;
    while (cleanHref.startsWith("//")) {
      cleanHref = cleanHref.substring(1);
    }

    // Add leading slash if missing
    if (!cleanHref.startsWith("/")) {
      cleanHref = `/${cleanHref}`;
    }

    // In development, just use the basePath
    if (process.env.NODE_ENV === "development") {
      // Just add /iso50001 if not already there
      if (!cleanHref.startsWith("/iso50001")) {
        return `/iso50001${cleanHref}`;
      }
      return cleanHref;
    }

    // In production
    if (cleanHref.startsWith("/iso50001")) {
      // Already has iso50001 prefix, add company before it
      return `/${companyName}${cleanHref}`;
    }

    // Otherwise add company and iso50001
    return `/${companyName}/iso50001${cleanHref}`;
  }, [href, companyName]);

  // Use a wrapper around Link instead of hijacking the navigation with onClick
  // This way we can leverage Next.js's built-in navigation without refresh
  return (
    <Link
      href={fullHref}
      {...props}
      className={className}
      prefetch={false} // Important - disable prefetching
    >
      {children}
    </Link>
  );
}

export default CompanyLink;
