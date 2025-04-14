const sentimentDictionary = {
    positive: {
      love: 0.8,
      great: 0.7,
      happy: 0.6,
      appreciate: 0.6,
      amazing: 0.7
    },
    negative: {
      sad: -0.6,
      hurt: -0.7,
      frustrated: -0.5,
      angry: -0.8,
      misunderstood: -0.6
    },
    conflict: {
      argued: -0.7,
      fought: -0.8,
      ignored: -0.6
    }
  };
  
  const calculateSentiment = (text, phase) => {
    const words = text.toLowerCase().split(/\W+/);
    let score = 0;
    let count = 0;
  
    // Sum sentiment scores
    for (const word of words) {
      if (sentimentDictionary.positive[word]) {
        score += sentimentDictionary.positive[word];
        count++;
      }
      if (sentimentDictionary.negative[word]) {
        score += sentimentDictionary.negative[word];
        count++;
      }
      if (phase === "dynamics" && sentimentDictionary.conflict[word]) {
        score += sentimentDictionary.conflict[word] * 1.2; // Weigh conflicts higher in Dynamics
        count++;
      }
    }
  
    // Average score, default to 0 if no matches
    return count > 0 ? score / count : 0;
  };
  
  module.exports = { calculateSentiment };