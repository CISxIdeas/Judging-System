import React, {Component} from 'react';
import {Alert, Button, Table} from "reactstrap";
import {Redirect, useHistory} from 'react-router-dom';
import EventResults from "./EventResults";

/**
 * Shows information about events that the current user is
 * organizing.
 *
 * Provides a link to see the results for any given event being
 * organized by the current user.
 */
class OrgProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            teams: [],
            onFailure: false,
            errToShow: '',
            redirect: false,
            redirPath: '',
            showResults: false,
            eventPinRes: ''
        }
        this.getEvents();
    }

    /**
     * fetches event for the user currently logged in
     *
     * @public
     */
    getEvents = () => {
        fetch(`/myevents`).then(response => {
            if (!response.ok) {
                return response.json().then(errorText => {
                    throw new Error(errorText["error"])
                });
            }
            return response.json()
        }).then(data => {
            this.setState({
                teams: data
            })
        })
            .catch(err => {
                this.setState({
                    onFailure: true,
                    errToShow: err.message
                })
            })
    }

    eventRedirect = (path) => {
        this.setState({
            redirect: true,
            redirPath: path
        })
    }

    showResults = (teamPin) => {
        this.setState({
            showResults: true,
            eventPinRes: teamPin
        })
    }

    render() {
        // go to the event which was clicked by the user. managed by the "go to" button.
        if (this.state.redirect) {
            return <Redirect push to={this.state.redirPath}/>;
        }

        const fail = this.state.onFailure;

        // displays an error alert if there are no teams for the current user.
        const validate = () => {
            if(this.state.showResults)
            {
                return <EventResults eventPin={this.state.eventPinRes}></EventResults>
            }
            if (fail) {
                return (
                    <div>
                        <Alert color="danger">
                            Sorry, {this.state.errToShow}. Use the Create tab to make a new event
                        </Alert>
                    </div>
                )
            } else {
                return (
                    <Table className="team-table">
                        <thead>
                        <tr>
                            <th>Event Name</th>
                            <th>PIN</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {makeRows}
                        </tbody>
                    </Table>
                )
            }
        }

        // makes a row for each event found, including the name, pin, scores button and "go to" button
        const makeRows = this.state.teams.map((event, i) => {
            return (
                <tr key={i}>
                    <td>{event["name"]}</td>
                    <td>{event["pin"]}</td>
                    <td>
                        <div className="btn-group" role="group" aria-label="Hackathons Avail">
                            <Button className="b-btn" onClick={() => {this.showResults(event["pin"])}}> Results </Button>
                            <Button className="b-btn" onClick={() => {this.eventRedirect(`/hackathon/${event["pin"]}`)}}> Go To </Button>
                        </div>
                    </td>
                </tr>
            )
        });
        return (
            <div>
                <div className="create-form-container">
                    {validate()}
                </div>
            </div>
        );
    }
}

export default OrgProfile;