import os
from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from urllib.parse import urlparse, parse_qs

load_dotenv()

class YouTubeClient:
    def __init__(self):
        self.api_key = os.getenv("YOUTUBE_API_KEY")
        if not self.api_key:
            print("⚠️ WARNING: YOUTUBE_API_KEY not found in .env")
            self.youtube = None
        else:
            try:
                self.youtube = build("youtube", "v3", developerKey=self.api_key)
            except Exception as e:
                print(f"⚠️ Failed to initialize YouTube API: {e}")
                self.youtube = None

    def extract_video_id(self, url):
        """Extracts video ID from various YouTube URL formats."""
        parsed_url = urlparse(url)
        if parsed_url.hostname == 'youtu.be':
            return parsed_url.path[1:]
        if parsed_url.hostname in ('www.youtube.com', 'youtube.com'):
            if parsed_url.path == '/watch':
                p = parse_qs(parsed_url.query)
                return p['v'][0]
            if parsed_url.path[:7] == '/embed/':
                return parsed_url.path.split('/')[2]
            if parsed_url.path[:3] == '/v/':
                return parsed_url.path.split('/')[2]
        return None

    def get_video_stats(self, video_id):
        """Fetches viewCount, likeCount, commentCount."""
        if not self.youtube: return None
        try:
            request = self.youtube.videos().list(
                part="snippet,statistics",
                id=video_id
            )
            response = request.execute()
            if not response['items']: return None
            
            stats = response['items'][0]['statistics']
            snippet = response['items'][0]['snippet']
            
            return {
                "title": snippet.get("title", "Unknown"),
                "viewCount": int(stats.get("viewCount", 0)),
                "likeCount": int(stats.get("likeCount", 0)),
                "commentCount": int(stats.get("commentCount", 0)),
                "publishedAt": snippet.get("publishedAt", "")
            }
        except HttpError as e:
            print(f"YouTube API Error: {e}")
            return None

    def get_comments(self, video_id, max_results=50):
        """Fetches top comments for sentiment analysis."""
        if not self.youtube: return []
        try:
            request = self.youtube.commentThreads().list(
                part="snippet",
                videoId=video_id,
                maxResults=max_results,
                textFormat="plainText"
            )
            response = request.execute()
            
            comments = []
            for item in response.get("items", []):
                comment = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
                comments.append(comment)
            return comments
        except Exception:
            return []

    def search_video(self, query):
        """Searches for a video related to a trend keyword."""
        if not self.youtube: return None
        try:
            request = self.youtube.search().list(
                part="id,snippet",
                q=query,
                type="video",
                maxResults=1,
                order="relevance"
            )
            response = request.execute()
            return response.get("items", [])
        except Exception as e:
            print(f"Search Error: {e}")
            return None