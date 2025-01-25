import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.probability import FreqDist
import heapq

# Download necessary NLTK resources
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('punkt_tab')

class TextSummarizer:
    def __init__(self, max_sentences=5):
        """
        Initialize the summarizer with maximum number of sentences to include.
        
        :param max_sentences: Maximum number of sentences in the summary
        """
        self.max_sentences = max_sentences
        self.stop_words = set(stopwords.words('english'))

    def _preprocess(self, text):
        """
        Preprocess the text by tokenizing and removing stop words.
        
        :param text: Input text to preprocess
        :return: List of preprocessed words
        """
        # Tokenize words and convert to lowercase
        words = word_tokenize(text.lower())
        
        # Remove stopwords and punctuation
        preprocessed_words = [
            word for word in words 
            if word.isalnum() and word not in self.stop_words
        ]
        
        return preprocessed_words

    def _calculate_word_frequencies(self, words):
        """
        Calculate word frequencies.
        
        :param words: List of preprocessed words
        :return: Frequency distribution of words
        """
        return FreqDist(words)

    def _score_sentences(self, text, word_frequencies):
        """
        Score sentences based on word frequencies.
        
        :param text: Original text
        :param word_frequencies: Frequency distribution of words
        :return: Dictionary of sentence scores
        """
        sentences = sent_tokenize(text)
        
        sentence_scores = {}
        for sentence in sentences:
            # Tokenize and preprocess sentence words
            words = self._preprocess(sentence)
            
            # Calculate sentence score
            sentence_score = sum(
                word_frequencies.get(word, 0) for word in words
            )
            sentence_scores[sentence] = sentence_score
        
        return sentence_scores

    def summarize(self, text, max_length=None, length_type='char'):
        """
        Generate a summary of the input text with optional length limit.
        
        :param text: Text to summarize
        :param max_length: Maximum length of summary (None for no limit)
        :param length_type: Type of length limit ('char' or 'word')
        :return: Summarized text
        """
        if not text:
            return ""
        
        # Preprocess the text
        preprocessed_words = self._preprocess(text)
        
        # Calculate word frequencies
        word_frequencies = self._calculate_word_frequencies(preprocessed_words)
        
        # Score sentences
        sentence_scores = self._score_sentences(text, word_frequencies)
        
        # Select top sentences
        summary_sentences = heapq.nlargest(
            self.max_sentences, 
            sentence_scores, 
            key=sentence_scores.get
        )
        
        # Preserve original sentence order
        original_sentences = sent_tokenize(text)
        summary_sentences = [
            sent for sent in original_sentences 
            if sent in summary_sentences
        ]
        
        # Initial summary
        summary = ' '.join(summary_sentences)
        
        # Apply length limit if specified
        if max_length is not None:
            if length_type == 'char':
                while len(summary) > max_length and summary_sentences:
                    summary_sentences.pop()
                    summary = ' '.join(summary_sentences)
            elif length_type == 'word':
                summary_words = summary.split()
                while len(summary_words) > max_length and summary_sentences:
                    summary_sentences.pop()
                    summary = ' '.join(summary_sentences)
                    summary_words = summary.split()
            else:
                raise ValueError("length_type must be 'char' or 'word'")
        
        return summary

# # Example usage
# if __name__ == "__main__":
#     # Sample text for testing
#     text = "Your long text goes here..."
    
#     # Create summarizer
#     summarizer = TextSummarizer(max_sentences=5)
    
#     # Summarize with character limit
#     char_summary = summarizer.summarize(text, max_length=200, length_type='char')
#     print("Character-limited summary:", char_summary)
    
#     # Summarize with word limit
#     word_summary = summarizer.summarize(text, max_length=50, length_type='word')
#     print("Word-limited summary:", word_summary)