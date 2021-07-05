from django.urls import path, re_path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("register", views.register, name="register"),
    path("logout", views.logout_view, name="logout"),
    path("login", views.login_view, name="login"),
    path("create", views.create, name="create"),

    # API routes
    path("event/<str:event_pin>", views.event, name="event"),
    path("judge-pair", views.pair, name="judge-pair"),
    path("vote", views.vote, name="vote"),
    path("myevents", views.my_events, name="my_events"),
    path("note", views.note, name="note"),
    path("results", views.results, name="results"),

    # match all other pages, user by react router
    re_path(r'^$', views.index),
    re_path(r'^(?:.*)/?$', views.index)
]
