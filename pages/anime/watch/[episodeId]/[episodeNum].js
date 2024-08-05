import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import Head from "next/head";
import MainLayout from "../../../../components/ui/MainLayout";
import Link from "next/link";
import { getAnimeDetails, getAnimeEpisodeData, getExternalLink } from "../../../../src/handlers/anime";
import AnimeDetails from "../../../../components/anime/info/AnimeDetails";
import EpisodesList from "../../../../components/anime/player/EpisodesList";
import PrimaryButton from "../../../../components/buttons/PrimaryButton";
import { HiOutlineDownload } from "react-icons/hi";

const VideoPlayer = dynamic(() => import('./../../../../components/anime/player/VideoPlayer'), { ssr: false, loading: () => <div>Loading...</div> });

export const getServerSideProps = async (context) => {
  const { episodeId, episodeNum, dub = false } = context.query;

  const anime = await getAnimeDetails(episodeId);
  const episode = await getAnimeEpisodeData(episodeId);
  const episodeNumber = parseInt(episodeNum);

  return {
    props: {
      episode,
      anime,
      episodeNumber,
      dub
    },
  };
};

function StreamingPage({ episode, anime, episodeNumber, dub }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [subtitlesUrl, setSubtitlesUrl] = useState(null);

  const firstEpisodeNumber = episode[0]?.number;
  const episodeIndex = firstEpisodeNumber === 0 ? episodeNumber : episodeNumber - 1;
  const episodeName = episode[episodeIndex]?.id;
  const episodeTitle = episode[episodeIndex]?.title;

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        if (episodeName) {
          const episodeData = await getExternalLink(episodeName);
          setVideoUrl(episodeData?.video || null);
          setSubtitlesUrl(episodeData?.subtitles || null);
        }
      } catch (error) {
        console.error("Failed to fetch links:", error);
      }
    };

    fetchLinks();
  }, [episodeName]);

  const handleDownloadVideo = () => {
    if (videoUrl) {
      const downloadUrl = `/api/download/video?url=${encodeURIComponent(videoUrl)}`;
      window.location.href = downloadUrl;
    } else {
      alert('Unable to download the video. The link might not be available.');
    }
  };

  const handleDownloadSubtitles = () => {
    if (subtitlesUrl) {
      const downloadUrl = `/api/download/subtitles?url=${encodeURIComponent(subtitlesUrl)}`;
      window.location.href = downloadUrl;
    } else {
      alert('Unable to download the subtitles. The link might not be available.');
    }
  };

  return (
    <>
      <Head>
        <title>{"Watch " + (anime?.title.english || anime?.title.romaji) + " Episode " + episodeNumber + " - The Beast "}</title>
        <meta name="description" content={anime?.synopsis} />
        <meta name="keywords" content={anime?.genres} />
        <meta property="og:title" content={"Watch " + (anime?.title.english || anime?.title.romaji) + " Episode " + episodeNumber + " - The Beast "} />
        <meta property="og:description" content={anime?.description} />
        <meta property="og:image" content={anime?.image} />
        <meta name="theme-color" content={anime?.color} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/android-chrome-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>
      <div className="transition-opacity duration-3000">
        <MainLayout useHead={false} type="anime">
          <div className="mt-3 lg:flex lg:space-x-4 rounded-xl">
            <div className="alignfull w-full overflow-hidden max-w-screen-xl rounded-xl">
              <VideoPlayer episodeNumber={episodeNumber} episodeTitle={episodeTitle} episodeName={episodeName} className="rounded-xl" />
              <div className="pt-5 font-bold max-lg:text-center sm:block mb-5">
                <div className="dark:text-secondary text-primary capitalize space-y-2">
                  <Link className="hover:text-blue-400 transition sm:text-base md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl" href={`/anime/info/${anime?.id}`}>
                    {anime?.title.english || anime?.title.romaji}
                  </Link>
                  <p className="dark:text-secondary text-primary sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl">
                    {episodeTitle ? `Episode ${episodeNumber}: ${episodeTitle}` : `Episode ${episodeNumber}`}
                  </p>
                </div>
              </div>
              <AnimeDetails animeData={anime} episodeData={episode} episodePage />
            </div>
            <EpisodesList episodeData={episode} episodeName={episodeName} id={anime.id} isDubbed={false} />
          </div>
          <div className="max-w-xs mt-10 space-y-4">
            <PrimaryButton
              icon={<HiOutlineDownload />}
              sub="Watch offline at your convenience"
              onClick={handleDownloadVideo}
            >
              Download Episode
            </PrimaryButton>
            <PrimaryButton
              icon={<HiOutlineDownload />}
              sub="Download subtitles for offline use"
              onClick={handleDownloadSubtitles}
            >
              Download Subtitles
            </PrimaryButton>
          </div>
        </MainLayout>
      </div>
    </>
  );
}

export default StreamingPage;
