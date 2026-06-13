-- ============================================
-- Anchor Daily - Seed Data (Clean)
-- 21 reflections: 7 per theme
-- ============================================

INSERT INTO public.reflections (title, theme, short_reflection, practical_application, question, tags, status, publish_date, is_premium_only, sort_order) VALUES

-- ============================================
-- STRESS & ANXIETY (7 reflections)
-- ============================================

('The Myth of Control',
 'stress',
 'We often feel stressed because we are trying to control outcomes that are simply out of our hands. Jesus reminded us that worrying doesn''t add a single hour to our lives (Matthew 6:27). True peace begins the moment we acknowledge our limits and hand the pen back to God.',
 'Today, when you feel your chest tighten with anxiety, physically open your hands. Say out loud: "I cannot control this, but I trust the One who holds it."',
 'What is one specific outcome you are trying to control today that you need to release to God?',
 ARRAY['anxiety', 'control', 'trust', 'worry'],
 'published', CURRENT_DATE, false, 1),

('The Peace That Passes Understanding',
 'stress',
 'Philippians 4:6-7 doesn''t promise that prayer will fix everything — it promises that God''s peace will guard your heart and mind in Christ Jesus. The peace of God is not the absence of problems; it is the presence of God in the middle of them.',
 'Write down your top three worries right now. For each one, write a one-sentence prayer handing it to God. Close the notebook and leave it there.',
 'What would it look like for you to experience God''s peace today — not the removal of the problem, but peace in the middle of it?',
 ARRAY['peace', 'prayer', 'worry', 'philippians'],
 'published', CURRENT_DATE + INTERVAL '1 day', false, 2),

('Rest Is Not Laziness',
 'stress',
 'Jesus said, "Come to me, all you who are weary and burdened, and I will give you rest" (Matthew 11:28). He did not say, "Push through." He said, "Come." Rest is not a reward for finishing everything. It is an act of trust that God is still at work when you stop.',
 'Schedule one 20-minute block of genuine rest today — no phone, no productivity. Tell yourself: "This is an act of faith, not laziness."',
 'What makes it hard for you to rest? What does that reveal about where you are placing your trust?',
 ARRAY['rest', 'burnout', 'trust', 'sabbath'],
 'published', CURRENT_DATE + INTERVAL '2 days', false, 3),

('Casting Your Cares',
 'stress',
 '"Cast all your anxiety on him because he cares for you" (1 Peter 5:7). The word "cast" is deliberate — it is an active throw, not a polite hand-off. God invites your full anxiety, not a cleaned-up version of it.',
 'Write out your anxieties as a blunt, honest prayer — not a polished request. God already knows. The act of writing helps release what you''ve been holding.',
 'Are you giving God your real anxiety, or a polished version? What would fully honest prayer look like today?',
 ARRAY['anxiety', 'prayer', 'honesty', 'trust'],
 'published', CURRENT_DATE + INTERVAL '3 days', false, 4),

('When Worry Becomes Worship',
 'stress',
 'Every hour spent worrying about what we cannot control is an hour spent trusting ourselves more than God. Worry and worship cannot fully coexist. As we choose to worship — to acknowledge who God is — worry loses its grip.',
 'Set a timer for 5 minutes. Instead of thinking about what worries you, speak aloud three things that are true about God''s character. Let worship interrupt the worry cycle.',
 'What are you currently worrying about that a moment of honest worship might loosen?',
 ARRAY['worship', 'anxiety', 'focus', 'trust'],
 'published', CURRENT_DATE + INTERVAL '4 days', false, 5),

('Strength in Weakness',
 'stress',
 '"My grace is sufficient for you, for my power is made perfect in weakness" (2 Corinthians 12:9). We spend enormous energy pretending to be stronger than we are. But God''s power works best through acknowledged weakness, not hidden strength.',
 'Identify one area where you have been pretending to be stronger than you are. Tell one safe person — or tell God alone — the truth about it today.',
 'What weakness are you trying to hide that God might want to work through?',
 ARRAY['weakness', 'grace', 'vulnerability', 'strength'],
 'published', CURRENT_DATE + INTERVAL '5 days', false, 6),

('Enough for Today',
 'stress',
 'Jesus taught us to pray for "daily bread" — not weekly, not yearly. God''s provision, like the manna in the wilderness, is calibrated for today. Anxiety about tomorrow steals the grace that has already been given for now.',
 'Write down three things God has provided for you today — not in general, but specifically today. Let gratitude for the present interrupt your fear of the future.',
 'What would it mean to trust God for today''s needs without borrowing worry from tomorrow?',
 ARRAY['provision', 'gratitude', 'anxiety', 'present'],
 'published', CURRENT_DATE + INTERVAL '6 days', false, 7),

