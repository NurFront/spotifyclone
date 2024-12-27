import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import "./MusicPlayer.css";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

const App: React.FC = () => {
  const [audioFiles, setAudioFiles] = useState<{ url: string; name: string }[]>(
    []
  );
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedFiles = localStorage.getItem("audioFiles");
    if (savedFiles) {
      const parsedFiles = JSON.parse(savedFiles);
      setAudioFiles(parsedFiles);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("audioFiles", JSON.stringify(audioFiles));
  }, [audioFiles]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
      }));
      setAudioFiles((prev) => [...prev, ...newFiles]);
      if (audioFiles.length === 0) {
        setCurrentTrackIndex(0);
      }
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const togglePlayPause = () => {
    if (!audioFiles.length) return;
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const currentTime = audioRef.current.currentTime;
    const totalDuration = audioRef.current.duration;
    setProgress((currentTime / totalDuration) * 100);
    setDuration(totalDuration);
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime =
      (Number(event.target.value) / 100) * audioRef.current.duration;
    audioRef.current.currentTime = seekTime;
    setProgress(Number(event.target.value));
  };

  const handleNextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % audioFiles.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(false);
    setProgress(0);
  };

  const handlePrevTrack = () => {
    const prevIndex =
      (currentTrackIndex - 1 + audioFiles.length) % audioFiles.length;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(false);
    setProgress(0);
  };

  const playSelectedTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setProgress(0);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();

      audioRef.current.onloadeddata = () => {
        audioRef.current?.play().catch((error) => {
          console.error("Ошибка воспроизведения:", error);
        });
      };
    }
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value) / 100;
    setVolume(newVolume);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <div className="music-player">
      <h1>Music Player</h1>
      <label htmlFor="file-upload" className="custom-file-upload">
        Добавить музыку
      </label>
      <input
        id="file-upload"
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileUpload}
      />
      {audioFiles.length > 0 && (
        <>
          <audio
            ref={audioRef}
            src={audioFiles[currentTrackIndex]?.url}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleNextTrack}
          ></audio>
          <div className="controls">
            <button onClick={handlePrevTrack}>⬅</button>
            <button onClick={togglePlayPause}>{isPlaying ? "⏹" : "▶"}</button>
            <button onClick={handleNextTrack}>➡</button>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
          />
          <span>
            {Math.floor(duration / 60)}:
            {("0" + Math.floor(duration % 60)).slice(-2)}
          </span>
          <div className="volume-control">
            <label>
              <VolumeUpIcon />
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
            />
          </div>
          <div className="playlist">
            <h3>Плейлист:</h3>
            <ul>
              {audioFiles.map((file, index) => (
                <li
                  key={index}
                  className={index === currentTrackIndex ? "active" : ""}
                  onClick={() => playSelectedTrack(index)}
                >
                  {index + 1}. {file.name}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
