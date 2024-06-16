from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import *
from api.models import Room
from .models import Vote, SongQueue
from django.http import JsonResponse

class AuthURL(APIView):
    def get(self, request, format=None):
        
        room_code = request.GET.get('room_code')
        if room_code:
            request.session['room_code'] = room_code
        
        
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'    

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url
        return Response({'url': url}, status=status.HTTP_200_OK)
    

def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')
    
    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()
    
    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')
    
    session_id = request.session.session_key
    print("session_id from spotify callback", session_id)
    if session_id:
        update_or_create_user_tokens(request.session.session_key, access_token, token_type, expires_in, refresh_token)
    else: 
        #for some reason no session_id was provided
        print("No session_id_present", session_id, access_token, token_type, refresh_token, expires_in, error)
        
    room_code = request.session.get('room_code')
    if room_code:
        request.session['room_code'] = room_code
        
    # return redirect('frontend:')
    return redirect('frontend:')

class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)
    
class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        
        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        
        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)
        
        if 'error' in response or 'item' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')
        
        artist_string = ""
        
        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_string += ", "
            name = artist.get('name')
            artist_string += name
        
        votes = len(Vote.objects.filter(room=room, song_id=song_id))
        
        
        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': votes,
            'votes_required': room.votes_to_skip,
            'id': song_id
        }
        
        self.update_room_song(room, song_id)
        
        return Response(song, status=status.HTTP_200_OK)
    
    def update_room_song(self, room, song_id):
        current_song = room.current_song
        
        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            votes = Vote.objects.filter(room=room).delete()
    
    
class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        print(room_code)
        if not room_code:
            return Response({'message': 'No room code in session'}, status=status.HTTP_400_BAD_REQUEST)
        
        room = Room.objects.filter(code=room_code)[0]
        if not room:
            return Response({'message': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)
    
class PlaySong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        print(room_code)
        if not room_code:
            return Response({'message': 'No room code in session'}, status=status.HTTP_400_BAD_REQUEST)
        
        room = Room.objects.filter(code=room_code)[0]
        if not room:
            return Response({'message': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)
    
    
class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        votes_needed = room.votes_to_skip
        
        if self.request.session.session_key == room.host or len(votes) + 1 >= votes_needed:
            votes.delete()
            skip_song(room.host)
        else:
            vote = Vote(user=self.request.session.session_key, room=room, song_id=room.current_song)
            vote.save()
        
        return Response({}, status=status.HTTP_204_NO_CONTENT)
    
class SearchSong(APIView):
    def get(self, request, format=None):
        print("SearchSong view called")
        query = request.GET.get('query')
        print(f"Query parameter: {query}")
        if not query:
            return Response({'message': 'Query parameter is missing'}, status=status.HTTP_400_BAD_REQUEST)
        
        tokens = get_user_tokens(request.session.session_key)
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {tokens.access_token}'
        }
        url = f"https://api.spotify.com/v1/search?q={query}&type=track"
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()  # Raise an exception for 4xx or 5xx status codes
        except requests.RequestException as e:
            print(f"Error making Spotify API request: {e}")
            return Response({'message': 'Error fetching data from Spotify'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(response.json(), status=status.HTTP_200_OK)

class AddToQueue(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        song_id = request.data.get('song_id')
        title = request.data.get('title')
        artist = request.data.get('artist')
        album_cover = request.data.get('album_cover')
        
        if not room_code or not song_id:
            return Response({'message': 'Missing required parameters'}, status=status.HTTP_400_BAD_REQUEST)
        
        room = Room.objects.get(code=room_code)
        song = SongQueue(room=room, song_id=song_id, title=title, artist=artist, album_cover=album_cover)
        song.save()

        return Response({'message': 'Song added to queue'}, status=status.HTTP_201_CREATED)