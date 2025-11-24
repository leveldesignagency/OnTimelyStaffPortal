import React, { useState, useEffect } from 'react';
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Brain, 
  Eye,
  MousePointer,
  Plus,
  Search,
  Filter,
  BarChart3,
  Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Campaign {
  id: string;
  title: string;
  company_name: string;
  description?: string;
  full_description?: string;
  cta_text?: string;
  cta_url?: string;
  image_url?: string;
  company_logo_url?: string;
  discount_code?: string;
  discount_link?: string;
  qr_code?: string;
  payment_tier: 'premium' | 'standard' | 'basic';
  monthly_payment_amount: number;
  status: 'active' | 'paused' | 'draft' | 'ended' | 'pending';
  payment_status?: 'pending' | 'invoice_sent' | 'paid' | 'failed';
  invoice_id?: string;
  invoice_url?: string;
  impressions_count: number;
  clicks_count: number;
  ctr: number;
  target_cities: string[];
  target_event_types?: string[];
  target_locations?: string[];
  // New optional fields for scheduling and targeting
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  invoice_email?: string;
  campaign_ref?: string;
  invoice_ref?: string;
  target_country?: string;
  target_city?: string;
  target_distance_km?: number;
  created_at: string;
  updated_at?: string;
}

interface MarketIntelligence {
  id: string;
  location_name: string;
  revenue_potential: number;
  business_density_score: number;
  competition_level: 'low' | 'medium' | 'high';
  sales_priority: 'high' | 'medium' | 'low';
  potential_clients: any;
  last_analyzed: string;
}

interface SalesOpportunity {
  id: string;
  company_name: string;
  business_type: string;
  estimated_budget: number;
  likelihood_score: number;
  priority_level: 'hot' | 'warm' | 'cold';
  status: string;
  ai_reasoning: string;
  created_at: string;
}

