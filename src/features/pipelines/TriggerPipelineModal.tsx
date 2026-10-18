import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { PlaySquare, GitBranch, AlertCircle } from 'lucide-react';
import { repositoryService } from '@/services/repositoryService';
import { pipelineService } from '@/services/pipelineService';
import { Repository } from '@/types';
import { useToast } from '@/components/common/Toast';

interface TriggerPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositories: Repository[];
  onTriggered: () => void;
}

export const TriggerPipelineModal: React.FC<TriggerPipelineModalProps> = ({
  isOpen,
  onClose,
  repositories,
  onTriggered,
}) => {
  const [selectedRepoId, setSelectedRepoId] = useState(repositories[0]?.id || 'repo-unified-devops');
  const [branch, setBranch] = useState('main');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await pipelineService.triggerPipeline(selectedRepoId, branch);
      toast.success(
        'Pipeline Triggered',
        `Build #${res.data.buildNumber} queued for execution on ${branch}.`
      );
      onTriggered();
      onClose();
    } catch {
      toast.error('Trigger failed', 'Unable to initiate Jenkins pipeline run.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Trigger CI/CD Pipeline Execution"
      description="Initiate 9-stage automated build, scan, and deployment workflow."
      size="md"
    >
      <form onSubmit={handleTrigger} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Target Repository
          </label>
          <select
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-lg border border-border bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {repositories.map((r) => (
              <option key={r.id} value={r.id}>
                {r.fullName} ({r.language})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Branch Reference
          </label>
          <input
            type="text"
            required
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="p-3 rounded-xl bg-surface-subtle border border-border text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">Pipeline Stages Executed:</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Checkout → Install Dependencies → Run Tests → SonarQube Analysis → Trivy Security Scan → Build Docker Image → Push to GHCR → Deploy to Kubernetes → Record Metadata
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <Button variant="secondary" size="md" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={isLoading}
            leftIcon={<PlaySquare className="w-4 h-4" />}
          >
            Dispatch Pipeline
          </Button>
        </div>
      </form>
    </Modal>
  );
};
