from django.urls import path
from .views import *

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is-authenticated', IsAuthenticated.as_view()),
    path('current-song', CurrentSong.as_view()),
    path('pause', PauseSong.as_view()),
    path('play', PlaySong.as_view()),
    path('skip', SkipSong.as_view(), name='skip-song'),
    path('search/', SearchSong.as_view(), name='search_songs'),
    path('add/', AddToQueue.as_view()),
    path('remove/', RemoveFromQueue.as_view()),
    path('queue/', GetQueue.as_view()),
]