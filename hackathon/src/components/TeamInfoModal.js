import React, {useState, useEffect} from 'react';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

/**
 * Used to fetch information about a team.
 * Currently it shows the team name and the judge/event/team note text.
 */
const TeamInfoModal = (props) => {
    const {
        buttonLabel,
        className
    } = props;

    const [modal, setModal] = useState(false);
    const [note, setNote] = useState("");

    const toggle = () => setModal(!modal);

    useEffect(() => {
        getNote();
    }, [note, modal])

    /**
     * fetches notes for a judge/team/event combination
     *
     * @public
     */
    const getNote = () => {
        fetch(`/note?event=${props.eventPin}&team=${props.teamName}&judge=${props.currentJudge}`).then(response => {
            if (!response.ok) {
                return response.json().then(errorText => {
                    throw new Error(errorText["error"])
                });
            }
            return response.json()
        }).then(data => {
            setNote(data["notes"])
        })
            .catch(err => {
                console.log("error happened in getNote: ");
                console.log(err.message);
            })
    }

    return (
        <div>
            <Button className="sb-btn" onClick={toggle}>Info</Button>
            <Modal isOpen={modal} toggle={toggle} className={className}>
                <ModalHeader toggle={toggle}>{props.teamName}</ModalHeader>
                <ModalBody>
                    My notes: {note}
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={toggle}>OK</Button>{' '}
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default TeamInfoModal;