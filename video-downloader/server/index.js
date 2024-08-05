const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Import CORS
const app = express();
const port = process.env.PORT || 3002;

// Define allowed origins
const allowedOrigins = ['http://thebeastss.com', 'https://thebeastss.netlify.app', 'https://the-beast.vercel.app/'];

// Set up CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// VLC and FFmpeg paths
const vlcPath = process.env.VLC_PATH || 'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe'; // Adjust based on your VLC installation path
const ffmpegPath = process.env.FFMPEG_PATH || 'C:\\Users\\HP\\Downloads\\ffmpeg-2024-08-01-git-bcf08c1171-essentials_build\\bin\\ffmpeg.exe'; // Adjust based on your FFmpeg installation path

// Download and merge video segments
app.get('/api/download/merge', async (req, res) => {
  const introUrl = req.query.introUrl;
  const mainUrl = req.query.mainUrl;
  
  const introFile = path.join(__dirname, 'intro.ts');
  const mainFile = path.join(__dirname, 'main.ts');
  const outputFile = path.join(__dirname, 'output.mp4');

  try {
    // Step 1: Download intro segment
    await downloadSegment(introUrl, introFile);

    // Step 2: Download main segment
    await downloadSegment(mainUrl, mainFile);

    // Step 3: Merge the segments using FFmpeg
    await mergeSegments([introFile, mainFile], outputFile);

    // Serve the merged file for download
    res.download(outputFile, 'merged_video.mp4', (err) => {
      if (err) {
        console.error('Error serving the file:', err);
      }

      // Clean up temporary files
      fs.unlinkSync(introFile);
      fs.unlinkSync(mainFile);
      fs.unlinkSync(outputFile);
    });
  } catch (error) {
    console.error('Error processing the request:', error);
    res.status(500).send('Failed to process the video.');
  }
});

// Function to download a video segment using VLC
const downloadSegment = (url, outputFilePath) => {
  return new Promise((resolve, reject) => {
    const command = `"${vlcPath}" "${url}" --sout=file/ts:${outputFilePath} vlc://quit`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error downloading segment: ${stderr}`);
      } else {
        resolve();
      }
    });
  });
};

// Function to merge video segments using FFmpeg
const mergeSegments = (inputFiles, outputFilePath) => {
  return new Promise((resolve, reject) => {
    const fileList = inputFiles.map(file => `file '${file}'`).join('\n');
    const fileListPath = path.join(__dirname, 'filelist.txt');

    // Write file list to a temporary file
    fs.writeFileSync(fileListPath, fileList);

    const command = `"${ffmpegPath}" -f concat -safe 0 -i ${fileListPath} -c copy ${outputFilePath}`;

    exec(command, (error, stdout, stderr) => {
      fs.unlinkSync(fileListPath); // Clean up the file list

      if (error) {
        reject(`Error merging segments: ${stderr}`);
      } else {
        resolve();
      }
    });
  });
};

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
