from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import localtime
import json


# Create your models here.
class User(AbstractUser):
    pass


class Event(models.Model):
    # name
    name = models.CharField(max_length=256)
    # date/time
    date = models.CharField(max_length=256)
    # pin
    pin = models.CharField(max_length=256)

    judges = models.CharField(max_length=1024)

    criteria = models.CharField(max_length=2048)

    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="event_organizer", default="")

    def set_criteria(self, n):
        self.criteria = json.dumps(n)

    def get_criteria(self):
        return json.loads(self.criteria)

    def set_judges(self, n):
        self.judges = json.dumps(n)

    def get_judges(self):
        return json.loads(self.judges)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "date": self.date,
            "pin": self.pin,
            "judges": self.get_judges(),
            "criteria": self.get_criteria(),
            "organizer": self.organizer.username
        }


class Team(models.Model):
    # name
    name = models.CharField(max_length=256)
    # members
    members = models.CharField(max_length=256)
    # photo
    photo_url = models.CharField(max_length=1024, blank=False, null=False, default="placeholder")

    event = models.ForeignKey(Event, related_name='event_name', on_delete=models.CASCADE)

    def set_members(self, n):
        self.set_members = json.dumps(n)

    def get_members(self):
        return json.loads(self.members)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "members": self.members,
            "photo_url": self.photo_url,
        }


class Result(models.Model):
    # Team
    team = models.ForeignKey(Team, related_name='team_info', on_delete=models.CASCADE)
    # Event
    event = models.ForeignKey(Event, related_name='event_info', on_delete=models.CASCADE)
    # score
    score = models.DecimalField(default=0, decimal_places=2, max_digits=16)

    def serialize(self):
        return {
            "team_name": self.team.name,
            "team_id": self.team.id,
            "event_name": self.event.name,
            "event_id": self.event.id,
            "score": self.score,
        }


class Grade(models.Model):
    # team 1
    team_one = models.ForeignKey(Team, related_name='team_one_grade', on_delete=models.CASCADE)

    # team 2
    team_two = models.ForeignKey(Team, related_name='team_two_grade', on_delete=models.CASCADE)

    event = models.ForeignKey(Event, related_name='event_team_grade', on_delete=models.CASCADE)

    criteria = models.CharField(max_length=256, default="default criteria")

    judge_name = models.CharField(max_length=256)


class Notes(models.Model):
    team = models.ForeignKey(Team, related_name="team_notes", on_delete=models.CASCADE)

    judge = models.CharField(max_length=256)

    text = models.CharField(max_length=2048)

    event = models.ForeignKey(Event, related_name="team_notes_event", on_delete=models.CASCADE)
