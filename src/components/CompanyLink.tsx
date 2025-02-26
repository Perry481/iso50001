// components/CompanyLink.tsx
import Link, { LinkProps } from "next/link";
import { useCompany } from "@/contexts/CompanyContext";
import { useRouter } from "next/router";
import { ReactNode, useMemo } from "react";

interface CompanyLinkProps extends Omit<LinkProps, "href"> {
  href: string;
  children: ReactNode;
  className?: string;
}

// Custom hook for building URLs
function useCompanyUrl(href: string) {
  const { companyName } = useCompany();

  return useMemo(() => {
    // Clean the href - ensure it doesn't start with multiple slashes
    let cleanHref = href;
    while (cleanHref.startsWith("//")) {
      cleanHref = cleanHref.substring(1);
    }

    // Add leading slash if missing
    if (!cleanHref.startsWith("/")) {
      cleanHref = `/${cleanHref}`;
    }

    if (process.env.NODE_ENV === "development") {
      // In development, just prefix with /iso50001 but avoid double prefixing
      const devHref = cleanHref.startsWith("/iso50001/")
        ? cleanHref
        : `/iso50001${cleanHref}`;

      // Fix the double iso50001 issue in development
      return devHref.replace(/\/iso50001\/iso50001\//, "/iso50001/");
    } else {
      // In production
      let prodHref: string;

      if (cleanHref.startsWith("/iso50001/")) {
        // If it already has the iso50001 prefix, add company before it
        prodHref = `/${companyName}${cleanHref}`;
      } else {
        // Otherwise, construct the full path
        prodHref = `/${companyName}/iso50001${cleanHref}`;
      }

      // Fix any potential double paths
      return prodHref.replace(/\/iso50001\/iso50001\//, "/iso50001/");
    }
  }, [href, companyName]);
}

function CompanyLink({
  href,
  children,
  className,
  ...props
}: CompanyLinkProps) {
  const router = useRouter();
  const fullHref = useCompanyUrl(href);

  // Custom onClick to handle navigation
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow default behavior for ctrl/cmd+click or if onClick is provided
    if (props.onClick || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }

    e.preventDefault();
    console.log("Navigating to:", fullHref); // Debug log
    router.push(fullHref, undefined, { shallow: true });
  };

  return (
    <Link
      href={fullHref}
      {...props}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

export default CompanyLink;
