from django.contrib import admin

from .models import User, Event, Team, Result, Grade, Notes

admin.site.register(User)
admin.site.register(Event)
admin.site.register(Team)
admin.site.register(Result)
admin.site.register(Grade)
admin.site.register(Notes)
