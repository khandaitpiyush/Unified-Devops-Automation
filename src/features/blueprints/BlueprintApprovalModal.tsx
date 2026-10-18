import React from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { DevOpsBlueprint } from '@/types';

interface BlueprintApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  blueprint: DevOpsBlueprint;
  onConfirmApproval: () => Promise<void>;
  isLoading: boolean;
}

export const BlueprintApprovalModal: React.FC<BlueprintApprovalModalProps> = ({
  isOpen,
  onClose,
  blueprint,
  onConfirmApproval,
  isLoading,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Approve DevOps Blueprint ${blueprint.version}`}
      description="Explicit human approval gate required before deployment artifacts can be generated."
      size="md"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onConfirmApproval}
            isLoading={isLoading}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Authorize & Approve Version
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-900 text-xs space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary-600" />
            Immutable Version Commitment
          </p>
          <p>
            Once approved, <span className="font-mono font-bold">{blueprint.version}</span> is locked and treated as immutable. Any subsequent changes will require authoring a new version draft.
          </p>
        </div>

        <div className="border border-border rounded-xl p-4 space-y-2 text-xs bg-surface-subtle/50">
          <div className="flex justify-between">
            <span className="text-slate-500">Repository</span>
            <span className="font-semibold text-slate-900">{blueprint.repositoryName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Target Environment</span>
            <span className="font-semibold text-slate-900">{blueprint.deploymentTarget}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Container Base</span>
            <span className="font-mono text-slate-800">{blueprint.config.container.baseImage}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Replicas & Namespace</span>
            <span className="font-mono text-slate-800">
              {blueprint.config.deployment.replicas} pods in {blueprint.config.deployment.namespace}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Approving this blueprint unlocks automated generation of <span className="font-mono font-medium">Jenkinsfile</span>, <span className="font-mono font-medium">Dockerfile</span>, and <span className="font-mono font-medium">Kubernetes</span> manifests.
          </p>
        </div>
      </div>
    </Modal>
  );
};
