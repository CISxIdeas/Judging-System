import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Button, Table, Form, FormGroup, Label, Input, CustomInput, Alert} from 'reactstrap';
import TeamInfoModal from "./TeamInfoModal";
import {getCookie} from "./Utils";

/**
 * The main component for the app. It shows information about the team
 * that is currently being judged and lets users vote on a pair as well
 * as save notes for a team.
 *
 * Additionally, this component displays a list of teams that are part of
 * the current event being judged.
 */
class Judge extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentJudge: props.judge_name,
            eventName: props.eventName,
            teams: props.teams,
            criteria: props.criteria,
            currentCriteria: 0,
            eventPin: props.eventPin,
            teamJudgingOne: props.teams[0],
            teamJudgingTwo: '',
            winnerScore: 1,
            winner: props.teams[0],
            slider: 50,
            finishedTeam: '',
            notes: '',
            updateTeams: false
        }
    }

    componentDidMount() {
        this.getNewTeams();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //the change of teamJudgingOne sets of a chane of events where
        //getNewTeams will fetch new teams from the server and update the UI
        if (this.state.teamJudgingOne !== prevState.teamJudgingOne) {
            this.getNewTeams();
        }

        if (this.state.updateTeams !== prevState.updateTeams) {
            this.findWinner(this.state.slider)
        }

        if (this.state.currentCriteria !== prevState.currentCriteria) {
            this.getNewTeams();
        }
    }

    /**
     * criteria methods change the current criteria being judged.
     *
     * @param e the event calling these methods
     * @public
     */
    nextCriteria = () => {
        const currCrit = this.state.currentCriteria;
        const nextCrit = currCrit + 1 > this.state.criteria.length - 1 ? currCrit : currCrit + 1;

        this.setState({
            currentCriteria: nextCrit
        })
    }

    prevCriteria = () => {
        const currCrit = this.state.currentCriteria;
        const prevCrit = currCrit - 1 < 1 ? 0 : currCrit - 1;

        this.setState({
            currentCriteria: prevCrit
        })
    }

    /**
     * needed to handle input information from the slider field
     *
     * @param e the event calling these methods
     * @public
     */
    sliderValue = (e) => {
        const val = e.target.value;
        this.findWinner(val);

        this.setState({
            slider: e.target.value
        })
    }

    /**
     * takes a value, currently from the slider, and finds which team was voted as the winner
     * it also sets the score for the winner
     *
     * @param e the event calling these methods
     * @public
     */
    findWinner = (val) => {
        let winner = '';
        let score = 0;
        if (val > 90) {
            winner = this.state.teamJudgingTwo;
            score = 3;
        } else if (val > 70) {
            winner = this.state.teamJudgingTwo
            score = 2
        } else if (val > 50) {
            winner = this.state.teamJudgingTwo;
            score = 1;
        } else if (val > 30) {
            winner = this.state.teamJudgingOne;
            score = 1;
        } else if (val > 10) {
            winner = this.state.teamJudgingOne;
            score = 2;
        } else {
            winner = this.state.teamJudgingOne;
            score = 3;
        }

        this.setState({
            winnerScore: score,
            winner: winner
        });
    }

    changeJudgingTeam = (team) => {
        this.setState({
            teamJudgingOne: team
        })
    }

    /**
     * this is the most important method for the app. It fetches the next teams to be shown
     * so that the judge will grade them. The server does all of the calculations
     * but the UI will display the teams if there are more teams to judge or it will
     * display a message when no more teams to judge are available.
     *
     * @public
     */
    getNewTeams = () => {
        const crit = this.state.criteria[this.state.currentCriteria];
        fetch(`/judge-pair?event=${this.state.eventPin}&criteria=${crit}&team-judging=${this.state.teamJudgingOne}&judge=${this.state.currentJudge}`).then(response => {
            if (!response.ok) {
                return response.json().then(errorText => {
                    throw new Error(errorText["error"])
                });
            }
            return response.json()
        }).then(data => {
            //there are still some teams to judge
            if (data["success"]) {
                this.setState({
                    teamJudgingOne: data["team1"],
                    teamJudgingTwo: data["team2"],
                    updateTeams: !this.state.updateTeams,
                    finishedTeam: '',
                    notes: data["notes"]
                })
                console.log("found teams");
            } else {
                //there are no more teams to judge
                this.setState({
                    finishedTeam: data["finished"]
                })
            }
        })
            .catch(err => {
                console.log("error happened in getNewTeams: ");
                console.log(err.message);
            })
    }

    /**
     * when "vote" is clicked, a post call to the server is made so that
     * the judge's decision is store in the database.
     *
     * @param e the event calling these methods
     * @public
     */
    submitScore = (e) => {
        e.preventDefault();

        const token = getCookie('csrftoken');

        //send call to API
        fetch('/vote', {
            method: 'POST',
            headers: {
                'X-CSRFToken': token
            },
            body: JSON.stringify({
                event_name: this.state.eventName,
                team_one: this.state.teamJudgingOne,
                team_two: this.state.teamJudgingTwo,
                criteria: this.state.criteria[this.state.currentCriteria],
                judge_name: this.state.currentJudge,
                winner: this.state.winner,
                winner_score: this.state.winnerScore
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
                if (result["success"]) {
                    this.getNewTeams();
                }
            })
            .catch(err => { //otherwise print error
                console.log(err);
            })
    }


    useInputNotes = (e) => {
        this.setState({
            notes: e.target.value
        })
    }

    /**
     * when the save button is clicked, the current notes will be saved or
     * updated for the team/criteria/judge/event combination
     *
     * @param e the event calling these methods
     * @public
     */
    saveNotes = (e) => {
        e.preventDefault();

        const token = getCookie('csrftoken');

        //send call to API
        fetch('/note', {
            method: 'POST',
            headers: {
                'X-CSRFToken': token
            },
            body: JSON.stringify({
                team: this.state.teamJudgingOne,
                judge: this.state.currentJudge,
                note_text: this.state.notes,
                event_name: this.state.eventName
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
                console.log("notes saved")
            })
            .catch(err => { //otherwise print error
                console.log(err);
            })
    }

    render() {
        // makes the rows for the sidebar in the judge page
        const makeRows = this.state.teams.map((name, i) => {
            return (
                <tr key={i}>
                    <td>{name}</td>
                    <td>
                        <div className="btn-group" role="group" aria-label="Judge Controls">
                            <TeamInfoModal teamName={name} eventPin={this.state.eventPin}
                                           currentJudge={this.state.currentJudge}/>
                            <Button onClick={() => {
                                this.changeJudgingTeam(name)
                            }} className="b-btn"> Judge </Button>
                        </div>
                    </td>
                </tr>
            )
        });

        // change the message and color for the slider
        const sliderMessage = () => {
            const val = this.state.slider;
            if (val > 90) {
                return (
                    <p style={{'fontSize': 'large', 'color': 'rgba(41,171,135, 1)', 'fontWeight': 'bold'}}>
                        {this.state.teamJudgingTwo} is undoubtedly better
                    </p>
                )

            } else if (val > 70) {
                return (
                    <p style={{'fontSize': 'large', 'color': 'rgba(41,171,135, .9)'}}>
                        {this.state.teamJudgingTwo} is clearly better
                    </p>
                )
            } else if (val > 50) {
                return (
                    <p style={{'fontSize': 'large', 'color': "rgba(41,171,135, .7)"}}>
                        {this.state.teamJudgingTwo} is slightly better
                    </p>
                )
            } else if (val > 30) {
                return (
                    <p style={{'fontSize': 'large', 'color': 'rgba(0,115,207,.7)'}}>
                        {this.state.teamJudgingOne} is slightly better
                    </p>
                )
            } else if (val > 10) {
                return (
                    <p style={{'fontSize': 'large', 'color': 'rgba(0,115,207,.9)'}}>
                        {this.state.teamJudgingOne} is clearly better
                    </p>
                )
            } else {
                return (
                    <p style={{'fontSize': 'large', 'color': 'rgb(0,115,207, 1)', 'fontWeight': 'bold'}}>
                        {this.state.teamJudgingOne} is undoubtedly better
                    </p>
                )
            }
        }

        //shows a message when there are no more teams to display or the team pair to judge
        const teamsJudging = () => {
            if (this.state.finishedTeam === this.state.teamJudgingOne) {
                return (
                    <Alert color="success">
                        Finished Judging This Criteria for {this.state.teamJudgingOne}
                    </Alert>
                )
            } else {
                return (
                    <div className="team-cards-judge">
                        <div className="card-deck">
                            <div className="card pick-team-card text-center">
                                <div className="card-body">
                                    <h5 className="card-title" style={{'color': 'rgb(0,115,207, 1)'}}>
                                        {this.state.teamJudgingOne}
                                    </h5>
                                </div>
                            </div>
                            <div className="card pick-team-card text-center">
                                <div className="card-body">
                                    <h5 className="card-title" style={{'color': 'rgba(41,171,135, 1)'}}>
                                        {this.state.teamJudgingTwo}
                                    </h5>
                                </div>
                            </div>
                        </div>
                        <Form>
                            <FormGroup className="text-center">
                                <Label className="slider-msg" for="winningCustomRange">{sliderMessage()} </Label>
                                <CustomInput onChange={this.sliderValue} type="range" id="winningRange"/>
                                <button className="b-btn btn-outline-secondary vote-btn"
                                        type="button" onClick={this.submitScore}>
                                    <strong>Vote</strong>
                                </button>
                            </FormGroup>
                            <FormGroup>
                                <Label for="exampleText">My Notes For {this.state.teamJudgingOne}</Label>
                                <Input type="textarea"
                                       id="exampleText"
                                       onChange={this.useInputNotes}
                                       value={this.state.notes}
                                >
                                </Input>
                            </FormGroup>
                            <button className="b-btn btn-outline-secondary"
                                    type="button" onClick={this.saveNotes}>
                                Save Notes
                            </button>
                        </Form>
                    </div>
                )
            }
        }

        return (
            <div className="judge-page">
                <div className="container-fluid text-center">
                    <div className="row content">
                        <div className="col-lg-8 col-md-12 col-sm-11 text-center">
                            <h1>{this.state.eventName.toUpperCase()}</h1>
                            <h3>Judge: {this.state.currentJudge}</h3>

                            <h4>
                                Current Criteria: {this.state.criteria[this.state.currentCriteria]}
                            </h4>

                            <div>
                                <button className="b-btn btn-outline-secondary btn-sm"
                                        type="button" onClick={this.prevCriteria}>
                                    <img src="https://img.icons8.com/material-rounded/12/000000/less-than.png"
                                         alt="prev"/>
                                </button>
                                <button className="b-btn btn-outline-secondary btn-sm"
                                        type="button" onClick={this.nextCriteria}>
                                    <img src="https://img.icons8.com/material-rounded/12/000000/more-than.png"
                                         alt="next"/>
                                </button>
                            </div>
                            {teamsJudging()}
                        </div>
                        <div className="col-lg-4 col-md-12 col-sm-11 sidenav ">
                            <div className="team-list-judge">
                                <Table className="team-table">
                                    <thead>
                                    <tr>
                                        <th>Team Name</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {makeRows}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Judge;