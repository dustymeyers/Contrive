import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ImageUpload from '../ImageUpload/ImageUploadFunctional';
import getStates from '../../helpers/states';

// Material-UI
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import DatePicker from '@material-ui/lab/DatePicker';
import {
  Button, // replaces html5 <button> element
  FormControl,
  Grid, //
  Input,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography, // replace html5 elements dealing with text, <h1>, <h2>, <h3>, <p>, etc...
} from '@material-ui/core';

function CreateEvent() {
  const dispatch = useDispatch();
  const history = useHistory();
  const planner = useSelector(
    (store) => store.userDetails.loggedInUserDetailsReducer
  );
  const typesOfEvents = useSelector(
    (store) => store.events.typesOfEventsReducer
  );
  const eventPhoto = useSelector((store) => store.eventPhoto);
  // Local state variables
  const [open, setOpen] = useState(false); // used for tracking whether select is open
  const [dateOfEvent, setDateOfEvent] = useState('');
  const [timeOfEvent, setTimeOfEvent] = useState('07:30');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [numberOfAttendees, setNumberOfAttendees] = useState(0);
  const [description, setDescription] = useState('');

  useEffect(() => {
    dispatch({ type: 'FETCH_LOGGED_IN_USER_DETAILS' });
  }, []);

  console.log('typesofevents:', typesOfEvents);

  // handles form submission and creating event
  const handleFormSubmission = () => {
    // console.log('handling form submission');
    // console.log('dateofevent:', dateOfEvent);
    // console.log('timeofevent:', timeOfEvent);
    // console.log('address:', address);
    // console.log('city:', city);
    // console.log('state:', state);
    // console.log('zip:', zip);
    // console.log('numberofattendees:', numberOfAttendees);
    // console.log('description:', description);
    // console.log('plannerUserId', planner.id);
    dispatch({
      type: 'ADD_EVENT',
      payload: {
        plannerUserId: planner.id,
        dateOfEvent,
        timeOfEvent,
        address,
        city,
        state,
        zip,
        numberOfAttendees,
        description,
        photos: [eventPhoto],
        onComplete: () => {
          console.log('completed!');
          history.push('/events/confirmation');
        },
      },
    });
  };

  // Handles opening and closing the select
  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid item container spacing={2} xs={12} component={Paper}>
        {/* Header */}
        <Typography variant="h2" component="h2" align="center">
          Create Event
        </Typography>

        {/* Image Upload */}
        <Grid item xs={12}>
          <FormControl variant="outlined" fullWidth>
            <Typography variant="body1" align="left">
              Event Picture
            </Typography>
            <ImageUpload page="AddEventPhoto" />
          </FormControl>
        </Grid>

        {/*  Address */}
        <Grid item xs={8}>
          <FormControl variant="outlined" fullWidth>
            <TextField
              id="address"
              label="Address"
              type="text"
              autoComplete="current-address"
              variant="outlined"
              value={address}
              required
              onChange={(event) => setAddress(event.target.value)}
            />
          </FormControl>
        </Grid>

        {/* State Selection */}
        <Grid item xs={4}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="controlled-open-select">State</InputLabel>
            <Select
              id="controlled-open-select"
              open={open}
              onClose={handleClose}
              onOpen={handleOpen}
              value={state}
              onChange={(evt) => setState(evt.target.value)}
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {getStates().map((state, index) => {
                return (
                  <MenuItem key={index} value={state.abbreviation}>
                    {state.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>

        {/* City */}
        <Grid item xs={6}>
          <FormControl variant="outlined" fullWidth>
            <TextField
              id="city"
              label="City"
              type="text"
              autoComplete="current-city"
              variant="outlined"
              value={city}
              required
              onChange={(event) => setCity(event.target.value)}
            />
          </FormControl>
        </Grid>

        {/* Zip Code */}
        <Grid item xs={6}>
          <FormControl variant="outlined" fullWidth>
            <TextField
              id="zip"
              label="Zip Code"
              type="text"
              autoComplete="current-zip-code"
              variant="outlined"
              value={zip}
              required
              onChange={(event) => setZip(event.target.value)}
            />
          </FormControl>
        </Grid>

        {/* Event Date */}
        <Grid item xs={6}>
          <FormControl variant="outlined" fullWidth>
            <DatePicker
              label="Event Date"
              value={dateOfEvent}
              onChange={(newValue) => {
                setDateOfEvent(newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </FormControl>
        </Grid>

        {/* Time of Event */}
        <Grid item xs={6}>
          <FormControl variant="outlined" fullWidth>
            <TextField
              id="time"
              label="Time of Event"
              type="time"
              value={timeOfEvent}
              onChange={(evt) => setTimeOfEvent(evt.target.value)}
              required
            />
          </FormControl>
        </Grid>

        {/* Number of Attendees */}
        <Grid item xs={12}>
          <FormControl variant="outlined" fullWidth>
            <TextField
              id="numberOfAttendees"
              label="Number Of Attendees"
              type="text"
              autoComplete="current-number-of-attendees"
              variant="outlined"
              value={numberOfAttendees}
              required
              onChange={(event) => setNumberOfAttendees(event.target.value)}
            />
          </FormControl>
        </Grid>

        {/*  Description */}
        <Grid item xs={12}>
          <FormControl variant="outlined" fullWidth>
            <TextField
              id="description"
              label="Description"
              type="text"
              autoComplete="current-description-of-event"
              variant="outlined"
              value={description}
              required
              onChange={(event) => setDescription(event.target.value)}
            />
          </FormControl>
        </Grid>

        <Grid item container xs={12} justify="center">
          <Button
            color="primary"
            variant="contained"
            onClick={handleFormSubmission}
          >
            Create Event
          </Button>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
} // end CreateEvent

export default CreateEvent;
