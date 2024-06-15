import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import AddIcon from '@material-ui/icons/Add';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (query) {
      const response = await axios.get(`/spotify/search?q=${query}`);
      setResults(response.data.tracks.items);
    }
  };

  const handleAddToPlaylist = async (trackUri) => {
    await axios.post('/spotify/add-to-playlist', { trackUri });
    alert('Song added to the playlist!');
  };

  return (
    <div>
      <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <TextField
          label="Search for a song..."
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <Button variant="contained" color="primary" type="submit">Search</Button>
      </form>
      <List>
        {results.map((track) => (
          <ListItem key={track.id}>
            <ListItemText
              primary={track.name}
              secondary={track.artists.map((artist) => artist.name).join(', ')}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" color="primary" onClick={() => handleAddToPlaylist(track.uri)}>
                <AddIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default SearchBar;