import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Github, Link2, Check, AlertCircle } from 'lucide-react';
import { repositoryService } from '@/services/repositoryService';
import { useToast } from '@/components/common/Toast';
import { Repository } from '@/types';

interface ConnectRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (newRepo: Repository) => void;
}

export const ConnectRepoModal: React.FC<ConnectRepoModalProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [repoName, setRepoName] = useState('');
  const [language, setLanguage] = useState('TypeScript / React');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleUrlChange = (url: string) => {
    setRepoUrl(url);
    const cleaned = url.replace(/https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').trim();
    const parts = cleaned.split('/');
    if (parts.length >= 2 && parts[1]) {
      setRepoName(parts[1]);
    } else if (parts.length === 1 && parts[0] && !repoName) {
      setRepoName(parts[0]);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoName.trim() && !repoUrl.trim()) {
      toast.error('Validation error', 'Repository name or URL is required');
      return;
    }

    try {
      setIsLoading(true);
      let owner = 'khandaitpiyush';
      let name = repoName.trim();
      const cleaned = repoUrl.replace(/https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').trim();
      const parts = cleaned.split('/');
      if (parts.length >= 2 && parts[0] && parts[1]) {
        owner = parts[0];
        name = parts[1];
      }

      const res = await repositoryService.connectRepository({
        name,
        owner,
        fullName: `${owner}/${name}`,
        url: repoUrl.trim() || `https://github.com/${owner}/${name}`,
        language,
        visibility: 'public',
      });
      toast.success('Repository Connected', `Successfully connected ${res.data.fullName}`);
      onConnected(res.data);
      onClose();
    } catch {
      toast.error('Connection failed', 'Unable to connect repository');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect GitHub Repository"
      description="Select an existing GitHub repository to begin autonomous DevOps blueprinting."
      size="md"
    >
      <form onSubmit={handleConnect} className="space-y-4">
        {/* GitHub OAuth Status Notice */}
        <div className="p-3.5 rounded-xl bg-surface-subtle border border-border flex items-start gap-3">
          <Github className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-slate-800">GitHub App Authenticated</p>
            <p className="text-slate-500 mt-0.5">
              Unified DevOps Automation will read repository structure and commit webhooks. Secrets are never exposed to browser code.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Repository URL
          </label>
          <input
            type="url"
            placeholder="https://github.com/khandaitpiyush/..."
            value={repoUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Repository Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. checkout-microservice"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Primary Application Stack
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="TypeScript / React">TypeScript / React (Vite)</option>
            <option value="JavaScript / Node.js">JavaScript / Node.js (Fastify/Express)</option>
            <option value="Java / Spring Boot">Java / Spring Boot (Maven/Gradle)</option>
            <option value="Python / FastAPI">Python / FastAPI</option>
            <option value="Go / Gin">Go Microservice</option>
          </select>
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
            leftIcon={<Link2 className="w-4 h-4" />}
          >
            Connect Repository
          </Button>
        </div>
      </form>
    </Modal>
  );
};
