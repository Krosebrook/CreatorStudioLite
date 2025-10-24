import React, { useState, useEffect } from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  displayName?: string;
  email?: string;
  joinedAt: Date;
  invitedBy?: string;
}

interface PendingInvite {
  email: string;
  role: string;
  invitedAt: Date;
}

export const TeamCollaboration: React.FC<{ workspaceId: string }> = ({ workspaceId }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');

  useEffect(() => {
    loadTeamMembers();
  }, [workspaceId]);

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);

      const { data: membersData, error } = await supabase
        .from('workspace_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          invited_by,
          user:user_profiles!user_id(
            display_name
          )
        `)
        .eq('workspace_id', workspaceId);

      if (error) throw error;

      const formattedMembers: TeamMember[] = (membersData || []).map((member: any) => ({
        id: member.id,
        userId: member.user_id,
        role: member.role,
        displayName: member.user?.display_name,
        joinedAt: new Date(member.joined_at),
        invitedBy: member.invited_by,
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !user) return;

    try {
      console.log('Inviting member:', inviteEmail, 'with role:', inviteRole);

      setInvites([
        ...invites,
        {
          email: inviteEmail,
          role: inviteRole,
          invitedAt: new Date(),
        },
      ]);

      setInviteEmail('');
      alert('Invitation sent successfully!');
    } catch (error) {
      console.error('Failed to invite member:', error);
      alert('Failed to send invitation. Please try again.');
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      await loadTeamMembers();
      alert('Member role updated successfully!');
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update role. Please try again.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this team member? They will lose access to the workspace.'
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await loadTeamMembers();
      alert('Team member removed successfully!');
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member. Please try again.');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Collaboration</h1>
        <p className="text-gray-600">Manage your workspace team members and permissions</p>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Invite Team Member</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <Button onClick={handleInviteMember} disabled={!inviteEmail}>
              Send Invite
            </Button>
          </div>
        </div>
      </Card>

      {invites.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Pending Invites</h2>
            <div className="space-y-3">
              {invites.map((invite, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{invite.email}</p>
                    <p className="text-sm text-gray-500">
                      Invited {invite.invitedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(invite.role)}`}>
                      {invite.role}
                    </span>
                    <Button variant="secondary" size="sm">
                      Resend
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Team Members ({members.length})</h2>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.displayName ? member.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.displayName || 'Unknown User'}</p>
                    <p className="text-sm text-gray-500">
                      Joined {member.joinedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={member.role}
                    onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                    disabled={member.userId === user?.id}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </Select>
                  {member.userId !== user?.id && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Role Permissions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Admin</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>Full access to all workspace features</li>
                <li>Manage team members and permissions</li>
                <li>Configure workspace settings</li>
                <li>Manage billing and subscriptions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Editor</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>Create and edit content</li>
                <li>Publish to connected platforms</li>
                <li>Manage media library</li>
                <li>View analytics</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Viewer</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>View published content</li>
                <li>View analytics</li>
                <li>Comment on content</li>
                <li>Limited editing capabilities</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
