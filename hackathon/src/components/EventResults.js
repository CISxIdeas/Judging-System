import React, {useState, useEffect} from 'react';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter, Table} from 'reactstrap';

/**
 * functional component that shows information about
 * the results of an event as a table.
 */
const EventResults = (props) => {

    const [results, setResults] = useState([]);
    const [refresh, setRefresh] = useState(false);

    //updates the results table when refresh is clicked
    useEffect(() => {
        getResults();
    }, [refresh])

    /**
     * gets all of the results for an event from the server
     *
     * @public
     */
    const getResults = () => {
        fetch(`/results?event=${props.eventPin}`).then(response => {
            if (!response.ok) {
                return response.json().then(errorText => {
                    throw new Error(errorText["error"])
                });
            }
            return response.json()
        }).then(data => {
            setResults(data["results"]); //save results to display
        })
            .catch(err => {
                console.log("some error happened in getResults: ");
                console.log(err.message);
            })
    }

    //make a table row for each team in the results array
    const makeRows = results.map((res, i) => {
        return (
            <tr key={i}>
                <td>{res["team_name"]}</td>
                <td>{res["score"]}</td>
            </tr>
        )
    });

    return (
        <div>
            <div className="create-form-container">
                <Table className="team-table">
                    <thead>
                    <tr>
                        <th>Team Name</th>
                        <th>Score</th>
                    </tr>
                    </thead>
                    <tbody>
                    {makeRows}
                    </tbody>
                </Table>
                <Button className="b-btn" onClick={() => setRefresh(!refresh)}>Refresh Results</Button>
            </div>
        </div>
    );
};

export default EventResults;