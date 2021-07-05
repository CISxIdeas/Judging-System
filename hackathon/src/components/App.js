import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Homepage from './Homepage';
import Join from "./Join";
import ChooseName from "./ChooseName";
import TeamProfile from "./TeamProfile";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import Judge from "./Judge";
import OrgProfile from "./OrgProfile";
import CreateEvent from "./CreateEvent";
import TeamInfoModal from "./TeamInfoModal";

/**
 * The single page app for this project
 */
class App extends Component {
    render() {
        return (
            <Router>
                <div>
                    <Switch>
                        <Route path="/" exact component={Homepage}/>
                        <Route path="/join" exact component={Join}/>
                        <Route path="/hackathon/:pin" exact component={ChooseName}/>
                        <Route path="/profile/:teamName" exact component={TeamInfoModal}/> //needed??
                        <Route path="/organizer" exact component={OrgProfile}/>
                        <Route path="/create-event" exact component={CreateEvent}/>
                    </Switch>
                </div>
            </Router>

        )
    }
}

ReactDOM.render(<App/>, document.getElementById('app'));
