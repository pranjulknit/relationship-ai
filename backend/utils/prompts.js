const getPrompts = (phase, contactName, memories = []) => {
  const basePrompts = {
    onboarding: [
      `How did you meet ${contactName}?`,
      `What’s a favorite memory with ${contactName}?`
    ],
    emotional: [
      `What do you appreciate about ${contactName}?`,
      `How does ${contactName} make you feel?`
    ],
    dynamics: [
      `Any time you felt misunderstood by ${contactName}?`,
      `What’s a challenge you’ve faced with ${contactName}?`
    ],
    dualLens: [
      `How might ${contactName} describe you?`,
      `What does ${contactName} value in you?`
    ]
  };

  // Personalize based on memories
  const lastMemory = memories.length > 0 ? memories[memories.length - 1] : null;
  const personalized = {
    onboarding: lastMemory
      ? `You mentioned "${lastMemory.content}". Tell me more about another moment with ${contactName}.`
      : basePrompts.onboarding,
    emotional: lastMemory && lastMemory.sentiment < 0
      ? `It sounds like things have been tough. What’s something positive about ${contactName}?`
      : basePrompts.emotional,
    dynamics: lastMemory && lastMemory.sentiment > 0
      ? `You shared something positive. Any challenges with ${contactName} you’ve noticed?`
      : basePrompts.dynamics,
    dualLens: lastMemory
      ? `Based on what you’ve shared, what might ${contactName} think about your bond?`
      : basePrompts.dualLens
  };

  return personalized[phase] || basePrompts[phase];
};

module.exports = { getPrompts };