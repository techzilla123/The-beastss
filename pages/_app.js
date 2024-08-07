import "../styles/globals.css";
import "../styles/nprogress.css";
import { QueryClient, QueryClientProvider } from "react-query";
import React, { useEffect } from "react";
import ReactGA from "react-ga";
import { useRouter } from "next/router";
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

function MyApp({ Component, pageProps }) {
  const queryClient = new QueryClient();
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = () => nprogress.start();
    const handleRouteChangeComplete = () => nprogress.done();
    const handleRouteChangeError = () => nprogress.done();

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeError);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeError);
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      {config.gaTrackingId && <GoogleAnalytics />}
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default MyApp;
