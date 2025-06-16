import re
from collections import Counter

class TextSummarizer:
    def __init__(self, num_sentences=3):
        self.num_sentences = num_sentences
        # Common English stop words
        self.stop_words = {
            'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
            'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
            'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
            'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
            'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
            'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
            'while', 'of', 'at', 'by', 'for', 'with', 'through', 'during', 'before', 'after',
            'above', 'below', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
            'further', 'then', 'once'
        }

    def clean_text(self, text):
        """Basic text cleaning"""
        # Remove extra whitespace and normalize
        text = re.sub(r'\s+', ' ', text.strip())
        return text

    def sentence_tokenize(self, text):
        """Simple sentence tokenization"""
        # Split on sentence endings
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        return sentences

    def word_tokenize(self, text):
        """Simple word tokenization"""
        # Split on whitespace and punctuation
        words = re.findall(r'\b\w+\b', text.lower())
        return words

    def score_sentences(self, sentences, word_freq):
        """Score sentences based on word frequency"""
        sentence_scores = {}

        for sentence in sentences:
            words = self.word_tokenize(sentence)
            score = 0
            word_count = 0

            for word in words:
                if word not in self.stop_words:
                    score += word_freq.get(word, 0)
                    word_count += 1

            if word_count > 0:
                sentence_scores[sentence] = score / word_count

        return sentence_scores

    def summarize(self, text):
        """Create a summary of the text"""
        if not text or len(text.strip()) < 100:
            return text

        # Clean and tokenize
        cleaned_text = self.clean_text(text)
        sentences = self.sentence_tokenize(cleaned_text)

        if len(sentences) <= self.num_sentences:
            return cleaned_text

        # Calculate word frequencies
        all_words = self.word_tokenize(cleaned_text)
        filtered_words = [word for word in all_words if word not in self.stop_words]
        word_freq = Counter(filtered_words)

        # Score sentences
        sentence_scores = self.score_sentences(sentences, word_freq)

        # Get top sentences
        top_sentences = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)
        top_sentences = top_sentences[:self.num_sentences]

        # Maintain original order
        summary_sentences = []
        for sentence in sentences:
            if any(sentence == top_sent[0] for top_sent in top_sentences):
                summary_sentences.append(sentence)
                if len(summary_sentences) >= self.num_sentences:
                    break

        return '. '.join(summary_sentences) + '.'