from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.urls import reverse
from django.utils.crypto import get_random_string
from django.contrib.auth.decorators import login_required
import json
import itertools

from .models import User, Event, Team, Result, Grade, Notes


def index(request):
    """
        As a single page app, many links and routes will default to index.
        This will render the single html used, outside of the login and register pages.
    """
    return render(request, "hackathon/index.html")


@login_required
def create(request):
    """
        Creates a new Event object from the information sent by the Create Event Form.
        Validates the information as necessary.

        Args:
            request (HttpRequest): contains metadata about the page request

        Returns:
            an JsonResponse object with confirmation of success of failure
    """
    if request.method == "POST":
        data = json.loads(request.body)
        event_name = data.get("event_name", "")
        date = data.get("date_time", "")
        teams = data.get("teams", "")
        judges = data.get("judges", "")
        criteria = data.get("criteria", "")

        if not event_name.strip():
            return JsonResponse({"error": "No name entered"}, status=400)
        if not teams.strip():
            return JsonResponse({"error": "No teams entered"}, status=400)
        if not judges.strip():
            return JsonResponse({"error": "No judges entered"}, status=400)
        if not criteria.strip():
            return JsonResponse({"error": "No criteria entered"}, status=400)

        unique_pin = get_random_string(length=6)
        teams = teams.split('\n')
        judges = judges.split('\n')
        criteria = criteria.split('\n')

        # create a new Event
        new_event = Event(name=event_name, date=date, pin=unique_pin, organizer=request.user)
        new_event.set_judges(judges)
        new_event.set_criteria(criteria)
        new_event.save()

        # create teams and team's results
        for t in teams:
            new_team = Team(name=t, event=new_event)
            new_team.save()
            team_result = Result(team=new_team, event=new_event)
            team_result.save()

        return JsonResponse({"success": "new event created", "pin": unique_pin}, safe=False)
    else:
        return JsonResponse({"error": "POST request required"}, status=400)


@login_required
def my_events(request):
    """
        Returns a list of events for which the current user is the organizer.

        Args:
            request (HttpRequest): contains metadata about the page request

        Returns:
            an JsonResponse object with the calculated options
    """
    events = Event.objects.filter(organizer=request.user).all()

    all_events = [e.serialize() for e in events]

    if len(all_events) == 0:
        return JsonResponse({"error": "No events found"}, status=400)
    else:
        return JsonResponse(all_events, safe=False)


def results(request):
    """
        Returns scores for teams in the requested event, in descending order.

        Args:
            request (HttpRequest): contains metadata about the page request

        Returns:
            an JsonResponse object with the calculated options
    """
    event_pin = request.GET.get("event")

    all_results = Result.objects.filter(event__pin=event_pin).order_by('-score').all()

    to_show = [res.serialize() for res in all_results]

    return JsonResponse({"results": to_show}, safe=False)


def note(request):
    """
        On GET, returns the desired note text for the event/criteria/judge/team combination.
        On POST, updates or creates a new note for the event/criteria/judge/team combination.

        Args:
            request (HttpRequest): contains metadata about the page request

        Returns:
            an JsonResponse object with success or failure message
    """
    if request.method == "POST":
        data = json.loads(request.body)
        team = data.get("team", "")
        judge = data.get("judge", "")
        note_text = data.get("note_text", "")
        event_name = data.get("event_name", "")

        if not team.strip():
            return JsonResponse({"error": "No team entered"}, status=400)
        if not judge.strip():
            return JsonResponse({"error": "No judge entered"}, status=400)
        if not note_text.strip():
            return JsonResponse({"error": "No note text entered"}, status=400)
        if not event_name.strip():
            return JsonResponse({"error": "No event name entered"}, status=400)

        try:
            team_found = Team.objects.get(name=team)
        except Team.DoesNotExist:
            return JsonResponse({"error": "Wrong Team Name, ask for help"}, status=400)

        try:
            event_found = Event.objects.get(name=event_name)
        except Team.DoesNotExist:
            return JsonResponse({"error": "Wrong Event Name, ask for help"}, status=400)

        try:
            note_found = Notes.objects.get(team=team_found, judge=judge, event=event_found)
            note_found.text = note_text
            note_found.save()
        except Notes.DoesNotExist:
            new_note = Notes(team=team_found, judge=judge, text=note_text, event=event_found)
            new_note.save()

        return JsonResponse({"success": "new note created"}, safe=False)

    if request.method == "GET":
        event_pin = request.GET.get("event")
        team = request.GET.get("team")
        judge = request.GET.get("judge")

        try:
            team_found = Team.objects.get(name=team)
        except Team.DoesNotExist:
            return JsonResponse({"error": "Wrong Team Name, ask for help"}, status=400)

        try:
            event_found = Event.objects.get(pin=event_pin)
        except Team.DoesNotExist:
            return JsonResponse({"error": "Wrong Event Name, ask for help"}, status=400)

        try:
            note_found = Notes.objects.get(team=team_found, judge=judge, event=event_found)
            note_text = note_found.text
        except Notes.DoesNotExist:
            note_text = ""

        return JsonResponse({"success": "team/event/judge combination found",
                             "team": team_found.name,
                             "event": event_found.name,
                             "notes": note_text}, safe=False)


