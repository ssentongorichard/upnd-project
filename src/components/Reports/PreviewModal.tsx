import React from 'react';
import { X, FileText, Users, MapPin, Calendar, TrendingUp, BarChart, Download } from 'lucide-react';
import { useMembers } from '../../hooks/useMembers';
import { useDisciplinary } from '../../hooks/useDisciplinary';

interface PreviewModalProps {
  reportId: string;
  reportTitle: string;
  onClose: () => void;
}

export function PreviewModal({ reportId, reportTitle, onClose }: PreviewModalProps) {
  const { members, statistics } = useMembers();
  const { cases } = useDisciplinary();

  const renderPreviewContent = () => {
    switch (reportId) {
      case 'membership-overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600">Total Members</h4>
                <p className="text-2xl font-bold text-upnd-red mt-2">{members.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600">Approved</h4>
                <p className="text-2xl font-bold text-green-600 mt-2">{statistics?.approvedMembers || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600">Pending</h4>
                <p className="text-2xl font-bold text-upnd-yellow mt-2">{statistics?.pendingApplications || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600">Provinces</h4>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {Object.keys(statistics?.provincialDistribution || {}).length}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3 text-upnd-black">Recent Members</h4>
              <div className="overflow-auto max-h-64">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Province</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.slice(0, 10).map((member) => (
                      <tr key={member.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{member.fullName}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{member.membershipId}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{member.jurisdiction.province}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            member.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'membership-growth':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-4 text-upnd-black">Monthly Registration Trends</h4>
              <div className="space-y-3">
                {statistics?.monthlyTrends?.map((trend) => (
                  <div key={trend.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{trend.month}</span>
                    <div className="flex items-center space-x-3 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-upnd-red to-upnd-yellow h-2 rounded-full"
                          style={{ width: `${trend.registrations > 0 ? (trend.registrations / members.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-upnd-red">{trend.registrations}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'pending-applications':
        const pendingMembers = members.filter(m => m.status.includes('Pending'));
        return (
          <div className="space-y-6">
            <div className="bg-upnd-yellow/10 p-4 rounded-lg border border-upnd-yellow/20">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-upnd-black">{pendingMembers.length}</span> applications pending review
              </p>
            </div>
            <div className="overflow-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Province</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{member.fullName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{member.jurisdiction.province}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          {member.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(member.registrationDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'provincial-distribution':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-4 text-upnd-black">Members by Province</h4>
              <div className="space-y-3">
                {Object.entries(statistics?.provincialDistribution || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([province, count]) => (
                    <div key={province} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{province}</span>
                      <div className="flex items-center space-x-3 flex-1 mx-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-upnd-red to-upnd-yellow h-3 rounded-full"
                            style={{ width: `${(count / members.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-upnd-red">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case 'disciplinary-overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600">Total Cases</h4>
                <p className="text-2xl font-bold text-upnd-red mt-2">{cases.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600">Active</h4>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  {cases.filter(c => c.status === 'Active').length}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600">Resolved</h4>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {cases.filter(c => c.status === 'Resolved').length}
                </p>
              </div>
            </div>
            <div className="overflow-auto max-h-64">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cases.slice(0, 10).map((caseItem) => (
                    <tr key={caseItem.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{caseItem.caseId}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{caseItem.violationType}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          caseItem.status === 'Active' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(caseItem.dateReported).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Report Preview</h4>
            <p className="text-gray-500">
              This report contains comprehensive data and analytics for {reportTitle}.
            </p>
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Preview shows a sample of available data. Export the full report for complete analytics.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-upnd-red to-upnd-yellow text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">{reportTitle}</h2>
              <p className="text-sm text-white/90">Preview - Unity, Work, Progress</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderPreviewContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Generated: {new Date().toLocaleDateString()}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-upnd-red text-white rounded-lg hover:bg-upnd-red-dark transition-colors text-sm font-medium"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
