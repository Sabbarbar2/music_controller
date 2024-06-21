import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Button, Typography, Container, Paper } from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import SearchBar from "./SearchBar";
import { QueueProvider } from './QueueManager';

function Room({ leaveRoomCallback }) {
  const { roomCode } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const [song, setSong] = useState({});

  useEffect(() => {
    fetchRoomData();
    const interval = setInterval(getCurrentSong, 1000);
    return () => clearInterval(interval);
  }, [roomCode]);

  const updateRoomData = (newRoomData) => {
    setRoomData(newRoomData);
  };

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`/api/get-room?code=${roomCode}`);
      if (!response.ok) {
        throw new Error("Room not found.");
      }
      const data = await response.json();
      setRoomData({
        votesToSkip: data.votes_to_skip,
        guestCanPause: data.guest_can_pause,
        isHost: data.is_host,
        showSettings: data.showSettings || false,
      });
    } catch (error) {
      console.error(error);
      navigate("/");
    }
  };

  const getCurrentSong = () => {
    fetch("/spotify/current-song")
      .then((response) => {
        if (!response.ok) {
          return {};
        } else {
          return response.json();
        }
      })
      .then((data) => {
        setSong(data);
      });
  };

  const leaveButtonPressed = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-type": "application/json" },
    };
    fetch("/api/leave-room", requestOptions)
      .then((_response) => {
        leaveRoomCallback();
        navigate("/");
      })
      .catch((error) => {
        console.error(error);
        navigate("/");
      });
  };

  const updateShowSettings = (value) => {
    if (!value) {
      fetchRoomData();
    }
    setShowSettings(value);
  };

  const renderSettings = () => {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} className="paper">
          <Grid container spacing={3}>
            <Grid item xs={12} align="center">
              <CreateRoomPage
                update={true}
                votesToSkip={roomData.votesToSkip}
                guestCanPause={roomData.guestCanPause}
                roomCode={roomData.roomCode}
                updateCallback={updateRoomData}
              />
            </Grid>
            <Grid item xs={12} align="center">
              <Button
                variant="contained"
                color="secondary"
                onClick={() => updateShowSettings(false)}
              >
                Close Settings
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  };

  const renderSettingsButton = () => {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => updateShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  };

  if (roomData === null) {
    return <div>Loading...</div>;
  }

  if (showSettings) {
    return renderSettings();
  }

  return (
    <Container>
      <QueueProvider>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} align="center">
            <Typography variant="h4" component="h4" gutterBottom>
              Code: {roomCode}
            </Typography>
          </Grid>
          <Grid item xs={12} align="center">
            <MusicPlayer {...song} />
          </Grid>
          <Grid item xs={12} align="center">
            <SearchBar />
          </Grid>
          <Grid item xs={12} align="center">
            {roomData.isHost ? renderSettingsButton() : null}
            <Button
              color="secondary"
              variant="contained"
              onClick={leaveButtonPressed}
            >
              Leave Room
            </Button>
          </Grid>
        </Grid>
      </QueueProvider>
    </Container>
  );
}

export default Room;
