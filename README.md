# Hackathon Judge

### Description
This tool is aimed at competition organizers and judges. It is intended
to provide a platform where competing teams can be assessed against a range
of criteria. 

### Video Description and Walkthrough
https://youtu.be/L6R5NolDnU4

### Installation
To build the project:
0. Install dependencies in requirements.txt and package.json
1. npm run dev
2. python manage.py runserver

### Current Dependencies

- React
- React-router
- Reactstrap
- Django
- Heroku (for deployment)

### Design

Most of this App lives in index.html, as a SPA.

HTML Files:
- register.html - uses django templates to register a new event organizer
- login.html - uses templates to login a new user
- layout.html - creates the navbar at the top of the page
- index.html - houses the SPA

SPA structure:
- Components:
    - For "Join Judging"
        - Join.js: a component that asks the user for a judging PIN, on enter
                    if the PIN is valid...
            - ChooseName.js: a list of available judges is presented, upon 
                    choosing your name from the list...
                - Judge.js: this is the main component for the app, it is created
                            with ease of use in mind. A judge is presented with two
                            teams and it is expected that the teams are compared to
                            one another across different criteria. 
                    - Notes for a particular team can be saved.
                    - Upon clicking vote, the winning team's score will be updated
                      according to the comparison level chosen. 1,2 or 3 points will
                      be awarded to that team.
                    - Comparison between teams removes subjectivity of rubrics and
                      helps create a better overall view of how each project did
                      relatively to others. 
                    - The algorithm used will prevent from duplicate comparisons
                      between teams and will only provide the next available pair
                      that has not been graded within this criteria. 
                    - TeamInfoModal.js: upon clicking on the "info" button for a
                                       group, a modal will present the notes for 
                                       the current judge/event/team combination
    - For "Create"
        - CreateEvent.js: presents a form that is used to create an Event object
            - EventProfile.js: Upon submission, an Event profile is shown to the
              user, or an alert if validation was not successful.    
    
    - For "My Hackathons"
        - OrgProfile.js: a list of the current logged in user's event's is shown
                        if the user is labeled as the organizer for that event.
                        Clicking on go to will send the user to the judge selection 
                        page.
            - EventResults.js: upon clicking on results, a list of team names and
                               scores is displayed in descending order.
                               Clicking on the refresh button will refresh the 
                               results on the page.
                               
- CSS:
    styles.css contains all of the styling for this app


### Possible future additions:
While the current app serves all of the needs for our hackathons, I would like to
add a few more features that were not priorities but couldn't be created in the
short amount of time for the project.

    - Give passcodes to each judge so a student with the pin will not be able
      to pretend to be a judge
    - Provide more user visual queues when notes and votes are saved. 
    - Add a statistics page so that the organizer can see a rundown for each team
    - Give teams a way to be able to check on the progress as the competition
      moves forward
    - Give teams an path, by using the event pin and their team name, to be able
      to change their details. These details would then show up when the info
      modal is pressed by the judge. 