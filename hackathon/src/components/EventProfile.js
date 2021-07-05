import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {Button} from "reactstrap";

/**
 * functional component that is used to show information about an Event
 */
function EventProfile(props) {

    //redirect to a new url for the event being displayed
    const history = useHistory();
    const goToHackathon = () => {
        history.push(`/hackathon/${props.pin}`);
    }

    return (
        <div>
            <h1>
                Your event's PIN is: {props.pin}
            </h1>
            <h3>
                Name: {props.name}
            </h3>
            <h3>
                Date: {props.date}
            </h3>
            <h3>
                Time: {props.time}
            </h3>
            <h3>
                Teams:
            </h3>
            <ul>
                {props.teams.split('\n').map((li, i) => <li key={i}>{li}</li>)}
            </ul>
            <Button
                onClick={goToHackathon}
                className="b-btn"
            >Judge Hackathon</Button>
        </div>
    )
}

export default EventProfile;