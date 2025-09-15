-- Smart Location-Based Advertising System for OnTimely (Fixed Version)
-- Comprehensive system for AI-driven advertising opportunities and management

-- Enhanced campaigns table with location and AI features
DROP TABLE IF EXISTS campaigns CASCADE;
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Campaign Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  company_name VARCHAR(255) NOT NULL,
  company_logo_url TEXT,
  website_url TEXT,
  cta_text VARCHAR(100) DEFAULT 'Learn More',
  cta_url TEXT,
  
  -- Pricing & Hierarchy
  payment_tier VARCHAR(20) DEFAULT 'basic' CHECK (payment_tier IN ('premium', 'standard', 'basic')),
  monthly_payment_amount DECIMAL(10,2) DEFAULT 0,
  priority_score INTEGER DEFAULT 1, -- Calculated based on payment and performance
  
  -- Location Targeting (simplified)
  target_countries TEXT[],
  target_regions TEXT[], -- States/Provinces
  target_cities TEXT[],
  target_radius_km INTEGER DEFAULT 50, -- Radius from target locations
  primary_location POINT, -- Single primary location for GIST indexing
  timezone_targeting TEXT[], -- e.g., ['America/New_York', 'Europe/London']
  
  -- Event Context Targeting
  target_event_types TEXT[], -- ['corporate', 'wedding', 'conference', etc.]
  target_event_sizes INT4RANGE, -- e.g., '[10,100)' for 10-99 attendees
  target_industries TEXT[], -- ['tech', 'healthcare', 'finance', etc.]
  
  -- Smart Targeting (AI-driven)
  ai_keywords TEXT[], -- Keywords for semantic matching
  competitor_keywords TEXT[], -- Keywords to avoid showing near
  seasonal_relevance JSONB, -- {"months": [6,7,8], "holidays": ["christmas"]}
  
  -- Campaign Management
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  auto_pause_on_budget BOOLEAN DEFAULT true,
  daily_budget DECIMAL(10,2),
  total_budget DECIMAL(10,2),
  spent_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Performance Metrics
  impressions_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0, -- Tracked conversions
  ctr DECIMAL(5,4) DEFAULT 0, -- Click-through rate
  conversion_rate DECIMAL(5,4) DEFAULT 0,
  
  -- Scheduling
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- OnTimely Management
  created_by UUID, -- OnTimely staff member
  sales_rep_id UUID, -- Assigned sales representative
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- AI & Analytics
  ai_confidence_score DECIMAL(3,2), -- How confident AI is about this placement
  market_opportunity_score DECIMAL(3,2), -- AI-calculated market potential
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Intelligence Table (AI-driven market analysis)
CREATE TABLE market_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Location Analysis
  location_name VARCHAR(255) NOT NULL,
  coordinates POINT NOT NULL,
  city VARCHAR(100),
  region VARCHAR(100),
  country VARCHAR(100),
  timezone VARCHAR(50),
  
  -- Event Analysis
  detected_events JSONB, -- Events happening in this area
  event_frequency INTEGER DEFAULT 0, -- Events per month
  event_types JSONB, -- Types of events commonly held
  average_event_size INTEGER,
  peak_seasons JSONB, -- When events are most common
  
  -- Market Opportunity
  business_density_score DECIMAL(3,2), -- How many businesses in area
  competition_level VARCHAR(20) CHECK (competition_level IN ('low', 'medium', 'high')),
  market_saturation DECIMAL(3,2), -- 0.0 to 1.0
  revenue_potential DECIMAL(10,2), -- Estimated monthly revenue potential
  
  -- AI Analysis
  recommended_ad_types TEXT[], -- What types of ads work best here
  optimal_pricing JSONB, -- Suggested pricing tiers
  competitor_analysis JSONB, -- Analysis of competing services
  
  -- Sales Intelligence
  potential_clients JSONB, -- Businesses that could advertise
  contact_opportunities INTEGER DEFAULT 0,
  sales_priority VARCHAR(20) DEFAULT 'medium' CHECK (sales_priority IN ('high', 'medium', 'low')),
  
  -- Tracking
  last_analyzed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysis_confidence DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Pipeline Table
CREATE TABLE sales_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Opportunity Details
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  company_website TEXT,
  
  -- Location & Context
  location_id UUID REFERENCES market_intelligence(id),
  business_address TEXT,
  coordinates POINT,
  
  -- Opportunity Assessment
  business_type VARCHAR(100),
  estimated_budget DECIMAL(10,2),
  likelihood_score DECIMAL(3,2), -- AI-calculated likelihood to convert
  priority_level VARCHAR(20) DEFAULT 'medium' CHECK (priority_level IN ('hot', 'warm', 'cold')),
  
  -- Sales Process
  status VARCHAR(20) DEFAULT 'identified' CHECK (status IN ('identified', 'contacted', 'interested', 'proposal_sent', 'negotiating', 'closed_won', 'closed_lost')),
  assigned_sales_rep UUID, -- OnTimely sales team member
  first_contact_date TIMESTAMP WITH TIME ZONE,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  expected_close_date TIMESTAMP WITH TIME ZONE,
  
  -- AI Insights
  ai_generated BOOLEAN DEFAULT true,
  ai_reasoning TEXT, -- Why AI thinks this is a good opportunity
  recommended_approach TEXT, -- AI-suggested sales approach
  
  -- Notes & History
  sales_notes TEXT,
  contact_history JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Campaign Performance Tracking
