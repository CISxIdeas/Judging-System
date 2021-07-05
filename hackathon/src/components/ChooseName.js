import React, {Component} from 'react';
import {Card, Button, CardTitle, CardText, Alert} from 'reactstrap';
import {Redirect} from "react-router-dom";
import Judge from "./Judge";

/**
 * Provides a responsive grid from where user can pick their name
 * and then be taken to the appropriate Event to judge.
 *
 * This is the only channel to get to the Judge Component
 */
class ChooseName extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            picked: '',
            judges: [],
            eventName: '',
            teams: [],
            criteria: [],
            onFailure: false,
            errToShow: ''
        }
    }

    componentDidMount() {
        this.getJudges();
    }

    /**
     * Fetches the list of judges for an Event from the server
     */
    getJudges = () => {
        fetch(`/event/${this.props.match.params.pin}`).then(response => {
            if (!response.ok) {
                return response.json().then(errorText => {
                    throw new Error(errorText["error"])
                });
            }
            return response.json()
        }).then(data => {
            let judgesFound = data["judges"];
            let eventName = data["name"];
            let teams = data["teams"];
            let criteria = data["criteria"];

            this.setState({
                judges: judgesFound,
                eventName: eventName,
                teams: teams,
                criteria: criteria
            })

        })
            .catch(err => {
                this.setState({
                    onFailure: true,
                    errToShow: err.message
                })
            })
    }

    handleEnter = (judgeName) => {
        this.setState({redirect: true, picked: judgeName});
    };

    //user to make a card for each judge in the list obtained by getJudges()
    makeCards = () => {
        const cards = this.state.judges.map((name, i) => {
            return (
                <div className="col mb-4" key={i}>
                    <div className="card judge-card">
                        <div className="card-body">
                            <h5 className="card-title">
                                {name}
                            </h5>
                            <Button onClick={() => this.handleEnter(name)}> Judge </Button>
                        </div>
                    </div>
                </div>
            )
        });

        return cards;
    }


    render() {
        if (this.state.onFailure) {
            return (
                <div>
                    <Alert color="danger">
                        Oh no! {this.state.errToShow}. Please try again with a different pin
                    </Alert>
                </div>
            )
        }

        //the judge button will cause a redirect to happen. This redirect will show the Judge
        //component as opposed to the alert or judge cards.
        if (this.state.redirect) {
            return <Judge
                judge_name={this.state.picked}
                eventName={this.state.eventName}
                teams={this.state.teams}
                criteria={this.state.criteria}
                eventPin={this.props.match.params.pin}/>
        }

        return (
            <div className="center-names">
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
                    {this.makeCards()}
                </div>
            </div>
        )
    }
}

export default ChooseName;