// components/CompanyLink.tsx
import Link, { LinkProps } from "next/link";
import { useCompany } from "@/contexts/CompanyContext";
import { useRouter } from "next/router";
import { ReactNode } from "react";

interface CompanyLinkProps extends Omit<LinkProps, "href"> {
  href: string;
  children: ReactNode;
  className?: string;
}

const CompanyLink = ({
  href,
  children,
  className,
  ...props
}: CompanyLinkProps) => {
  const { companyName } = useCompany();
  const router = useRouter();

  // Build the correct URL
  let fullHref = href;

  // If href doesn't start with a slash, add one
  if (!href.startsWith("/")) {
    fullHref = `/${href}`;
  }

  // In development
  if (process.env.NODE_ENV === "development") {
    if (!fullHref.startsWith("/iso50001")) {
      fullHref = `/iso50001${fullHref}`;
    }
  }
  // In production
  else {
    // If this is a direct page URL like /energy-ecf, add the full path
    if (!fullHref.includes("/iso50001")) {
      fullHref = `/${companyName}/iso50001${fullHref}`;
    }
    // If this is already a company URL, use it as is
    else if (fullHref.match(/^\/[^/]+\/iso50001/)) {
      // URL is already in the correct format
    }
    // If this is a basePath URL (/iso50001/page), add the company
    else if (fullHref.startsWith("/iso50001/")) {
      fullHref = `/${companyName}${fullHref}`;
    }
  }

  // Custom onClick to catch browser navigation
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!props.onClick && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      // Use shallow: true to avoid triggering getServerSideProps again
      router.push(fullHref, undefined, { shallow: true });
    }
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
};

export default CompanyLink;
