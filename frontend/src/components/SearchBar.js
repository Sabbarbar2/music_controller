import React, { useState } from 'react';
import { TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const searchSongs = async () => {
    try {
      const response = await axios.get('/search/', { params: { query } });
      setResults(response.data.tracks.items);
      console.log(query);
    } catch (error) {
      console.error('Error searching songs', error);
      console.log(query);
    }
  };

  const addToQueue = async (song) => {
    const { id, name, artists, album } = song;
    const songData = {
      song_id: id,
      title: name,
      artist: artists.map(artist => artist.name).join(', '),
      album_cover: album.images[0].url,
    };
    try {
      await axios.post('/queue/add/', songData);
      alert('Song added to queue');
    } catch (error) {
      console.error('Error adding song to queue', error);
    }
  };

  return (
    <div>
      <TextField
        label="Search Songs"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={searchSongs}>
        Search
      </Button>
      <List>
        {results.map((song) => (
          <ListItem key={song.id}>
            <ListItemButton onClick={() => addToQueue(song)}>
              <ListItemText 
                primary={song.name} 
                secondary={song.artists.map(artist => artist.name).join(', ')} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default SearchBar;
