import { useState, useEffect } from "react";
import { getAnimeEpisodeLinks } from "../../../src/handlers/anime";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaProvider, Track } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout, DefaultAudioLayout } from '@vidstack/react/player/layouts/default';

const corsLink = process.env.NEXT_PUBLIC_CORS_REQUEST_LINK || "http://localhost:8080";

const VideoPlayer = ({ episodeTitle, episodeName, episodeNumber, onVideoLoad }) => {
  const [episodeDataLink, setEpisodeDataLink] = useState(null);
  const [episodeSubtitleLink, setEpisodeSubtitleLink] = useState(null);
  const [vttContent, setVttContent] = useState(null);
  const [isZoro, setIsZoro] = useState(true);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}.000`;
  };

  const generateVTT = (intros, outros) => {
    let vtt = "WEBVTT\n\n";
    
    intros.forEach(intro => {
      vtt += `${formatTime(intro.start)} --> ${formatTime(intro.end)}\nIntro\n\n`;
    });

    outros.forEach(outro => {
      vtt += `${formatTime(outro.start)} --> ${formatTime(outro.end)}\nOutro\n\n`;
    });

    return vtt;
  };

  useEffect(() => {
    const fetchEpisodeDataAndSubtitles = async () => {
      try {
        let episodeData;
        if (episodeName.includes("$")) {
          episodeData = await getAnimeEpisodeLinks(episodeName);
          setIsZoro(true);
          if (episodeData.intro && episodeData.outro) {
            const intros = [episodeData.intro];
            const outros = [episodeData.outro];
            setVttContent(generateVTT(intros, outros));
          }
        } else {
          episodeData = await getAnimeEpisodeLinks(episodeName, "gogoanime");
          setIsZoro(false);
        }

        if (episodeData) {
          if (episodeData.sources && episodeData.sources.length > 0) {
            const defaultSource = isZoro
              ? episodeData.sources[0]
              : episodeData.sources.find(source => source.quality === "default");

            const videoUrl = corsLink ? `${corsLink}/${defaultSource.url}` : defaultSource.url;
            setEpisodeDataLink(videoUrl);
            if (onVideoLoad) {
              onVideoLoad(videoUrl);
            }
          } else {
            console.error("Episode data is missing or the expected structure is not met.");
            setEpisodeDataLink(null);
          }

          if (episodeData.subtitles && episodeData.subtitles.length > 0) {
            setEpisodeSubtitleLink(episodeData.subtitles);
          } else {
            console.error("Episode subtitles are missing or the expected structure is not met.");
            setEpisodeSubtitleLink(null);
          }
        } else {
          console.error("Failed to fetch episode data or subtitles.");
          setEpisodeDataLink(null);
          setEpisodeSubtitleLink(null);
        }
      } catch (error) {
        console.error("Failed to fetch episode data or subtitles:", error);
        setEpisodeDataLink(null);
        setEpisodeSubtitleLink(null);
      }
    };

    fetchEpisodeDataAndSubtitles();
  }, [episodeName]);

  if (!episodeDataLink) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  const episodeThing = episodeTitle
    ? `Episode ${episodeNumber}: ${episodeTitle}`
    : `Episode ${episodeNumber}`;

  const handleDownloadVideo = () => {
    if (episodeDataLink) {
      const downloadUrl = `/api/download/video?url=${encodeURIComponent(episodeDataLink)}`;
      window.location.href = downloadUrl;
    } else {
      console.error("Video URL is not available for download.");
    }
  };

  const handleDownloadSubtitles = () => {
    const subtitlesUrl = episodeSubtitleLink && episodeSubtitleLink.length > 0 ? episodeSubtitleLink[0].url : null;
    if (subtitlesUrl) {
      const downloadUrl = `/api/download/subtitles?url=${encodeURIComponent(subtitlesUrl)}`;
      window.location.href = downloadUrl;
    } else {
      alert("No subtitles available for download.");
    }
  };

  return (
    <div>
      <MediaPlayer
        title={episodeThing}
        src={episodeDataLink}
        playsInline
        aspectRatio="16/9"
        load="eager"
        posterLoad="eager"
        streamType="on-demand"
      >
        <MediaProvider>
          {episodeSubtitleLink && episodeSubtitleLink.filter(track => track.lang !== "Thumbnails").map(track => (
            <Track
              src={track.url}
              kind="subtitles"
              label={track.lang}
              key={track.url}
              default={track.lang === "English"}
            />
          ))}
          {vttContent && (
            <Track
              content={vttContent}
              default={true}
              language="en-US"
              kind="chapters"
              data-type="vtt"
            />
          )}
        </MediaProvider>
        <DefaultAudioLayout icons={defaultLayoutIcons} />
        {episodeSubtitleLink && episodeSubtitleLink.find(track => track.lang === "Thumbnails") && (
          <DefaultVideoLayout
            thumbnails={episodeSubtitleLink.find(track => track.lang === "Thumbnails").url}
            icons={defaultLayoutIcons}
          />
        )}
      </MediaPlayer>
    </div>
  );
};

export default VideoPlayer;
