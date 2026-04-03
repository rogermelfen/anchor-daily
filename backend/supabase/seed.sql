-- ============================================
-- Anchor Daily - Seed Data
-- Initial Content Pack: 7 days per theme (21 total)
-- Extended Content: see seed_extended.sql for days 8-30 (69 more)
-- ============================================

-- ============================================
-- THEME: STRESS & ANXIETY (7 days)
-- ============================================

INSERT INTO public.reflections (title, theme, short_reflection, practical_application, question, premium_extended_version, tags, status, publish_date, is_premium_only, sort_order) VALUES

('The Myth of Control',
 'stress',
 'We often feel stressed because we are trying to control outcomes that are simply out of our hands. Jesus reminded us that worrying doesn''t add a single hour to our lives (Matthew 6:27). True peace begins the moment we acknowledge our limits and hand the pen back to God.',
 'Today, when you feel your chest tighten with anxiety over a specific situation, physically open your hands. Say out loud, "I cannot control this, but I trust the One who holds it."', 'What is one specific outcome..."I receive Your peace." Exhale slowly and say "I release my need to control."', ARRAY['anxiety', 'control', 'trust', 'worry'], 'published',..."He is in this boat with me."Keep it where you can see..."Why are you so afraid? Do you still have no faith?"This wasn''t a rebuke of their..."Give us this...''t..."The world will keep turning without my effort, because God is holding it."', ARRAY['rest', 'sabbath', 'burnout', 'self-care'], 'published',..."How long, O Lord?"(Psalm 13:1). God can handle your..."proper"prayer today, try writing or speaking..."spiritual"enough?', 'David, the man after God''s..."My God, my God, why have you forsaken me?"Sound familiar? Jesus quoted this psalm..."I trust You enough to show You my worst."Many of us were taught that..."hard pressed on every side, but not crushed"(2 Corinthians 4:8). The pressure is..."I notice I am feeling anxious. This feeling is real, but it is not the truth about who I am."Separate the feeling from your identity.',..."I am a stressed person." He said, "We are hard pressed but not crushed, perplexed but not in despair."He held the tension between real..."Well done, good and faithful servant."The measure was not the amount—it..."It''s too much. You can''t do it all. Why bother?" But God whispers, "Just take the next step. I''ll handle the staircase."Faithfulness in small things is not..."next right step"you can take regarding your decision,..."the substance of things hoped for, the evidence of things not seen"(Hebrews 11:1). If you could see..."What is the next right thing I can do?"Not the perfect thing. Not the..."perfect"one?', 'There is a paralyzing theology..."In their hearts humans plan their course, but the Lord establishes their steps."This means you can plan, choose,..."Which door is God behind?" but "Which door reflects my values and calling?"Choose wisely, but choose freely.', ARRAY['freedom',..."Be still before the Lord and wait patiently for him"(Psalm 37:7). Urgency is not always..."Is this urgency real, or is it anxiety?"If the deadline is not truly..."I believe that clarity will come, and I don''t need to force a decision before it arrives."If your decision doesn''t have a..."Plans fail for lack of...''t mean you should surround..."I shouldn''t do this because I''m scared"feels like discernment, but it might..."Is this a legitimate warning, or is this fear masquerading as wisdom?"', 'Is there a decision you..."don''t do it." But their roots are completely different. Wisdom says, "This is unwise based on evidence and values." Fear says, "This is terrifying based on worst-case scenarios and self-doubt."Learning to distinguish between the two..."Commit to the Lord whatever you do, and he will establish your plans"(Proverbs 16:3).', 'If you have been..."If I just gather more information, I can guarantee the right outcome."But this is an illusion. Every..."Can I make a perfect choice?" but "Can I make a faithful choice?" Ecclesiastes 11:4 warns, "Whoever watches the wind will not plant; whoever looks at the clouds will not reap." At some point, the farmer must plant despite uncertain weather. Your decision is the same. Plant. Trust the harvest to God. And remember: even if the outcome isn''t what you hoped, God is in the business of redemption. He wastes nothing.',
 ARRAY['perfectionism', 'action', 'trust', 'commitment'],
 'published',
 CURRENT_DATE + INTERVAL '5 days',
 false,
 6),

('Peace as a Guide',
 'decisions',
 '"Let the peace of Christ rule in your hearts" (Colossians 3:15). The word "rule"here means to act as an..."Thank goodness that''s over." Peace says, "This is right, even though it''s hard."Relief is about escaping discomfort. Peace..."surpasses...''ve been thinking about my part in this, and here''s what I see,"you disarm the other person. You..."I choose to release this debt. Justice belongs to God, not to me."You may need to repeat this..."aphiemi," which literally means "to let go" or "to send away."This is important because it separates..."Holding onto bitterness is like drinking poison and expecting the other person to die."Forgiveness sets you free.', ARRAY['forgiveness', 'healing',..."speak the truth in love."Truth without love is cruelty. Love..."I feel ___ when ___. What I need is ___. I value our relationship and want to work through this together."', 'Is there a truth you..."I" statements instead of "you" accusations. Lead with your feelings, not their failures. And always, always affirm the relationship: "I''m bringing this up because I care about us."', ARRAY['truth', 'love', 'communication', 'boundaries'], 'published',..."I''m thinking of you. I don''t have the right words, but I''m here."', 'Who in your life needs..."Everything happens for a reason." "God has a plan."These may be true in the..."The friend who can be silent with us in a moment of despair or confusion, who can stay with us in an hour of grief and bereavement, who can tolerate not knowing, not curing, not healing and face with us the reality of our powerlessness, that is a friend who cares."Be that friend today.', ARRAY['presence', 'comfort',..."I love you, and I also need to take care of the person God has entrusted to me: myself."', 'Identify one relationship where you..."I need to think about that before I commit."', 'Where in your relationships do..."withdrew to lonely places and prayed."He didn''t heal everyone. He didn''t..."Love is patient, love is kind"(1 Corinthians 13:4). These are verbs,..."Add user".
--   Bruk e-posten du vil ha som admin (f.eks. admin@anchordaily.com).
--   Sett et sterkt passord.
--
-- Steg 2: Registrer e-posten i admin_users-tabellen.
--   Oppdater e-posten nedenfor til den du brukte i steg 1.
--   password_hash-feltet brukes ikke lenger for autentisering
--   (Supabase Auth håndterer det), men beholdes for bakoverkompatibilitet.
--   Sett en dummy-verdi eller fjern kolonnen i en fremtidig migrasjon.
--
-- VIKTIG: Endre e-posten nedenfor til din faktiske admin-e-post!

INSERT INTO public.admin_users (email, password_hash, name)
VALUES (
  'admin@anchordaily.com',
  'managed_by_supabase_auth',
  'Admin'
);
