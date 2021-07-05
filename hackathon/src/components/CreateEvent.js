import React, {Component} from 'react';
import {Form, FormGroup, FormText, Label, Input, Button, Alert} from 'reactstrap';
import {getCookie} from "./Utils";
import EventProfile from "./EventProfile";


/**
 * Uses a form to post information about a new event bring created.
 */
class CreateEvent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            onSuccess: false,
            successPIN: '',
            onFail: false,
            errToShow: '',
            name: '',
            date: '',
            time: '',
            teams: '',
            judges: '',
            criteria: ''
        }
    }

    /**
     * methods starting with use are needed to handle input information
     * into the form fields
     *
     * @param e the event calling these methods
     * @public
     */
    useInputName = (e) => {
        this.setState({
            name: e.target.value,
        })
    };

    useInputDate = (e) => {
        this.setState({
            date: e.target.value,
        })
    };

    useInputTime = (e) => {
        this.setState({
            time: e.target.value
        })
    };

    useInputTeams = (e) => {
        this.setState({
            teams: e.target.value
        })
    }

    useInputJudges = (e) => {
        this.setState({
            judges: e.target.value
        })
    }

    useInputCriteria = (e) => {
        this.setState({
            criteria: e.target.value
        })
    }

    /**
     * Clears all form fields
     * @param e the component whose state this method will change
     * @public
     */
    clearInputFields = (e) => {
        e.preventDefault();
        this.setState({
            name: '',
            date: '',
            time: '',
            teams: ''
        })
    }

    /**
     * Posts information to the server about the event being created.
     *
     * @param e the component whose state this method will change
     * @public
     */
    submitEvent = (e) => {
        e.preventDefault();
        console.log("submit clicked");
        console.log(this.state.teams.split('\n'));

        const token = getCookie('csrftoken');

        //send call to API
        fetch('/create', {
            method: 'POST',
            headers: {
                'X-CSRFToken': token
            },
            body: JSON.stringify({
                event_name: this.state.name,
                date_time: this.state.date + " " + this.state.time,
                teams: this.state.teams,
                judges: this.state.judges,
                criteria: this.state.criteria
            })
        }).then(response => {
            if (!response.ok) {
                return response.json().then(errorText => {
                    throw new Error(errorText["error"])
                });
            }
            return response.json()
        })
            .then(result => { //if things went well
                const pin = result["pin"];
                this.setState({
                    onSuccess: true,
                    successPIN: pin
                })
            })
            .catch(err => { //otherwise show error alert
                console.log(err);
                this.setState({
                    onFail: true,
                    errToShow: err.message
                })
            })
    }

    render() {
        const failed = this.state.onFail;

        //submitEvent() will change onFail if server-side validation failed
        const validate = () => {
            if (failed) {
                return (
                    <div>
                        <Alert color="danger">
                            Something went wrong, try again. {this.state.errToShow}
                        </Alert>
                    </div>
                )
            }
        }
        if (this.state.onSuccess) {
            return (
                <div className="create-form-container">
                    <Alert color="success">
                        Event created Successfully.
                    </Alert>
                    <EventProfile
                        pin={this.state.successPIN}
                        name={this.state.name}
                        time={this.state.time}
                        date={this.state.date}
                        teams={this.state.teams}/>
                </div>
            )
        }

        return (
            <div className="create-form-container">
                <Form onSubmit={this.submitEvent}>
                    <FormGroup>
                        <div className="typewriter">
                            <Label className="event-label" for="headerMsg">Create New Event...</Label>
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <Label for="eventName">Event Name</Label>

                        <Input
                            type="text"
                            id="eventName"
                            onChange={this.useInputName}
                            placeholder="Event Name"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="eventDate">Date</Label>
                        <Input
                            type="date"
                            id="eventDate"
                            onChange={this.useInputDate}
                            placeholder="date placeholder"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="eventTime">Time</Label>
                        <Input
                            type="time"
                            id="eventTime"
                            onChange={this.useInputTime}
                            placeholder="time placeholder"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="criteriaList">Event Criteria, One Per Line</Label>
                        <Input
                            type="textarea"
                            id="criteriaList"
                            onChange={this.useInputCriteria}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="teamsList">Team Names, One Per Line</Label>
                        <Input
                            type="textarea"
                            id="teamsList"
                            onChange={this.useInputTeams}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="judgesList">Judge's Names, One Per Line</Label>
                        <Input
                            type="textarea"
                            id="judgesList"
                            onChange={this.useInputJudges}
                        />
                    </FormGroup>
                    <Button className="b-btn btn-outline-secondary">Submit</Button>
                </Form>
                {validate()}
            </div>
        );
    }
}

export default CreateEvent;