def event(request, event_pin):
    """
        Returns a serialized object of the Event requested. See models.py for serialized info.

        Args:
            request (HttpRequest): contains metadata about the page request
            event_pin (string): the pin for the event requested

        Returns:
            an JsonResponse object with the calculated options
    """
    try:
        find_event = Event.objects.get(pin=event_pin)
    except Event.DoesNotExist:
        find_event = None

    if find_event is None:
        return JsonResponse({"error": "The event doesn't exist"}, status=400)
    else:
        teams = Team.objects.filter(event=find_event).all()
        all_teams = [t.name for t in teams]
        all_info = find_event.serialize()
        all_info["teams"] = all_teams
        return JsonResponse(all_info, safe=False)


def pair(request):
    """
        Used to obtain the next pair to be compared. This method looks at all possible
        combinations of pairs for an Event and only returns a pair if it has not been judged
        before by this judge for this criteria for this event.

        Args:
            request (HttpRequest): contains metadata about the page request

        Returns:
            an JsonResponse object with the calculated options, including both team names
            notes text for the team on the left of the screen
            returns "finished" if there are no more combinations to show.
    """
    event_pin = request.GET.get("event")
    criteria = request.GET.get("criteria")
    team_judging = request.GET.get("team-judging")
    judge = request.GET.get("judge")

    try:
        find_event = Event.objects.get(pin=event_pin)
    except Event.DoesNotExist:
        find_event = None

    if find_event is None:
        return JsonResponse({"error": "the event doesn't exist"}, status=400)
    else:
        teams = Team.objects.filter(event=find_event).all()
        team_names = [t.name for t in teams]

        # get all possible combinations
        combo = itertools.combinations(team_names, 2)
        for (team1, team2) in combo:
            # for each combination, try to find a grade
            grade_found = Grade.objects.filter(team_one__name__exact=team1,
                                               team_two__name__exact=team2,
                                               criteria__exact=criteria,
                                               event=find_event,
                                               judge_name=judge)

            grade_found_opp = Grade.objects.filter(team_one__name__exact=team2,
                                                   team_two__name__exact=team1,
                                                   criteria__exact=criteria,
                                                   event=find_event,
                                                   judge_name=judge)

            # if grades for that combination are not found, then this pair hasn't
            # been judged yet
            if grade_found.count() == 0 and grade_found_opp.count() == 0:
                if team1 == team_judging:
                    # which means we can query the notes and return the pair as JSON
                    return query_pair(team1, team2, judge, find_event)
                elif team2 == team_judging:
                    return query_pair(team2, team1, judge, find_event)

        # if the loop finished without ever returning, then that means that there are
        # no more pairs to judge for this criteria/judge/event combination
        return JsonResponse({"finished": team_judging}, safe=False)


def query_pair(team1, team2, judge, find_event):
    """
        Used to find the notes for a team pair/judge/event combination and build the
        necessary JSON for judging to happen

        Args:
            team1 (str): team being judged
            team2 (str): team being judged against
            judge (str): current judge
            find_event (Event): current event
        Returns:
            an JsonResponse object with the pair and the notes for team 1
    """
    try:
        note_found = Notes.objects.get(team__name__exact=team1, event=find_event, judge=judge)
        note_text = note_found.text
    except Notes.DoesNotExist:
        note_text = ''
    return JsonResponse({"success": "teams found",
                         "team1": team1,
                         "team2": team2,
                         "notes": note_text}, safe=False)


def vote(request):
    """
        Used to post a vote(as a Grade object) for a pair/criteria/judge/event combination.
        The score for the winning team in the comparison is updated.

        Args:
            request (HttpRequest): contains metadata about the page request

        Returns:
            an JsonResponse object stating success or failure
    """
    if request.method == "POST":
        data = json.loads(request.body)
        event_name = data.get("event_name", "")
        team_one = data.get("team_one", "")
        team_two = data.get("team_two", "")
        crit = data.get("criteria", "")
        judge_name = data.get("judge_name", "")
        winner = data.get("winner", "")
        winner_score = data.get("winner_score", "")

        print("winner submitted: " + winner)
        print("winner score: " + str(winner_score))

        try:
            event_found = Event.objects.get(name=event_name)
        except Event.DoesNotExist:
            return JsonResponse({"error": "Event doesn't Exist"}, status=400)

        try:
            team_one_found = Team.objects.get(name=team_one)
            team_two_found = Team.objects.get(name=team_two)
            winner_found = Team.objects.get(name=winner)
        except Event.DoesNotExist:
            return JsonResponse({"error": "Team doesn't Exist"}, status=400)

        new_grade = Grade(team_one=team_one_found,
                          team_two=team_two_found,
                          event=event_found,
                          criteria=crit,
                          judge_name=judge_name)
        new_grade.save()

        try:
            prev_result = Result.objects.get(team=winner_found, event=event_found)
            prev_score = prev_result.score
            new_score = prev_score + winner_score
            prev_result.score = new_score
            prev_result.save()
        except Result.DoesNotExist:
            new_result = Result(team=winner_found, event=event_found, score=winner_score)
            new_result.save()

        msg = "new grade and score was added for " + team_one
        return JsonResponse({"success": msg}, safe=False)


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "hackathon/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "hackathon/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect("/organizer")
    else:
        return render(request, "hackathon/register.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect("/organizer")
        else:
            return render(request, "hackathon/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "hackathon/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))
