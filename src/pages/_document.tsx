/* eslint-disable @next/next/no-sync-scripts */
// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    // Get the company from environment or default to ebc
    const company = process.env.NODE_ENV === "production" ? "ebc" : "";
    const basePath = "/iso50001";
    const assetPrefix = company ? `/${company}${basePath}` : basePath;

    return (
      <Html lang="zh-TW">
        <Head>
          {/* Add a script to fix static asset paths */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
              // Ensure Next.js loads assets from the correct path
              window.__NEXT_ROUTER_BASEPATH = "${basePath}";
              window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
              window.__NEXT_DATA__.assetPrefix = "${assetPrefix}";
            `,
            }}
          />

          {/* Font Awesome */}
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          />
          {/* Bootstrap CSS */}
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css"
            rel="stylesheet"
          />
          {/* AdminLTE CSS */}
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/css/adminlte.min.css"
          />
        </Head>
        <body className="sidebar-mini">
          <Main />
          <NextScript />
          {/* jQuery */}
          <script
            src="https://code.jquery.com/jquery-3.6.0.min.js"
            integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
            crossOrigin="anonymous"
          />
          {/* Bootstrap Bundle with Popper */}
          <script
            src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-Fy6S3B9q64WdZWQUiU+q4/2Lc9npb8tCaSX9FK7E8HnRr0Jz8D6OP9dO5Vg3Q9ct"
            crossOrigin="anonymous"
          />
          {/* AdminLTE JS */}
          <script src="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/js/adminlte.min.js" />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