CREATE TABLE campaign_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Context
  event_id UUID, -- Which event this was shown for
  user_location POINT,
  user_timezone VARCHAR(50),
  event_type VARCHAR(100),
  event_size INTEGER,
  
  -- Performance
  impression_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  click_time TIMESTAMP WITH TIME ZONE,
  conversion_time TIMESTAMP WITH TIME ZONE,
  conversion_value DECIMAL(10,2),
  
  -- Analysis
  relevance_score DECIMAL(3,2), -- How relevant was this ad
  user_engagement_duration INTEGER, -- Seconds spent viewing
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance (fixed)
CREATE INDEX idx_campaigns_payment_tier ON campaigns(payment_tier, priority_score DESC);
CREATE INDEX idx_campaigns_primary_location ON campaigns USING GIST(primary_location) WHERE primary_location IS NOT NULL;
CREATE INDEX idx_campaigns_status ON campaigns(status) WHERE status = 'active';
CREATE INDEX idx_market_intelligence_location ON market_intelligence USING GIST(coordinates);
CREATE INDEX idx_market_intelligence_priority ON market_intelligence(sales_priority, revenue_potential DESC);
CREATE INDEX idx_sales_opportunities_status ON sales_opportunities(status, priority_level);
CREATE INDEX idx_sales_opportunities_location ON sales_opportunities USING GIST(coordinates) WHERE coordinates IS NOT NULL;

-- Smart Campaign Matching Function (Fixed)
CREATE OR REPLACE FUNCTION get_smart_campaigns(
  p_event_location POINT DEFAULT NULL,
  p_event_type TEXT DEFAULT NULL,
  p_event_size INTEGER DEFAULT NULL,
  p_timezone TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 3
)
RETURNS TABLE (
  campaign_id UUID,
  title VARCHAR,
  description TEXT,
  image_url TEXT,
  company_name VARCHAR,
  cta_text VARCHAR,
  cta_url TEXT,
  relevance_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH campaign_scores AS (
    SELECT 
      c.id,
      c.title,
      c.description,
      c.image_url,
      c.company_name,
      c.cta_text,
      c.cta_url,
      -- Calculate relevance score based on multiple factors
      (
        -- Payment tier weight (premium = 3, standard = 2, basic = 1)
        CASE c.payment_tier 
          WHEN 'premium' THEN 3.0
          WHEN 'standard' THEN 2.0
          ELSE 1.0
        END * 0.4 +
        
        -- Location targeting weight
        CASE 
          WHEN p_city IS NOT NULL AND p_city = ANY(c.target_cities) THEN 2.0
          WHEN p_region IS NOT NULL AND p_region = ANY(c.target_regions) THEN 1.5
          WHEN p_country IS NOT NULL AND p_country = ANY(c.target_countries) THEN 1.2
          WHEN c.target_cities IS NULL AND c.target_regions IS NULL AND c.target_countries IS NULL THEN 1.0 -- Global campaigns
          ELSE 0.5
        END * 0.3 +
        
        -- Event type match weight
        CASE 
          WHEN p_event_type IS NOT NULL AND p_event_type = ANY(c.target_event_types) THEN 2.0
          WHEN c.target_event_types IS NULL OR array_length(c.target_event_types, 1) = 0 THEN 1.0
          ELSE 0.5
        END * 0.2 +
        
        -- Performance weight (CTR)
        COALESCE(c.ctr * 5, 0.5) * 0.1
      ) as relevance_score
    FROM campaigns c
    WHERE c.status = 'active'
      AND (c.start_date IS NULL OR c.start_date <= NOW())
      AND (c.end_date IS NULL OR c.end_date >= NOW())
      AND (c.daily_budget IS NULL OR c.spent_amount < c.daily_budget)
  )
  SELECT 
    cs.id,
    cs.title,
    cs.description,
    cs.image_url,
    cs.company_name,
    cs.cta_text,
    cs.cta_url,
    cs.relevance_score
  FROM campaign_scores cs
  WHERE cs.relevance_score > 0.5 -- Only return reasonably relevant campaigns
  ORDER BY cs.relevance_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- AI Market Analysis Function (placeholder for AI integration)
CREATE OR REPLACE FUNCTION analyze_market_opportunity(
  p_location POINT,
  p_city TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_radius_km INTEGER DEFAULT 25
)
RETURNS UUID AS $$
DECLARE
  analysis_id UUID;
  location_name TEXT;
BEGIN
  -- Build location name
  location_name := COALESCE(p_city, 'Unknown City') || 
                   CASE WHEN p_region IS NOT NULL THEN ', ' || p_region ELSE '' END ||
                   CASE WHEN p_country IS NOT NULL THEN ', ' || p_country ELSE '' END;
  
  -- This would integrate with AI services to analyze market opportunities
  -- For now, we'll create a basic analysis record
  
  INSERT INTO market_intelligence (
    location_name,
    coordinates,
    city,
    region,
    country,
    business_density_score,
    competition_level,
    market_saturation,
    revenue_potential,
    analysis_confidence
  ) VALUES (
    location_name,
    p_location,
    p_city,
    p_region,
    p_country,
    RANDOM() * 1.0, -- Placeholder - would come from AI analysis
    (ARRAY['low', 'medium', 'high'])[floor(random() * 3 + 1)],
    RANDOM() * 1.0,
    RANDOM() * 5000 + 1000, -- $1000-$6000 potential
    0.75
  ) RETURNING id INTO analysis_id;
  
  RETURN analysis_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to identify sales opportunities
CREATE OR REPLACE FUNCTION identify_sales_opportunities(
  p_location POINT,
  p_city TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_radius_km INTEGER DEFAULT 25
)
RETURNS INTEGER AS $$
DECLARE
  opportunities_created INTEGER := 0;
  business_types TEXT[] := ARRAY['restaurant', 'hotel', 'venue', 'catering', 'photography', 'entertainment', 'florist', 'security', 'transport'];
  i INTEGER;
  random_count INTEGER;
BEGIN
  -- Generate 2-6 random opportunities
  random_count := 2 + floor(random() * 5)::integer;
  
  FOR i IN 1..random_count LOOP
    INSERT INTO sales_opportunities (
      company_name,
      business_type,
      coordinates,
      estimated_budget,
      likelihood_score,
      priority_level,
      ai_reasoning,
      recommended_approach
    )
    VALUES (
      business_types[floor(random() * array_length(business_types, 1) + 1)] || ' Business ' || i,
      business_types[floor(random() * array_length(business_types, 1) + 1)],
      p_location,
      (RANDOM() * 2000 + 500)::DECIMAL(10,2),
      (RANDOM() * 0.8 + 0.2)::DECIMAL(3,2),
      (ARRAY['hot', 'warm', 'cold'])[floor(random() * 3 + 1)],
      'AI detected high event activity in this area with potential for ' || business_types[floor(random() * array_length(business_types, 1) + 1)] || ' partnerships',
      'Approach with local event statistics and partnership benefits'
    );
  END LOOP;
  
  opportunities_created := random_count;
  RETURN opportunities_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies (campaigns are visible to all users, but only OnTimely staff can manage them)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_performance ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view active campaigns
CREATE POLICY select_active_campaigns ON campaigns
  FOR SELECT
  USING (status = 'active' AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));

