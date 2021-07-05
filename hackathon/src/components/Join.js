import React, {Component} from 'react';
import {Redirect} from 'react-router-dom'
import ChooseName from "./ChooseName";

/**
 * Used to ask the user for an Event Pin, upon enter
 * a list of judges is shown for the event through redirection
 * of the current URL
 */
class Join extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            pin: ''
        }
    }

    handleEnter = () => {
        this.setState({redirect: true});
    };

    /**
     * methods starting with use are needed to handle input information
     * into the form fields
     *
     * @param e the event calling these methods
     * @public
     */
    useInputPin = (e) => {
        this.setState({
            pin: e.target.value
        })
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push to={`/hackathon/${this.state.pin}`}/>;
        }
        return (
            <div>
                <div className="center-names">
                    <div>
                        <h1> Enter Hackathon PIN </h1>
                        <div className="input-group mb-3">
                            <input id="input-pin" type="text" className="form-control" placeholder="PIN"
                                   aria-label="New Text" aria-describedby="basic-addon2" onChange={this.useInputPin}
                            />
                            <div className="input-group-append">
                                <button className="b-btn btn-outline-secondary"
                                        type="button" onClick={this.handleEnter}>
                                    Enter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Join;