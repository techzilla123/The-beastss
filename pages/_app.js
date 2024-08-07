import "../styles/globals.css";
import "../styles/nprogress.css";
import { QueryClient, QueryClientProvider } from "react-query";
import React from "react";
import ReactGA from "react-ga";
import { events } from "next/router";
import nprogress from "nprogress";
import GoogleAnalytics from "../components/GoogleAnalytics";

// Define the configuration variables directly
const config = {
  consumetApi: 'https://consumet-public.vercel.app',
  corsRequestLink: 'http://localhost:8080',
  tawktoPropertyId: '',
  tawktoWidgetId: '',
  gaTrackingId: '',
  umamiWebsiteId: '',
  nextTelemetryDisabled: true,
  apiUrl: 'https://ef.netmagcdn.com:2228'
};

// Initialize Google Analytics if the tracking ID is provided
if (config.gaTrackingId) {
  ReactGA.initialize(config.gaTrackingId);
}

events.on("routeChangeStart", nprogress.start);
events.on("routeChangeError", nprogress.done);
events.on("routeChangeComplete", nprogress.done);

function MyApp({ Component, pageProps }) {
  const queryClient = new QueryClient();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        {config.gaTrackingId && (
          <GoogleAnalytics />
        )}
        <Component {...pageProps} />
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