-- Only OnTimely staff can manage campaigns (you'll need to define OnTimely staff identification)
-- For now, allowing all users - you can restrict this later
CREATE POLICY manage_campaigns ON campaigns
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow OnTimely staff to manage market intelligence
CREATE POLICY manage_market_intelligence ON market_intelligence
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow OnTimely staff to manage sales opportunities
CREATE POLICY manage_sales_opportunities ON sales_opportunities
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow users to insert performance tracking
CREATE POLICY insert_campaign_performance ON campaign_performance
  FOR INSERT
  WITH CHECK (true);

-- Function to track campaign impression (updated)
CREATE OR REPLACE FUNCTION track_campaign_impression(
  p_campaign_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_company_id UUID DEFAULT NULL,
  p_platform TEXT DEFAULT 'desktop'
)
RETURNS VOID AS $$
BEGIN
  -- Insert performance record
  INSERT INTO campaign_performance (campaign_id, event_id)
  VALUES (p_campaign_id, NULL);
  
  -- Update campaign impressions count
  UPDATE campaigns 
  SET impressions_count = impressions_count + 1
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track campaign click (updated)
CREATE OR REPLACE FUNCTION track_campaign_click(
  p_campaign_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_company_id UUID DEFAULT NULL,
  p_platform TEXT DEFAULT 'desktop',
  p_click_type TEXT DEFAULT 'cta'
)
RETURNS VOID AS $$
DECLARE
  performance_id UUID;
BEGIN
  -- Find the most recent impression to update with click
  SELECT id INTO performance_id
  FROM campaign_performance 
  WHERE campaign_id = p_campaign_id 
    AND click_time IS NULL 
    AND impression_time >= NOW() - INTERVAL '1 hour'
  ORDER BY impression_time DESC
  LIMIT 1;
  
  -- Update the found impression record with click time
  IF performance_id IS NOT NULL THEN
    UPDATE campaign_performance 
    SET click_time = NOW()
    WHERE id = performance_id;
  ELSE
    -- If no recent impression found, create new record
    INSERT INTO campaign_performance (campaign_id, impression_time, click_time)
    VALUES (p_campaign_id, NOW(), NOW());
  END IF;
  
  -- Update campaign clicks count and CTR
  UPDATE campaigns 
  SET 
    clicks_count = clicks_count + 1,
    ctr = CASE 
      WHEN impressions_count > 0 THEN (clicks_count + 1)::DECIMAL / impressions_count::DECIMAL
      ELSE 0
    END
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
