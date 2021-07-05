import React, {Component} from 'react';

/**
 * Shows a welcome/branded message to the user.
 */
class Homepage extends Component {

    render() {
        return (
            <div>
                <div className="title-container">
                    <div className="typewriter">
                        <h1> a CISxIdeas product </h1>
                    </div>
                </div>
            </div>
        );
    }
}

export default Homepage;