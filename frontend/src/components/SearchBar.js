import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import { Grid } from "@material-ui/core";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQueue } from "./QueueManager";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const { queue, fetchQueue } = useQueue();

  useEffect(() => {
    fetchQueue();
  }, []);

  const searchSongs = async () => {
    try {
      console.log("Sending search request to backend");
      console.log(`Search URL: /search/?query=${query}`);
      const response = await axios.post("/spotify/search/", { query: query });
      console.log("Response from backend:");
      console.log(response.data);
      setResults(response.data.tracks.items);
    } catch (error) {
      console.error("Error searching songs", error);
    }
  };

  const addToQueue = async (song) => {
    const { id, name, artists, album } = song;
    const songData = {
      song_id: id,
      title: name,
      artist: artists.map((artist) => artist.name).join(", "),
      album_cover: album.images[0].url,
    };
    try {
      await axios.post("/spotify/add/", songData);
      alert("Song added to queue");
      fetchQueue(); // Refresh the queue
    } catch (error) {
      console.error("Error adding song to queue", error);
    }
  };

  const removeFromQueue = async (song_id) => {
    try {
      await axios.post("/spotify/remove/", { song_id });
      alert("Song removed from queue");
      fetchQueue(); // Refresh the queue
    } catch (error) {
      console.error("Error removing song from queue", error);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} align="center">
        <TextField
          label="Search Songs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={searchSongs}>
          Search
        </Button>
        <List className="searchResults">
          {results.map((song) => (
            <ListItem key={song.id}>
              <ListItemText
                primary={song.name}
                secondary={song.artists.map((artist) => artist.name).join(", ")}
              />
              <Button
                variant="outlined"
                size="small"
                color="secondary"
                onClick={() => addToQueue(song)}
              >
                Add to Queue
              </Button>
            </ListItem>
          ))}
        </List>
      </Grid>
      <Grid item xs={12} align="center">
        <h3>Queue</h3>
        <List>
          {queue.map((song) => (
            <ListItem key={song.song_id}>
              <ListItemText primary={song.title} secondary={song.artist} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => removeFromQueue(song.song_id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Grid>
    </Grid>
  );
};

export default SearchBar;
