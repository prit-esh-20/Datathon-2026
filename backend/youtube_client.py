import os
import requests
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

class YouTubeClient:
    def __init__(self):
        self.youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY) if YOUTUBE_API_KEY else None

    def get_video_metadata(self, video_id):
        """Fetch video metadata: title, description, tags, publishedAt, viewCount, likeCount, commentCount"""
        if not self.youtube:
            return self._get_mock_metadata(video_id)
        
        try:
            request = self.youtube.videos().list(
                part="snippet,statistics",
                id=video_id
            )
            response = request.execute()
            
            if not response["items"]:
                return None
            
            item = response["items"][0]
            snippet = item["snippet"]
            stats = item["statistics"]
            
            return {
                "title": snippet["title"],
                "description": snippet["description"],
                "tags": snippet.get("tags", []),
                "publishedAt": snippet["publishedAt"],
                "viewCount": int(stats.get("viewCount", 0)),
                "likeCount": int(stats.get("likeCount", 0)),
                "commentCount": int(stats.get("commentCount", 0))
            }
        except Exception as e:
            print(f"Error fetching YouTube metadata: {e}")
            return self._get_mock_metadata(video_id)

    def get_video_comments(self, video_id, max_results=300):
        """Fetch a limited number of comments: text, timestamp, likeCount"""
        if not self.youtube:
            return self._get_mock_comments(video_id)
        
        comments = []
        try:
            request = self.youtube.commentThreads().list(
                part="snippet",
                videoId=video_id,
                maxResults=min(100, max_results),
                textFormat="plainText"
            )
            
            while request and len(comments) < max_results:
                response = request.execute()
                for item in response.get("items", []):
                    top_comment = item["snippet"]["topLevelComment"]["snippet"]
                    comments.append({
                        "text": top_comment["textDisplay"],
                        "timestamp": top_comment["publishedAt"],
                        "likeCount": int(top_comment.get("likeCount", 0))
                    })
                
                if "nextPageToken" in response and len(comments) < max_results:
                    request = self.youtube.commentThreads().list(
                        part="snippet",
                        videoId=video_id,
                        pageToken=response["nextPageToken"],
                        maxResults=min(100, max_results - len(comments)),
                        textFormat="plainText"
                    )
                else:
                    break
            
            return comments
        except Exception as e:
            print(f"Error fetching YouTube comments: {e}")
            return self._get_mock_comments(video_id)

    def _get_mock_metadata(self, video_id):
        return {
            "title": "Mock YouTube Video Title",
            "description": "Mock description for trend analysis.",
            "tags": ["trend", "analysis", "mock"],
            "publishedAt": "2024-01-01T00:00:00Z",
            "viewCount": 1500000,
            "likeCount": 85000,
            "commentCount": 4200
        }

    def _get_mock_comments(self, video_id):
        return [
            {"text": "This trend is dying.", "timestamp": "2024-01-02T10:00:00Z", "likeCount": 542},
            {"text": "I see this everywhere, getting annoying.", "timestamp": "2024-01-02T11:00:00Z", "likeCount": 120},
            {"text": "Great content!", "timestamp": "2024-01-02T12:00:00Z", "likeCount": 15}
        ]
