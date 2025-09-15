-- Sample campaigns for testing the OnTimely campaigns feature
-- Run this after creating the campaigns schema

INSERT INTO campaigns (
  title,
  description,
  image_url,
  company_name,
  company_logo_url,
  website_url,
  cta_text,
  cta_url,
  target_audience,
  target_regions,
  status,
  priority,
  start_date,
  end_date
) VALUES 
(
  'Premium Event Photography Services',
  'Capture every moment of your special events with our professional photography team. High-quality images delivered within 24 hours.',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop',
  'SnapShot Pro',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop',
  'https://snapshotpro.com',
  'Book Now',
  'https://snapshotpro.com/booking',
  ARRAY['event_planners', 'corporate'],
  ARRAY['US', 'UK'],
  'active',
  3,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '30 days'
),
(
  'Luxury Catering for Corporate Events',
  'Elevate your corporate gatherings with our gourmet catering services. From intimate meetings to large conferences.',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
  'Elite Catering Co',
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=100&h=100&fit=crop',
  'https://elitecatering.com',
  'Get Quote',
  'https://elitecatering.com/quote',
  ARRAY['event_planners', 'corporate'],
  ARRAY['US'],
  'active',
  2,
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '60 days'
),
(
  'Smart Event Management Software',
  'Streamline your event planning process with our AI-powered management platform. Free 30-day trial available.',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
  'EventFlow AI',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop',
  'https://eventflow-ai.com',
  'Start Free Trial',
  'https://eventflow-ai.com/trial',
  ARRAY['event_planners', 'travel_companies'],
  ARRAY['US', 'UK', 'EU'],
  'active',
  1,
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '45 days'
);

-- Add some sample impression/click data
INSERT INTO campaign_impressions (campaign_id, platform, created_at)
SELECT 
  c.id,
  (ARRAY['desktop', 'mobile'])[floor(random() * 2 + 1)],
  NOW() - (random() * INTERVAL '30 days')
FROM campaigns c, generate_series(1, 50);

INSERT INTO campaign_clicks (campaign_id, platform, click_type, created_at)
SELECT 
  c.id,
  (ARRAY['desktop', 'mobile'])[floor(random() * 2 + 1)],
  (ARRAY['cta', 'image', 'title'])[floor(random() * 3 + 1)],
  NOW() - (random() * INTERVAL '30 days')
FROM campaigns c, generate_series(1, 15);

-- Update impression/click counts
UPDATE campaigns SET 
  impressions_count = (SELECT COUNT(*) FROM campaign_impressions WHERE campaign_id = campaigns.id),
  clicks_count = (SELECT COUNT(*) FROM campaign_clicks WHERE campaign_id = campaigns.id);
