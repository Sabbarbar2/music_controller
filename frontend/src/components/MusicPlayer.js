import React from "react";
import {
  Grid,
  Typography,
  Card,
  IconButton,
  LinearProgress,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import { useQueue } from "./QueueManager";

function MusicPlayer(props) {
  const { time, duration, image_url, title, artist, is_playing, votes, votes_required } = props;
  const { fetchQueue } = useQueue();


  const songProgress = (time / duration) * 100;

  const pauseSong = () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/pause", requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.dir(response);
      })
      .catch(error => console.error("Error pausing song:", error));
    console.log("pause pressed");
  };
  
  const playSong = () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/play", requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.dir(response);
      })
      .catch(error => console.error("Error playing song:", error));
    console.log("play pressed");
  };


  const skipSong = () => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/skip", requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            fetchQueue(); // Refresh the queue
            console.dir(response);
        })
        .catch(error => console.error("Error skipping song:", error));
        console.log("skip pressed");
  }


  return (
    <Card>
      <Grid container spacing={1} alignItems="center">
        <Grid item align="center" xs={4}>
          <img src={image_url} height="100%" width="100%" alt="Album Cover" />
        </Grid>
        <Grid item align="center" xs={8}>
          <Typography component="h5" variant="h5">
            {title}
          </Typography>
          <Typography color="textSecondary" variant="subtitle1">
            {artist}
          </Typography>
          <div>
            <IconButton
              onClick={() => {
                is_playing ? pauseSong() : playSong();
              }}
            >
              {is_playing ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            {/* Without the arrow function the skipSong plays infinitely, god knows why */}
            <IconButton onClick={() => skipSong()}> 
            {votes} / {" "} {votes_required} <SkipNextIcon />
            </IconButton>
          </div>
        </Grid>
      </Grid>
      <LinearProgress variant="determinate" value={songProgress} />
    </Card>
  );
}

export default MusicPlayer;
