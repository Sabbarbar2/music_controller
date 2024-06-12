import RoomCreatePage from "./CreateRoomPage";
import RoomJoinPage from "./RoomJoinPage";
import Room from "./Room";
import React, { useState, useEffect, useCallback } from "react";
import { Grid, Button, ButtonGroup, Typography } from "@material-ui/core";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";

function HomePage() {
    const [roomCode, setRoomCode] = useState(null);
    const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);

    const fetchRoomCode = async () => {
        const response = await fetch("/api/user-in-room");
        const data = await response.json();
        
        setRoomCode(data.code);
    };

    const checkSpotifyAuthentication = useCallback(async () => {
        const response = await fetch('/spotify/is-authenticated');
        const data = await response.json();
        setSpotifyAuthenticated(data.status);
        if (!data.status) {
            authenticateSpotify();
        }
    }, []);

    useEffect(() => {
        fetchRoomCode();
    }, []);

    useEffect(() => {
        checkSpotifyAuthentication();
    }, [checkSpotifyAuthentication]);

    const authenticateSpotify = () => {
        fetch('/spotify/get-auth-url')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                window.location.replace(data.url);
            })
            .catch((error) => {
                console.error('Error fetching authentication URL:', error);
            });
    };

    const clearRoomCode = () => {
        setRoomCode(null);
    };

    return (
        <Router>
            <Routes>
                <Route
                    exact
                    path="/"
                    element={
                        roomCode ? (
                            <Navigate to={`/room/${roomCode}`} replace />
                        ) : (
                            <HomePageContent 
                                spotifyAuthenticated={spotifyAuthenticated}
                                authenticateSpotify={authenticateSpotify}
                            />
                        )
                    }
                />
                <Route path="/join/*" element={<RoomJoinPage />} />
                <Route path="/create/" element={<RoomCreatePage />} />
                <Route
                    path="/room/:roomCode"
                    element={<Room leaveRoomCallback={clearRoomCode} />}
                />
            </Routes>
        </Router>
    );
}

function HomePageContent() {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12} align="center">
                    <Typography variant="h3" compact="h3">
                        Music Controller
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <ButtonGroup disableElevation variant="contained" color="primary">
                        <Button component={Link} color="primary" to="/join">
                            Join a Room
                        </Button>
                        <Button component={Link} color="secondary" to="/create">
                            Create a Room
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        );
}

export default HomePage;


