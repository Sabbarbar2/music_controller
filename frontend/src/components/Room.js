import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import SearchBar from "./SearchBar";

function Room({ leaveRoomCallback }) {
    const { roomCode } = useParams();
    const [roomData, setRoomData] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const navigate = useNavigate();
    // let song = {};
    const [song, setSong] = useState({});

    useEffect(() => {
        fetchRoomData();
        console.log('RoomData:', roomData);
        const interval = setInterval(getCurrentSong, 1000);
        return () => clearInterval(interval);
    }, [roomCode, navigate]);


    const updateRoomData = (newRoomData) => {
        setRoomData(newRoomData);
    }

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
        fetch('/spotify/current-song')
            .then((response) => {
                if (!response.ok) {
                    return {};
                } else {
                    return response.json();
                }
            }).then((data) => {
                setSong(data);
                console.log(data);
            } );
    }
    
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
    }

    const renderSettings = () => {
        // console.log("settings pressed:", roomData);
        return (
        <Grid container spacing={1}>
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
                <Button variant="contained" color="secondary" onClick={() => updateShowSettings(false)}>
                    Close Settings
                </Button>
            </Grid>
        </Grid>
    )}

    const renderSettingsButton = () => {
        return (
            <Grid item xs={12} align="center">
                <Button variant="contained" color="primary" onClick={() => updateShowSettings(true)}>
                    Settings
                    {/* {console.log("close settings pressed:", roomData)} */}
                </Button>
            </Grid>
        );
    }

    if (roomData === null) {
        return <div>Loading...</div>;
    }

    if (showSettings) {
        return renderSettings();
    }
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Typography variant="h4" component="h4">
                    Code: {roomCode}
                </Typography>
            </Grid>
            <SearchBar />
            <MusicPlayer {...song} />
            {roomData.isHost ? renderSettingsButton() : null}
            <Grid item xs={12} align="center">
                <Button color="secondary" variant="contained" onClick={leaveButtonPressed}>
                    Leave Room
                </Button>
            </Grid>
        </Grid>
    );
}

export default Room;


