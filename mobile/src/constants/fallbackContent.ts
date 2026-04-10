// ============================================
// Anchor Daily - Offline Fallback Content
// ============================================
// These reflections are bundled with the app so that
// the user always gets content on first launch, even
// without an internet connection. They are used when
// the Supabase fetch fails or returns no data.

import { Reflection, FocusArea } from '../types';

// Compute today's date at call time, not at module load time,
// so the date stays accurate even if the app is left open overnight.
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function makeFallbackReflections(): Record<FocusArea, Reflection> {
  const today = getToday();
  return {
  stress: {
    id: 'fallback-stress-1',
    title: 'The Myth of Control',
    theme: 'stress',
    short_reflection:
      'We often feel stressed because we are trying to control outcomes that are simply out of our hands. Jesus reminded us that worrying doesn\'t add a single hour to our lives (Matthew 6:27). True peace begins the moment we acknowledge our limits and hand the pen back to God.',
    practical_application:
      'Today, when you feel your chest tighten with anxiety over a specific situation, physically open your hands. Say out loud, "I cannot control this, but I trust the One who holds it."',
    question:
      'What is one specific outcome you are trying to control today that you need to release?',
    premium_extended_version:
      'The desire for control is deeply human. It stems from a belief that if we can just manage every variable, we can guarantee safety. But this is an illusion. In Matthew 6:25-34, Jesus doesn\'t dismiss our needs—He acknowledges them. Food, clothing, shelter—these matter. But He redirects our energy from anxious striving to trusting provision. The birds of the air don\'t have retirement plans, yet they are fed. This isn\'t a call to passivity; it\'s a call to redirect the enormous energy we spend on worry toward faithful action in the present moment. Try this breathing prayer: Inhale slowly and say "I receive Your peace." Exhale slowly and say "I release my need to control."',
    tags: ['anxiety', 'control', 'trust', 'worry'],
    status: 'published',
    publish_date: today,
    is_premium_only: false,
    created_at: today,
    updated_at: today,
  },

  decisions: {
    id: 'fallback-decisions-1',
    title: 'The Next Right Step',
    theme: 'decisions',
    short_reflection:
      'When faced with a massive decision, we often freeze, waiting for a burning bush or a neon sign. But God usually guides us like a lantern in the dark—illuminating just enough for the next step (Psalm 119:105). You don\'t need to see the whole staircase to start climbing.',
    practical_application:
      'Stop agonizing over the five-year plan today. Identify the absolute smallest, most immediate "next right step" you can take regarding your decision, and do only that.',
    question:
      'What is the smallest action you can take today that moves you forward in this decision?',
    premium_extended_version:
      'We live in a culture obsessed with certainty. We want guarantees before we move. But faith, by definition, is "the substance of things hoped for, the evidence of things not seen" (Hebrews 11:1). If you could see the entire path, you wouldn\'t need faith. Psalm 119:105 says God\'s word is a lamp to our feet—not a floodlight to the horizon. A lamp at your feet shows you just enough to take one step without tripping. That\'s how God often guides: not with a detailed roadmap, but with enough light for the next step. Ask yourself: "What is the next right thing I can do?" Not the perfect thing. Not the final thing. The next right thing.',
    tags: ['guidance', 'decisions', 'faith', 'trust'],
    status: 'published',
    publish_date: today,
    is_premium_only: false,
    created_at: today,
    updated_at: today,
  },

  relationships: {
    id: 'fallback-relationships-1',
    title: 'Quick to Listen',
    theme: 'relationships',
    short_reflection:
      'In conflict, our default mode is defense. We formulate our rebuttal while the other person is still speaking. James 1:19 offers a radically different approach: be quick to listen, slow to speak, and slow to become angry. True empathy requires silencing our inner lawyer.',
    practical_application:
      'In your next conversation—especially if it\'s tense—make a conscious effort to pause for two full seconds after the other person finishes speaking before you reply. Use that pause to actually process what they said, not just what you want to say.',
    question:
      'Who in your life currently needs you to listen to them without offering a defense or a solution?',
    premium_extended_version:
      'Listening is one of the most underrated spiritual disciplines. We think of prayer, fasting, and Bible study as spiritual practices, but rarely do we consider listening as an act of worship. Yet when we truly listen to another person, we are honoring the image of God in them. We are saying, "Your experience matters. Your pain is real. You are worth my full attention." The two-second pause is a practical tool, but the principle behind it is profound: most conflict escalates not because of what was said, but because neither person felt heard. Before you try to fix the conflict, try to understand it.',
    tags: ['listening', 'conflict', 'empathy', 'communication'],
    status: 'published',
    publish_date: today,
    is_premium_only: false,
    created_at: today,
    updated_at: today,
  },
  };
}

// Export as a function so callers always get today's correct date,
// even if the app has been open since yesterday.
export function getFallbackReflection(focus: FocusArea): Reflection {
  return makeFallbackReflections()[focus];
}