-- ============================================
-- DIFFICULT DECISIONS (7 reflections)
-- ============================================

('The Next Right Step',
 'decisions',
 'When faced with a massive decision, we often freeze, waiting for a burning bush. But God usually guides us like a lantern in the dark — illuminating just enough for the next step (Psalm 119:105). You don''t need to see the whole staircase to start climbing.',
 'Stop agonizing over the five-year plan. Identify the smallest, most immediate next step you can take regarding your decision, and do only that.',
 'What is the smallest action you can take today that moves you forward in this decision?',
 ARRAY['guidance', 'decisions', 'faith', 'steps'],
 'published', CURRENT_DATE, false, 8),

('Wisdom Is Available',
 'decisions',
 'James 1:5 is one of the most direct promises in the Bible: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you." God is not withholding guidance from you. He is waiting to be asked.',
 'Before you consult anyone else about your decision today, spend five minutes in prayer specifically asking God for wisdom. Write down anything that comes to mind.',
 'Have you actually asked God for wisdom about this decision, or have you been trying to figure it out on your own?',
 ARRAY['wisdom', 'prayer', 'guidance', 'james'],
 'published', CURRENT_DATE + INTERVAL '1 day', false, 9),

('The Counsel of Many',
 'decisions',
 'Proverbs 15:22 says, "Plans fail for lack of counsel, but with many advisers they succeed." God''s guidance rarely comes in isolation. He places wise, godly people in our lives for a reason. Seeking counsel is not weakness — it is wisdom in action.',
 'Identify one trusted, godly person in your life. Reach out today and ask if you can talk through your decision with them this week.',
 'Who are the two or three people in your life whose wisdom you trust most? Have you spoken to them about this?',
 ARRAY['counsel', 'community', 'wisdom', 'proverbs'],
 'published', CURRENT_DATE + INTERVAL '2 days', false, 10),

('Trusting God With the Outcome',
 'decisions',
 '"Commit to the Lord whatever you do, and he will establish your plans" (Proverbs 16:3). We can make faithful decisions and still not control the outcome. Our job is faithfulness; God''s job is fruitfulness.',
 'Write out your decision and then write: "Lord, I commit this to You. The outcome is Yours." Place it somewhere visible as a daily reminder of who holds the future.',
 'Are you trying to control the outcome of your decision, or are you willing to trust God with it?',
 ARRAY['trust', 'commitment', 'outcomes', 'proverbs'],
 'published', CURRENT_DATE + INTERVAL '3 days', false, 11),

('Peace as a Guide',
 'decisions',
 '"Let the peace of Christ rule in your hearts" (Colossians 3:15). The word "rule" means to act as an umpire. When two options are before you, which one brings the deeper, quieter peace — even if it''s harder? That peace is a signpost.',
 'Sit quietly with your decision for ten minutes. Notice which option brings peace and which brings unease. Write what you observe — not what you think you should feel, but what you actually feel.',
 'As you sit with your decision, which option brings you closer to peace? What might that be telling you?',
 ARRAY['peace', 'discernment', 'guidance', 'colossians'],
 'published', CURRENT_DATE + INTERVAL '4 days', false, 12),

('Fear or Wisdom?',
 'decisions',
 'Fear and wisdom can sound identical: both say "don''t do it." But their roots are different. Wisdom says, "This is unwise based on evidence and values." Fear says, "This is terrifying based on worst-case scenarios." Learning to tell them apart is crucial.',
 'For your current decision, ask: "Is this hesitation based on a real concern, or on fear of the unknown?" Write both the fear-based reasons and the wisdom-based reasons. Notice the difference.',
 'Is the resistance you feel toward a decision coming from godly wisdom or from fear? How can you tell?',
 ARRAY['fear', 'wisdom', 'discernment', 'courage'],
 'published', CURRENT_DATE + INTERVAL '5 days', false, 13),

('Making a Faithful Choice',
 'decisions',
 'Ecclesiastes 11:4 warns, "Whoever watches the wind will not plant; whoever looks at the clouds will not reap." At some point, the farmer must plant despite uncertain weather. Not every decision waits for perfect clarity. Sometimes faithfulness means choosing.',
 'If you have been waiting for perfect certainty before deciding, ask yourself: "Is more information actually available, or am I using analysis to avoid risk?" Set a deadline for your decision.',
 'What would it mean to make a faithful choice today, even without complete certainty?',
 ARRAY['courage', 'faith', 'action', 'decisiveness'],
 'published', CURRENT_DATE + INTERVAL '6 days', false, 14),

-- ============================================
-- RELATIONSHIPS & CONFLICT (7 reflections)
-- ============================================

