import React from 'react';
import { Badge } from './Badge';

export interface StatusPillProps {
  status:
    | 'success'
    | 'failed'
    | 'running'
    | 'pending'
    | 'queued'
    | 'aborted'
    | 'healthy'
    | 'degraded'
    | 'deploying'
    | 'approved'
    | 'draft'
    | 'pending_approval'
    | 'superseded'
    | 'connected'
    | 'demo'
    | 'disconnected'
    | 'not_configured'
    | 'verification_required'
    | 'error'
    | 'unavailable'
    | 'unconfigured'
    | 'none';
  label?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, label }) => {
  switch (status) {
    case 'success':
    case 'healthy':
    case 'approved':
    case 'connected':
      return (
        <Badge variant="success" dot>
          {label || (status === 'success' ? 'Success' : status === 'healthy' ? 'Healthy' : status === 'approved' ? 'Approved' : 'Connected')}
        </Badge>
      );
    case 'failed':
    case 'aborted':
    case 'degraded':
    case 'error':
      return (
        <Badge variant="danger" dot>
          {label || (status === 'failed' ? 'Failed' : status === 'aborted' ? 'Aborted' : status === 'error' ? 'Error' : 'Degraded')}
        </Badge>
      );
    case 'running':
    case 'deploying':
      return (
        <Badge variant="running" dot>
          {label || (status === 'deploying' ? 'Deploying...' : 'In Progress')}
        </Badge>
      );
    case 'pending':
    case 'queued':
    case 'pending_approval':
    case 'verification_required':
      return (
        <Badge variant="warning" dot>
          {label || (status === 'pending_approval' ? 'Pending Approval' : status === 'verification_required' ? 'Verification Required' : 'Queued')}
        </Badge>
      );
    case 'demo':
      return (
        <Badge variant="info" dot>
          {label || 'Demo Sample'}
        </Badge>
      );
    case 'draft':
      return (
        <Badge variant="neutral" dot>
          {label || 'Draft'}
        </Badge>
      );
    case 'not_configured':
    case 'unconfigured':
    case 'unavailable':
    case 'disconnected':
    case 'superseded':
    case 'none':
    default:
      return (
        <Badge variant="neutral">
          {label || (status === 'not_configured' || status === 'unconfigured' ? 'Not Configured' : status === 'unavailable' ? 'Unavailable' : status === 'disconnected' ? 'Disconnected' : 'None')}
        </Badge>
      );
  }
};
