/* eslint-disable @next/next/no-css-tags */
/* eslint-disable @next/next/no-sync-scripts */
// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="zh-TW">
        <Head>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          />
          {/* Load Bootstrap CSS */}
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css"
            rel="stylesheet"
          />
          {/* Load AdminLTE CSS */}
          <link rel="stylesheet" href="/dist/css/adminlte.min.css" />
        </Head>
        <body className="sidebar-mini">
          <Main />
          <NextScript />
          {/* Load jQuery first */}
          <script
            src="https://code.jquery.com/jquery-3.6.0.min.js"
            integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
            crossOrigin="anonymous"
          />
          {/* Then Bootstrap Bundle (includes Popper) */}
          <script
            src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-Fy6S3B9q64WdZWQUiU+q4/2Lc9npb8tCaSX9FK7E8HnRr0Jz8D6OP9dO5Vg3Q9ct"
            crossOrigin="anonymous"
          />
          {/* Finally AdminLTE */}
          <script src="/dist/js/adminlte.min.js" />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
