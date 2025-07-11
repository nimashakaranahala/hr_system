import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Footer from "../../components/Footer"; 

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Bootstrap CSS */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        {/* MDBootstrap CSS */}
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/6.0.0/mdb.min.css"
          rel="stylesheet"
        />
        {/* FontAwesome */}
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
      </Head>
      
      {/* Render the page content */}
      <Component {...pageProps} />

      {/* Footer shown on every page */}
      <Footer />
    </>
  );
}
