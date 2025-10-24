import React, { useState, useEffect } from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { auditLogService } from '../../services/audit';
import { usageTrackingService } from '../../services/usage';
import type { AuditLogEntry, UsageSummary } from '../../services/audit';

interface AdminStats {
  totalUsers: number;
  activeWorkspaces: number;
  totalPosts: number;
  storageUsed: number;
}

export const AdminDashboard: React.FC<{ workspaceId: string }> = ({ workspaceId }) => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeWorkspaces: 0,
    totalPosts: 0,
    storageUsed: 0,
  });
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, [workspaceId]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);

      const [logsResult, usageSummary] = await Promise.all([
        auditLogService.getWorkspaceLogs(workspaceId, { limit: 10 }),
        usageTrackingService.getUsageSummary(workspaceId, 'month'),
      ]);

      setRecentLogs(logsResult.logs);
      setUsage(usageSummary);

      setStats({
        totalUsers: 0,
        activeWorkspaces: 1,
        totalPosts: usageSummary.posts,
        storageUsed: usageSummary.storage,
      });
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchLogs = async () => {
    if (!searchTerm) {
      await loadAdminData();
      return;
    }

    try {
      const results = await auditLogService.searchLogs(workspaceId, searchTerm, { limit: 50 });
      setRecentLogs(results);
    } catch (error) {
      console.error('Failed to search logs:', error);
    }
  };

  const handleExportLogs = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      const csv = await auditLogService.exportLogs(workspaceId, startDate, endDate, 'csv');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export logs:', error);
      alert('Failed to export logs. Please try again.');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'create':
        return 'text-green-600 bg-green-50';
      case 'update':
        return 'text-blue-600 bg-blue-50';
      case 'delete':
        return 'text-red-600 bg-red-50';
      case 'publish':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Workspace management and monitoring</p>
          </div>
          <Button onClick={handleExportLogs} size="sm">
            Export Logs
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="p-6">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-sm font-medium text-gray-600">Active Workspaces</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeWorkspaces}</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPosts}</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatBytes(stats.storageUsed)}</p>
              </div>
            </Card>
          </div>

          {usage && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Usage Overview (30 days)</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Posts</p>
                    <p className="text-2xl font-bold text-gray-900">{usage.posts}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Storage</p>
                    <p className="text-2xl font-bold text-gray-900">{formatBytes(usage.storage)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">AI Credits</p>
                    <p className="text-2xl font-bold text-gray-900">{usage.aiCredits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Exports</p>
                    <p className="text-2xl font-bold text-gray-900">{usage.exports}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchLogs()}
                  />
                  <Button size="sm" onClick={handleSearchLogs}>
                    Search
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.resourceType && log.resourceId
                            ? `${log.resourceType}: ${log.resourceId.substring(0, 8)}`
                            : 'System action'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.createdAt.toLocaleString()}
                          {log.ipAddress && ` • ${log.ipAddress}`}
                        </p>
                      </div>
                    </div>
                    {log.userId && (
                      <p className="text-xs text-gray-500">
                        User: {log.userId.substring(0, 8)}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {recentLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No audit logs found
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