const SmartAdvertising: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'intelligence' | 'opportunities' | 'analytics'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [marketIntel, setMarketIntel] = useState<MarketIntelligence[]>([]);
  const [salesOps, setSalesOps] = useState<SalesOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeCampaigns: 0,
    totalImpressions: 0,
    avgCTR: 0,
    hotOpportunities: 0,
    marketOpportunities: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load campaigns
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      // Load market intelligence
      const { data: marketData } = await supabase
        .from('market_intelligence')
        .select('*')
        .order('revenue_potential', { ascending: false });

      // Load sales opportunities
      const { data: salesData } = await supabase
        .from('sales_opportunities')
        .select('*')
        .order('likelihood_score', { ascending: false });

      setCampaigns(campaignsData || []);
      setMarketIntel(marketData || []);
      setSalesOps(salesData || []);

      // Calculate stats
      const totalRevenue = (campaignsData || []).reduce((sum, c) => sum + (c.monthly_payment_amount || 0), 0);
      const activeCampaigns = (campaignsData || []).filter(c => c.status === 'active').length;
      const totalImpressions = (campaignsData || []).reduce((sum, c) => sum + (c.impressions_count || 0), 0);
      const avgCTR = (campaignsData || []).reduce((sum, c) => sum + (c.ctr || 0), 0) / (campaignsData?.length || 1);
      const hotOpportunities = (salesData || []).filter(s => s.priority_level === 'hot').length;
      const marketOpportunities = (marketData || []).filter(m => m.sales_priority === 'high').length;

      setStats({
        totalRevenue,
        activeCampaigns,
        totalImpressions,
        avgCTR,
        hotOpportunities,
        marketOpportunities
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'text-yellow-600 bg-yellow-100';
      case 'standard': return 'text-blue-600 bg-blue-100';
      case 'basic': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'ended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hot':
      case 'high': return 'text-red-600 bg-red-100';
      case 'warm':
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'cold':
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const CampaignForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<Campaign>>({
      title: '',
      company_name: '',
      description: '',
      full_description: '',
      cta_text: 'Get Info',
      cta_url: '',
      image_url: '',
      company_logo_url: '',
      discount_code: '',
      discount_link: '',
      qr_code: '',
      payment_tier: 'basic',
      monthly_payment_amount: 0,
      status: 'draft',
      target_cities: [],
      target_event_types: [],
      target_locations: []
    });

    // Campaign creation specific fields
    const [campaignDetails, setCampaignDetails] = useState({
      campaignTitle: '',
      companyName: '',
      invoiceEmail: '',
      campaignRef: '',
      invoiceRef: '',
      location: '',
      country: '',
      city: '',
      distance: 0,
      dealDescription: '',
      dealDuration: 30, // days
      startDate: '',
      endDate: '',
      targetAudience: 'all',
      budget: 0,
      estimatedReach: 0,
      costPerImpression: 0,
      totalCost: 0,
      discountCode: '',
      discountAmount: 0,
      finalCost: 0
    });


    useEffect(() => {
      if (editingCampaign) {
        setFormData(editingCampaign);
        setCurrentStep(3); // Skip to ad creation for editing
      }
    }, [editingCampaign]);

    // Helper: compute end date from start + duration
    const computeEndDate = (startDateIso: string, durationDays: number) => {
      if (!startDateIso || !durationDays) return '';
      const d = new Date(startDateIso);
      if (Number.isNaN(d.getTime())) return '';
      d.setDate(d.getDate() + durationDays);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    // Debounced Supabase-backed reach estimation
    const fetchEstimatedReach = async () => {
      try {
        if (!campaignDetails.startDate) {
          // Use fallback if no start date
          const fallback = calculateEstimatedReach();
          setCampaignDetails(prev => ({ ...prev, estimatedReach: fallback }));
          return;
        }
        const end = computeEndDate(campaignDetails.startDate, campaignDetails.dealDuration || 0);
        const { data, error } = await supabase.rpc('estimate_reach', {
          p_country: campaignDetails.country || null,
          p_city: campaignDetails.city || null,
          p_distance_km: campaignDetails.distance || 0,
          p_start_date: campaignDetails.startDate,
          p_end_date: end
        });
        if (error) {
          // Silently fallback - don't spam console with errors
          const fallback = calculateEstimatedReach();
          setCampaignDetails(prev => ({ ...prev, estimatedReach: fallback }));
          return;
        }
        const reach = typeof data === 'number' ? data : (data?.estimated_reach ?? 0);
        setCampaignDetails(prev => ({ ...prev, estimatedReach: Math.max(0, reach) }));
      } catch (err) {
        // Silently fallback - don't spam console with errors
        const fallback = calculateEstimatedReach();
        setCampaignDetails(prev => ({ ...prev, estimatedReach: fallback }));
      }
    };

    // Validate and apply discount code
    const validateDiscountCode = async (code: string) => {
      if (!code || code.trim() === '') {
        setCampaignDetails(prev => ({
          ...prev,
          discountCode: '',
          discountAmount: 0,
          finalCost: prev.totalCost
        }));
        return;
      }

      try {
        const { data, error } = await supabase.rpc('validate_discount_code', {
          p_code: code.toUpperCase().trim(),
          p_amount: campaignDetails.totalCost
        });

        if (error) throw error;

        if (data && data.length > 0) {
          const result = data[0];
          if (result.valid) {
            setCampaignDetails(prev => ({
              ...prev,
              discountCode: code.toUpperCase().trim(),
              discountAmount: parseFloat(result.discount_amount),
              finalCost: Math.max(0, prev.totalCost - parseFloat(result.discount_amount))
            }));
            alert(result.message || 'Discount code applied!');
          } else {
            setCampaignDetails(prev => ({
              ...prev,
              discountCode: '',
              discountAmount: 0,
              finalCost: prev.totalCost
            }));
            alert(result.message || 'Invalid discount code');
          }
        }
      } catch (err: any) {
        console.error('Error validating discount code:', err);
        // If RPC doesn't exist, just clear the discount
        setCampaignDetails(prev => ({
          ...prev,
          discountCode: '',
          discountAmount: 0,
          finalCost: prev.totalCost
        }));
        alert('Discount code validation unavailable. Please contact support.');
      }
    };

    // Pricing algorithm - increased base cost per impression
    const calculatePricing = () => {
      const baseCostPerImpression = 0.15; // $0.15 per impression (increased from $0.02)
      const locationMultiplier = campaignDetails.country === 'global' ? 1.5 : 1.0;
      const distanceMultiplier = Math.max(1, campaignDetails.distance / 10); // More distance = higher cost
      const durationMultiplier = Math.max(0.5, campaignDetails.dealDuration / 30); // Longer duration = better rate
      
      const costPerImpression = baseCostPerImpression * locationMultiplier * distanceMultiplier * (1 / durationMultiplier);
      
      // Calculate estimated reach based on event data
      const estimatedReach = calculateEstimatedReach();
      const totalCost = costPerImpression * estimatedReach;
      
      // Apply discount if exists
      const finalCost = Math.max(0, totalCost - campaignDetails.discountAmount);

      setCampaignDetails(prev => ({
        ...prev,
        costPerImpression,
        totalCost: Math.round(totalCost * 100) / 100,
        estimatedReach,
        finalCost: Math.round(finalCost * 100) / 100
      }));
    };

    // Calculate estimated reach based on upcoming events
    const calculateEstimatedReach = () => {
      // This would typically query your events database
      // For now, using a mock calculation based on location and duration
      const baseReach = 1000; // Base reach per event
      const locationMultiplier = campaignDetails.country === 'global' ? 5 : 1;
      const cityMultiplier = campaignDetails.city ? 1.5 : 1;
      const durationMultiplier = Math.max(1, campaignDetails.dealDuration / 30);
      
      return Math.round(baseReach * locationMultiplier * cityMultiplier * durationMultiplier);
    };

    useEffect(() => {
      calculatePricing();
    }, [campaignDetails.country, campaignDetails.distance, campaignDetails.dealDuration, campaignDetails.estimatedReach, campaignDetails.discountAmount]);

    // Maintain endDate from startDate + duration
    useEffect(() => {
      if (campaignDetails.startDate) {
        const end = computeEndDate(campaignDetails.startDate, campaignDetails.dealDuration || 0);
        setCampaignDetails(prev => ({ ...prev, endDate: end }));
      }
    }, [campaignDetails.startDate, campaignDetails.dealDuration]);

    // Debounce reach estimation on key inputs
    useEffect(() => {
      const t = setTimeout(() => {
        fetchEstimatedReach();
      }, 500);
      return () => clearTimeout(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaignDetails.country, campaignDetails.city, campaignDetails.distance, campaignDetails.startDate, campaignDetails.dealDuration]);

    // Custom Select Component for consistent styling
    const CustomSelect: React.FC<{
      value: string;
      onChange: (v: string) => void;
      options: { label: string; value: string }[];
      placeholder?: string;
    }> = ({ value, onChange, options, placeholder }) => {
      const [open, setOpen] = useState(false);
      const selected = options.find(o => o.value === value);
      return (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 bg-white flex items-center justify-between hover:border-gray-400"
          >
            <span className={selected ? 'text-gray-900' : 'text-gray-500'}>
              {selected?.label || placeholder || 'Select'}
            </span>
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
          {open && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-auto">
              {options.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${opt.value === value ? 'bg-gray-50 font-medium' : ''}`}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    const handleSave = async () => {
      try {
        // Merge campaign details with form data
        const finalCampaignData = {
          ...formData,
          title: campaignDetails.campaignTitle,
          company_name: campaignDetails.companyName,
          monthly_payment_amount: campaignDetails.totalCost,
          target_cities: campaignDetails.city ? [campaignDetails.city] : [],
          target_locations: campaignDetails.country ? [campaignDetails.country] : [],
          target_event_types: [campaignDetails.targetAudience],
          // New scheduling/targeting fields
          start_date: campaignDetails.startDate || null,
          end_date: campaignDetails.endDate || null,
          invoice_email: campaignDetails.invoiceEmail || null,
          campaign_ref: campaignDetails.campaignRef || null,
          invoice_ref: campaignDetails.invoiceRef || null,
          target_country: campaignDetails.country || null,
          target_city: campaignDetails.city || null,
          target_distance_km: campaignDetails.distance || 0,
          status: 'pending',
          payment_status: 'pending',
        };

        if (editingCampaign) {
          const { error } = await supabase
            .from('campaigns')
            .update(finalCampaignData)
            .eq('id', editingCampaign.id);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('campaigns')
            .insert([finalCampaignData]);
          
          if (error) throw error;
        }
        
        alert('Campaign saved as pending. You can send the payment link when ready.');
        setShowCampaignForm(false);
        setEditingCampaign(null);
        setCurrentStep(1);
        loadDashboardData();
      } catch (error) {
        console.error('Error saving campaign:', error);
        alert('Error saving campaign');
      }
    };

    const handleSendPaymentLink = async () => {
      try {
        // First save the campaign if it's new
        let campaignId = editingCampaign?.id;
        
        if (!campaignId) {
          const finalCampaignData = {
            ...formData,
            title: campaignDetails.campaignTitle,
            company_name: campaignDetails.companyName,
            monthly_payment_amount: campaignDetails.totalCost,
            target_cities: campaignDetails.city ? [campaignDetails.city] : [],
            target_locations: campaignDetails.country ? [campaignDetails.country] : [],
            target_event_types: [campaignDetails.targetAudience],
            start_date: campaignDetails.startDate || null,
            end_date: campaignDetails.endDate || null,
            invoice_email: campaignDetails.invoiceEmail || null,
            campaign_ref: campaignDetails.campaignRef || null,
            invoice_ref: campaignDetails.invoiceRef || null,
            target_country: campaignDetails.country || null,
            target_city: campaignDetails.city || null,
            target_distance_km: campaignDetails.distance || 0,
            status: 'pending',
            payment_status: 'pending',
          };

          const { data, error } = await supabase
            .from('campaigns')
            .insert([finalCampaignData])
            .select()
            .single();
          
          if (error) throw error;
          campaignId = data.id;
        }

        // Send invoice via API
        const response = await fetch('https://portal.ontimely.co.uk/api/send-campaign-invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            campaign_id: campaignId,
            email: campaignDetails.invoiceEmail,
            amount: campaignDetails.discountAmount > 0 ? campaignDetails.finalCost : campaignDetails.totalCost,
            discount_code: campaignDetails.discountCode || null,
            discount_amount: campaignDetails.discountAmount || 0,
            original_amount: campaignDetails.totalCost,
            company_name: campaignDetails.companyName,
            campaign_title: campaignDetails.campaignTitle,
            invoice_ref: campaignDetails.invoiceRef,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send invoice');
        }

        const invoiceData = await response.json();
        
        // Update campaign with invoice info
        await supabase
          .from('campaigns')
          .update({
            payment_status: 'invoice_sent',
            invoice_id: invoiceData.invoice_id,
            invoice_url: invoiceData.payment_url,
          })
          .eq('id', campaignId);

        alert('Payment link sent successfully! The customer will receive an invoice email.');
        setShowCampaignForm(false);
        setEditingCampaign(null);
        setCurrentStep(1);
        loadDashboardData();
      } catch (error: any) {
        console.error('Error sending payment link:', error);
        alert(`Error sending payment link: ${error.message}`);
      }
    };

    const renderStep1 = () => (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Campaign Information & Pricing</h2>
          <p className="text-gray-600">Set up your campaign details and get an instant quote</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Campaign Title *</label>
            <input
              type="text"
              value={campaignDetails.campaignTitle}
              onChange={(e) => setCampaignDetails(prev => ({ ...prev, campaignTitle: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name *</label>
            <input
              type="text"
              value={campaignDetails.companyName}
              onChange={(e) => setCampaignDetails(prev => ({ ...prev, companyName: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Invoice Email *</label>
            <input
              type="email"
              value={campaignDetails.invoiceEmail}
              onChange={(e) => setCampaignDetails(prev => ({ ...prev, invoiceEmail: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Campaign Reference</label>
            <input
              type="text"
              value={campaignDetails.campaignRef}
              onChange={(e) => setCampaignDetails(prev => ({ ...prev, campaignRef: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Invoice Reference</label>
            <input
              type="text"
              value={campaignDetails.invoiceRef}
              onChange={(e) => setCampaignDetails(prev => ({ ...prev, invoiceRef: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deal Duration (days)</label>
            <input
              type="number"
              value={campaignDetails.dealDuration}
              onChange={(e) => setCampaignDetails(prev => ({ ...prev, dealDuration: parseInt(e.target.value) || 30 }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date *</label>
            <input
              type="date"
              value={campaignDetails.startDate}
              onChange={(e) => setCampaignDetails(prev => ({ ...prev, startDate: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
            {campaignDetails.endDate && (
              <p className="text-xs text-gray-500 mt-1">Ends on {campaignDetails.endDate}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Deal Description</label>
          <textarea
            value={campaignDetails.dealDescription}
            onChange={(e) => setCampaignDetails(prev => ({ ...prev, dealDescription: e.target.value }))}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            rows={3}
            placeholder="Describe the deal, offer, or promotion..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Country *</label>
            <CustomSelect
              value={campaignDetails.country}
              onChange={(val) => setCampaignDetails(prev => ({ ...prev, country: val }))}
              options={[
                { label: 'Select Country', value: '' },
                { label: 'Global', value: 'global' },
                { label: 'United States', value: 'US' },
                { label: 'United Kingdom', value: 'UK' },
                { label: 'Canada', value: 'CA' },
                { label: 'Australia', value: 'AU' },
                { label: 'Germany', value: 'DE' },
                { label: 'France', value: 'FR' },
                { label: 'Spain', value: 'ES' },
                { label: 'Italy', value: 'IT' },
                { label: 'Netherlands', value: 'NL' },
              ]}
              placeholder="Select Country"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              value={campaignDetails.city}
              onChange={(e) => setCampaignDetails(prev => ({ ...prev, city: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., London, New York"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
            <input
              type="number"
              value={campaignDetails.distance}
              onChange={(e) => setCampaignDetails(prev => ({ ...prev, distance: parseInt(e.target.value) || 0 }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              min="0"
              placeholder="0 for city-wide"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Target Audience</label>
          <CustomSelect
            value={campaignDetails.targetAudience}
            onChange={(val) => setCampaignDetails(prev => ({ ...prev, targetAudience: val }))}
            options={[
              { label: 'All Event Attendees', value: 'all' },
              { label: 'Business Events Only', value: 'business' },
              { label: 'Conferences Only', value: 'conference' },
              { label: 'Weddings Only', value: 'wedding' },
              { label: 'Corporate Events Only', value: 'corporate' },
            ]}
            placeholder="Select Audience"
          />
        </div>

        {/* Discount Code Section */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Discount Code (Optional)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={campaignDetails.discountCode}
              onChange={(e) => setCampaignDetails(prev => ({ ...prev, discountCode: e.target.value }))}
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  validateDiscountCode(e.target.value);
                }
              }}
              placeholder="Enter discount code"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 uppercase"
              style={{ textTransform: 'uppercase' }}
            />
            <button
              type="button"
              onClick={() => validateDiscountCode(campaignDetails.discountCode)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
          {campaignDetails.discountAmount > 0 && (
            <div className="mt-2 text-sm text-green-700 font-medium">
              ✓ Discount applied: -${campaignDetails.discountAmount.toFixed(2)}
            </div>
          )}
        </div>

        {/* Pricing Display */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Pricing Estimate</h3>
            <button
              type="button"
              onClick={() => {
                setCampaignDetails(prev => ({ ...prev, totalCost: 0 }));
                alert('Amount set to $0 for testing');
              }}
              className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
              title="Set amount to $0 for testing"
            >
              Test: $0
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Estimated Reach:</span>
              <span className="ml-2 font-medium">{campaignDetails.estimatedReach.toLocaleString()} people</span>
            </div>
            <div>
              <span className="text-gray-600">Cost per Impression:</span>
              <span className="ml-2 font-medium">${campaignDetails.costPerImpression.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-gray-600">Campaign Duration:</span>
              <span className="ml-2 font-medium">{campaignDetails.dealDuration} days</span>
            </div>
            <div>
              <span className="text-gray-600">Subtotal:</span>
              <span className="ml-2 font-medium">${campaignDetails.totalCost.toFixed(2)}</span>
            </div>
            {campaignDetails.discountAmount > 0 && (
              <>
                <div>
                  <span className="text-gray-600">Discount ({campaignDetails.discountCode}):</span>
                  <span className="ml-2 font-medium text-green-600">-${campaignDetails.discountAmount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Cost:</span>
                  <span className="ml-2 font-bold text-green-600 text-lg">${campaignDetails.finalCost.toFixed(2)}</span>
                </div>
              </>
            )}
            {campaignDetails.discountAmount === 0 && (
              <div>
                <span className="text-gray-600">Total Cost:</span>
                <span className="ml-2 font-bold text-green-600 text-lg">${campaignDetails.totalCost.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    const renderStep2 = () => (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Payment Confirmation</h2>
          <p className="text-gray-600">Review and confirm your campaign pricing</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Campaign:</span>
              <span className="font-medium">{campaignDetails.campaignTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Company:</span>
              <span className="font-medium">{campaignDetails.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{campaignDetails.country} {campaignDetails.city && `- ${campaignDetails.city}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{campaignDetails.dealDuration} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Reach:</span>
              <span className="font-medium">{campaignDetails.estimatedReach.toLocaleString()} people</span>
            </div>
            <div className="border-t pt-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${campaignDetails.totalCost.toFixed(2)}</span>
                </div>
                {campaignDetails.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({campaignDetails.discountCode}):</span>
                    <span className="font-medium">-${campaignDetails.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total Cost:</span>
                  <span className="text-green-600">${(campaignDetails.discountAmount > 0 ? campaignDetails.finalCost : campaignDetails.totalCost).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Payment Required</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Payment must be completed before proceeding to create the advertisement. You will be redirected to our payment processor.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    const renderStep3 = () => (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Advertisement</h2>
          <p className="text-gray-600">Design your mobile advertisement</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Short Description *</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              rows={2}
              maxLength={60}
              placeholder="Brief description for mobile display"
            />
            <p className="text-xs text-gray-500">Max 60 characters (for mobile display)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Description</label>
            <textarea
              value={formData.full_description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, full_description: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              rows={2}
              placeholder="Detailed description for ad detail page"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">CTA Text</label>
            <input
              type="text"
              value={formData.cta_text || 'Get Info'}
              onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CTA URL</label>
            <input
              type="url"
              value={formData.cta_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, cta_url: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Advertisement Image *</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => {
                // Handle file upload
                const file = e.target.files?.[0];
                if (file) {
                  // Here you would upload to your storage service
                  console.log('Upload file:', file);
                }
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
            <p className="text-xs text-gray-500">Supports all image and video formats</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Logo *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                // Handle file upload
                const file = e.target.files?.[0];
                if (file) {
                  // Here you would upload to your storage service
                  console.log('Upload logo:', file);
                }
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
            <p className="text-xs text-gray-500">Supports all image formats</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Discount Code</label>
            <input
              type="text"
              value={formData.discount_code || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, discount_code: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Discount Link</label>
            <input
              type="url"
              value={formData.discount_link || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, discount_link: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <CustomSelect
            value={formData.status || 'draft'}
            onChange={(val) => setFormData(prev => ({ ...prev, status: val as 'active' | 'paused' | 'draft' | 'ended' }))}
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'Active', value: 'active' },
              { label: 'Paused', value: 'paused' },
              { label: 'Ended', value: 'ended' },
            ]}
            placeholder="Select Status"
          />
        </div>
      </div>
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <button
              type="button"
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1);
                } else {
                  setShowCampaignForm(false);
                  setEditingCampaign(null);
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            
            <div className="flex space-x-2">
              {currentStep === 2 && (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Save as Pending
                  </button>
                  <button
                    type="button"
                    onClick={handleSendPaymentLink}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Send Payment Link
                  </button>
                </>
              )}
              
              {currentStep === 3 ? (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Save as Pending
                  </button>
                  <button
                    type="button"
                    onClick={handleSendPaymentLink}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Send Payment Link
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {showCampaignForm && <CampaignForm />}
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Smart Advertising Platform</h1>
            <p className="text-gray-600 mt-2">AI-powered location-based advertising management</p>
          </div>
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            onClick={() => setShowCampaignForm(true)}
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Impressions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalImpressions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center">
            <MousePointer className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg CTR</p>
              <p className="text-2xl font-bold text-gray-900">{(stats.avgCTR * 100).toFixed(2)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center">
            <Zap className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hot Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.hotOpportunities}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
          <div className="flex items-center">
            <Brain className="w-8 h-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Market Ops</p>
              <p className="text-2xl font-bold text-gray-900">{stats.marketOpportunities}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'campaigns', label: 'Campaigns', icon: Target },
            { key: 'intelligence', label: 'Market Intelligence', icon: Brain },
            { key: 'opportunities', label: 'Sales Opportunities', icon: TrendingUp },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Campaign Management</h2>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 border border-gray-300 rounded-md text-sm flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <button className="px-3 py-2 border border-gray-300 rounded-md text-sm flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Search
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Tier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locations</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                            <div className="text-sm text-gray-500">{campaign.company_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentTierColor(campaign.payment_tier)}`}>
                            {campaign.payment_tier}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${campaign.monthly_payment_amount?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {campaign.payment_status ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              campaign.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                              campaign.payment_status === 'invoice_sent' ? 'bg-yellow-100 text-yellow-800' :
                              campaign.payment_status === 'pending' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {campaign.payment_status}
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              N/A
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{campaign.impressions_count.toLocaleString()} impressions</div>
                          <div className="text-sm text-gray-500">{(campaign.ctr * 100).toFixed(2)}% CTR</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {campaign.target_cities?.length ? `${campaign.target_cities.length} cities` : 'Global'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => {
                                setEditingCampaign(campaign);
                                setShowCampaignForm(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            {campaign.payment_status === 'paid' && campaign.status === 'pending' && (
                              <button
                                onClick={async () => {
                                  if (confirm('Activate this campaign? It will go live immediately.')) {
                                    try {
                                      const { error } = await supabase
                                        .from('campaigns')
                                        .update({ status: 'active' })
                                        .eq('id', campaign.id);
                                      
                                      if (error) throw error;
                                      loadDashboardData();
                                      alert('Campaign activated successfully!');
                                    } catch (error) {
                                      console.error('Error activating campaign:', error);
                                      alert('Error activating campaign');
                                    }
                                  }
                                }}
                                className="text-green-600 hover:text-green-900 font-semibold"
                              >
                                Activate
                              </button>
                            )}
                            {campaign.payment_status === 'invoice_sent' && (
                              <button
                                onClick={async () => {
                                  // Check invoice status and manually activate if paid
                                  try {
                                    if (campaign.invoice_id) {
                                      const { data: invoice } = await supabase
                                        .from('invoices')
                                        .select('status')
                                        .eq('id', campaign.invoice_id)
                                        .single();
                                      
                                      if (invoice?.status === 'paid') {
                                        await supabase
                                          .from('campaigns')
                                          .update({ 
                                            status: 'active',
                                            payment_status: 'paid'
                                          })
                                          .eq('id', campaign.id);
                                        alert('Campaign activated! Invoice was paid.');
                                      } else {
                                        alert('Invoice not yet paid. Status: ' + (invoice?.status || 'unknown'));
                                      }
                                    } else {
                                      alert('No invoice ID found for this campaign.');
                                    }
                                    loadDashboardData();
                                  } catch (error) {
                                    console.error('Error checking invoice:', error);
                                    alert('Error checking invoice status');
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Check Payment
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this campaign?')) {
                                  try {
                                    const { error } = await supabase
                                      .from('campaigns')
                                      .delete()
                                      .eq('id', campaign.id);
                                    
                                    if (error) throw error;
                                    loadDashboardData();
                                  } catch (error) {
                                    console.error('Error deleting campaign:', error);
                                    alert('Error deleting campaign');
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">AI Market Intelligence</h2>
                <p className="text-sm text-gray-600 mt-1">AI-analyzed market opportunities and insights</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marketIntel.map((intel) => (
                    <div key={intel.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{intel.location_name}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getPriorityColor(intel.sales_priority)}`}>
                            {intel.sales_priority} priority
                          </span>
                        </div>
                        <MapPin className="w-5 h-5 text-gray-400" />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue Potential:</span>
                          <span className="font-medium">${intel.revenue_potential.toLocaleString()}/mo</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Business Density:</span>
                          <span className="font-medium">{(intel.business_density_score * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Competition:</span>
                          <span className={`font-medium ${
                            intel.competition_level === 'low' ? 'text-green-600' : 
                            intel.competition_level === 'medium' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {intel.competition_level}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Last analyzed: {new Date(intel.last_analyzed).toLocaleDateString()}</span>
                          <button className="text-indigo-600 hover:text-indigo-700 font-medium">View Details</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">AI-Generated Sales Opportunities</h2>
                <p className="text-sm text-gray-600 mt-1">Potential clients identified by AI analysis</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likelihood</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Insight</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesOps.map((opportunity) => (
                      <tr key={opportunity.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{opportunity.company_name}</div>
                          <div className="text-sm text-gray-500">{opportunity.status}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {opportunity.business_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${opportunity.estimated_budget.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full" 
                                style={{ width: `${opportunity.likelihood_score * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{(opportunity.likelihood_score * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(opportunity.priority_level)}`}>
                            {opportunity.priority_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {opportunity.ai_reasoning}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Analytics</h2>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                <p>Advanced analytics dashboard coming soon...</p>
                <p className="text-sm mt-2">Will include revenue trends, geographic performance, and AI insights</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAdvertising;