import React, { useState, useEffect } from 'react';
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Brain, 
  Users, 
  Calendar,
  Eye,
  MousePointer,
  Award,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  BarChart3,
  Globe,
  Clock,
  Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Campaign {
  id: string;
  title: string;
  company_name: string;
  payment_tier: 'premium' | 'standard' | 'basic';
  monthly_payment_amount: number;
  status: 'active' | 'paused' | 'draft' | 'ended';
  impressions_count: number;
  clicks_count: number;
  ctr: number;
  target_cities: string[];
  created_at: string;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Advertising Platform</h1>
          <p className="text-gray-600 mt-2">AI-powered location-based advertising management</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
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
      <div className="mt-6">
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locations</th>
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
                          ${campaign.monthly_payment_amount?.toLocaleString() || 0}/mo
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
