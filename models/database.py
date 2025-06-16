import os
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

load_dotenv()


class SupabaseDB:

    def __init__(self):
        url = os.getenv('SUPABASE_URL')
        anon_key = os.getenv('SUPABASE_ANON_KEY')
        service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

        if not url or not anon_key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables"
            )

        self.supabase: Client = create_client(url, anon_key)
        
        # Create a separate client with service role for file operations
        if service_key:
            self.supabase_admin: Client = create_client(url, service_key)
        else:
            self.supabase_admin = None
            logging.warning("SUPABASE_SERVICE_ROLE_KEY not set. File operations may fail.")

    def create_user(self, name, email, password_hash):
        """Create a new user"""
        try:
            result = self.supabase.table('users').insert({
                'name': name,
                'email': email,
                'password': password_hash,
                'queries_used': 0
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logging.error(f"Error creating user: {e}")
            return None

    def get_user_by_email(self, email):
        """Get user by email"""
        try:
            result = self.supabase.table('users').select('*').eq(
                'email', email).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logging.error(f"Error getting user: {e}")
            return None

    def get_user_by_id(self, user_id):
        """Get user by ID"""
        try:
            result = self.supabase.table('users').select('*').eq(
                'id', user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logging.error(f"Error getting user by ID: {e}")
            return None

    def update_user_queries(self, user_id, queries_used):
        """Update user query count"""
        try:
            result = self.supabase.table('users').update({
                'queries_used':
                queries_used
            }).eq('id', user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logging.error(f"Error updating user queries: {e}")
            return None

    def create_chat_session(self, session_id, user_id):
        """Create a new chat session"""
        try:
            result = self.supabase.table('chat_sessions').insert({
                'session_id':
                session_id,
                'user_id':
                user_id
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logging.error(f"Error creating chat session: {e}")
            return None

    def get_user_chat_sessions(self, user_id):
        """Get all chat sessions for a user"""
        try:
            result = self.supabase.table('chat_sessions').select('*').eq(
                'user_id', user_id).order('last_updated', desc=True).execute()
            return result.data
        except Exception as e:
            logging.error(f"Error getting chat sessions: {e}")
            return []

    def update_chat_session(self, session_id):
        """Update chat session last_updated timestamp"""
        try:
            from datetime import datetime
            result = self.supabase.table('chat_sessions').update({
                'last_updated': datetime.now().isoformat()
            }).eq('session_id', session_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logging.error(f"Error updating chat session: {e}")
            return None

    def add_chat_message(self, session_id, role, content, timestamp):
        """Add a message to a chat session"""
        try:
            result = self.supabase.table('chat_messages').insert({
                'session_id':
                session_id,
                'role':
                role,
                'content':
                content,
                'timestamp':
                timestamp
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logging.error(f"Error adding chat message: {e}")
            return None

    def get_chat_messages(self, session_id):
        """Get all messages for a chat session"""
        try:
            result = self.supabase.table('chat_messages').select('*').eq(
                'session_id', session_id).order('timestamp',
                                                desc=False).execute()
            return result.data
        except Exception as e:
            logging.error(f"Error getting chat messages: {e}")
            return []

    def delete_chat_session(self, session_id, user_id):
        """Delete a chat session and its messages"""
        try:
            # Delete messages first (due to foreign key constraint)
            self.supabase.table('chat_messages').delete().eq(
                'session_id', session_id).execute()

            # Delete session
            result = self.supabase.table('chat_sessions').delete().eq(
                'session_id', session_id).eq('user_id', user_id).execute()
            return True
        except Exception as e:
            logging.error(f"Error deleting chat session: {e}")
            return False

    def delete_all_user_chats(self, user_id):
        """Delete all chat sessions and messages for a user"""
        try:
            # Get all session IDs for the user
            sessions = self.get_user_chat_sessions(user_id)
            session_ids = [session['session_id'] for session in sessions]

            # Delete all messages for these sessions
            for session_id in session_ids:
                self.supabase.table('chat_messages').delete().eq(
                    'session_id', session_id).execute()

            # Delete all sessions
            self.supabase.table('chat_sessions').delete().eq(
                'user_id', user_id).execute()
            return True
        except Exception as e:
            logging.error(f"Error deleting all user chats: {e}")
            return False

    def upload_audio_file(self, file_name, file_data):
        """Upload audio file to Supabase Storage"""
        try:
            # Use admin client for file operations to bypass RLS
            client_to_use = self.supabase_admin if self.supabase_admin else self.supabase
            
            result = client_to_use.storage.from_('audio-files').upload(
                file_name, file_data, file_options={'content-type': 'audio/mpeg'}
            )
            return result
        except Exception as e:
            logging.error(f"Error uploading audio file: {e}")
            return None

    def get_audio_file_url(self, file_name):
        """Get public URL for audio file from Supabase Storage"""
        try:
            # Can use regular client for getting public URLs
            url = self.supabase.storage.from_('audio-files').get_public_url(file_name)
            return url
        except Exception as e:
            logging.error(f"Error getting audio file URL: {e}")
            return None

    def delete_audio_file(self, file_name):
        """Delete audio file from Supabase Storage"""
        try:
            # Use admin client for file operations to bypass RLS
            client_to_use = self.supabase_admin if self.supabase_admin else self.supabase
            
            result = client_to_use.storage.from_('audio-files').remove([file_name])
            return result
        except Exception as e:
            logging.error(f"Error deleting audio file: {e}")
            return None