('Quick to Listen',
 'relationships',
 'In conflict, our default is defence. We formulate our rebuttal while the other person is still speaking. James 1:19 offers a radically different approach: be quick to listen, slow to speak, and slow to become angry. True empathy requires silencing our inner lawyer.',
 'In your next conversation — especially if it''s tense — pause for two full seconds after the other person finishes before you reply. Use that pause to process what they said, not what you want to say.',
 'Who in your life currently needs you to listen to them without offering a defence or a solution?',
 ARRAY['listening', 'conflict', 'empathy', 'james'],
 'published', CURRENT_DATE, false, 15),

('The Weight of Unforgiveness',
 'relationships',
 'Ephesians 4:32 calls us to forgive "just as in Christ God forgave you." The standard is not how much the other person deserves it. The standard is how much you have been forgiven. Unforgiveness is a weight you carry alone. Forgiveness is the moment you set it down.',
 'Think of one person you are holding something against. Write their name and write: "I choose to release this to God." Repeat it until you begin to mean it.',
 'Is there someone in your life you have been unwilling to forgive? What is it costing you?',
 ARRAY['forgiveness', 'healing', 'bitterness', 'grace'],
 'published', CURRENT_DATE + INTERVAL '1 day', false, 16),

('Speaking Truth in Love',
 'relationships',
 'Ephesians 4:15 calls us to speak "the truth in love." Both words matter equally. Truth without love is cruelty. Love without truth is cowardice. The goal is not to make people feel good or bad — it is to help them grow.',
 'Is there a truth you have been avoiding saying because you fear the reaction? Pray for courage and the right words, then plan a specific time this week to have that conversation.',
 'Is there a relationship where you have been choosing comfort over honesty? What would speaking the truth in love look like?',
 ARRAY['truth', 'love', 'courage', 'communication'],
 'published', CURRENT_DATE + INTERVAL '2 days', false, 17),

('The Log in Your Eye',
 'relationships',
 'Jesus''s instruction in Matthew 7:3-5 is direct: deal with the log in your own eye before attending to the speck in your brother''s. This isn''t passivity — it''s a sequence. Self-examination comes first. It changes both the message and the way it''s received.',
 'Before your next difficult conversation, write down your own contribution to the tension — not theirs. Start the conversation by owning your part. Watch what it does to the dynamic.',
 'What is your contribution to the current tension in this relationship? Have you acknowledged it?',
 ARRAY['humility', 'self-awareness', 'conflict', 'honesty'],
 'published', CURRENT_DATE + INTERVAL '3 days', false, 18),

('Boundaries Are Not Walls',
 'relationships',
 'Jesus withdrew regularly to pray (Luke 5:16). He didn''t heal everyone who could have been healed. Healthy boundaries are not selfishness — they are stewardship of the person God has entrusted to your care: you.',
 'Identify one relationship where you have said yes when you should have said no. Practice this phrase: "I care about you, and I need to be honest about what I can offer right now."',
 'Where in your relationships are you over-extending in a way that is harming you and ultimately the other person?',
 ARRAY['boundaries', 'health', 'self-care', 'love'],
 'published', CURRENT_DATE + INTERVAL '4 days', false, 19),

('When Relationships Are Hard',
 'relationships',
 '"Love is patient, love is kind" (1 Corinthians 13:4). These are verbs, not feelings. Biblical love is a repeated choice, not a sustained emotion. On the hardest days, love is not a feeling you fall back into — it is an action you choose again.',
 'Think of the most difficult relationship in your life. Identify one small, concrete act of love you can choose to do for that person this week — regardless of how you feel.',
 'In your most difficult relationship, what would it look like to choose love as an action rather than wait for it as a feeling?',
 ARRAY['love', 'patience', 'commitment', 'relationships'],
 'published', CURRENT_DATE + INTERVAL '5 days', false, 20),

('The Gift of Presence',
 'relationships',
 'When Job''s friends first arrived, they sat with him in silence for seven days (Job 2:13). That was their finest moment. We often rush to fix, explain, or comfort with words. Sometimes the most powerful thing we can offer is simply to stay.',
 'Think of someone in your life who is going through something hard. Reach out today — not with advice, but with presence. A simple "I''m thinking of you. I''m here." is often enough.',
 'Who in your life needs your presence more than your answers right now?',
 ARRAY['presence', 'comfort', 'grief', 'friendship'],
 'published', CURRENT_DATE + INTERVAL '6 days', false, 21);

-- ============================================
-- ADMIN USER
-- ============================================
-- VIKTIG: Opprett admin-bruker i Supabase Auth Dashboard:
--   Authentication → Users → Add user
--   Bruk e-posten du vil ha som admin.
-- Deretter kjør denne INSERT med din admin-e-post:

INSERT INTO public.admin_users (email, password_hash, name)
VALUES (
  'admin@anchordaily.com',
  'managed_by_supabase_auth',
  'Admin'
);
