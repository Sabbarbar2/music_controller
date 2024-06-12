import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Collapse,
  Button,
  Grid,
  Typography,
  TextField,
  FormHelperText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

function CreateRoomPage(props) {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [guestCanPause, setGuestCanPause] = useState(props.guestCanPause);
  const [votesToSkip, setVotesToSkip] = useState(props.votesToSkip);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [update, setUpdate] = useState(false);
  const updateCallback = () => {};
  const title = props.update ? "Update Room" : "Create a Room";

  const handleVotesChange = (e) => {
    setVotesToSkip(e.target.value);
  };

  const handleGuestCanPauseChange = (e) => {
    setGuestCanPause(e.target.value === "true" ? true : false);
  };

  const handleRoomButtonPressed = () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        votes_to_skip: votesToSkip === undefined ? 2 : votesToSkip,
        guest_can_pause: guestCanPause === undefined ? false : guestCanPause,
      }),
    };

    fetch("/api/create-room", requestOptions)
      .then((response) => response.json())
      .then((data) => navigate("/room/" + data.code));
  };

  // const checkRoomDataBeforeUpdate = () => {
  //     console.log('votesToSkip:', votesToSkip, 'guestCanPause:', guestCanPause, 'props.votesToSkip:', props.votesToSkip, 'props.guestCanPause:', props.getCanPause)
  // }

  const handleUpdateButtonPressed = () => {
    const requestOptions = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        votes_to_skip: votesToSkip,
        guest_can_pause: guestCanPause,
        code: roomCode,
      }),
    };
    fetch("/api/update-room", requestOptions).then((response) => {
      if (response.ok) {
        setSuccessMsg("Room updated succesfully!");
        setErrorMsg("");
        props.updateCallback({
          votes_to_skip: props.votesToSkip,
          guest_can_pause: props.guestCanPause,
          code: roomCode,
        });
      } else {
        setErrorMsg("Error updating room :(");
        setSuccessMsg("");
      }
    });

    console.log(requestOptions);
  };

  const renderCreateButtons = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Button
            color="primary"
            variant="contained"
            onClick={handleRoomButtonPressed}
          >
            Create A Room
          </Button>
        </Grid>
        {/* <Grid item xs={12} align="center">
                <Button
                    color="secondary"
                    variant="contained"
                    onClick={checkRoomDataBeforeUpdate}
                >
                    Check room Data
                </Button>
            </Grid> */}
        <Grid item xs={12} align="center">
          <Button color="secondary" variant="contained" component={Link} to="/">
            Go Back
          </Button>
        </Grid>
      </Grid>
    );
  };

  const renderUpdateButtons = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Button
            color="primary"
            variant="contained"
            onClick={handleUpdateButtonPressed}
          >
            Update Room
          </Button>
        </Grid>
        {/* <Grid item xs={12} align="center">
                <Button
                    color="secondary"
                    variant="contained"
                    onClick={checkRoomDataBeforeUpdate}
                >
                    Check room Data
                </Button>
            </Grid> */}
      </Grid>
    );
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Collapse in={errorMsg != "" || successMsg != ""}>
          {successMsg != "" ? (
            <Alert
              severity="success"
              onClose={() => {
                setSuccessMsg("");
              }}
            >
              {successMsg}
            </Alert>
          ) : (
            <Alert
              severity="error"
              onClose={() => {
                setErrorMsg("");
              }}
            >
              {errorMsg}
            </Alert>
          )}
        </Collapse>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography component="h4" variant="h4">
          {title}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <FormControl component="fieldset">
          <FormHelperText>
            <div align="center">Guest Control of playback state</div>
          </FormHelperText>
          <RadioGroup
            row
            defaultValue={props.guestCanPause ? "true" : "false"}
            onChange={handleGuestCanPauseChange}
          >
            <FormControlLabel
              value="true"
              control={<Radio color="primary" />}
              label="Play/Pause"
              labelPlacement="bottom"
            />
            <FormControlLabel
              value="false"
              control={<Radio color="secondary" />}
              label="No Control"
              labelPlacement="bottom"
            />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} align="center">
        <FormControl>
          <TextField
            required={true}
            type="number"
            onChange={handleVotesChange}
            defaultValue={props.votesToSkip ? votesToSkip : 2}
            inputProps={{
              min: 1,
              style: { textAlign: "center" },
            }}
          />
          <FormHelperText>
            <div align="center">Votes Required To Skip Song</div>
          </FormHelperText>
        </FormControl>
      </Grid>
      {props.update
        ? renderUpdateButtons()
        : renderCreateButtons(props.updateCallback)}
    </Grid>
  );
}

export default CreateRoomPage;
