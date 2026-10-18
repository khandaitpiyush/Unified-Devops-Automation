import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  FileCode,
  Download,
  Copy,
  RefreshCw,
  CheckCircle2,
  Lock,
  Layers,
  Folder,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { CodeViewer } from '@/components/common/CodeViewer';
import { artifactService } from '@/services/artifactService';
import { GeneratedArtifact } from '@/types';
import { useToast } from '@/components/common/Toast';
import { formatDate } from '@/lib/utils';

export const ArtifactsPage: React.FC = () => {
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>([]);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadArtifacts() {
      try {
        setLoading(true);
        const res = await artifactService.getArtifacts();
        setArtifacts(res.data);
        if (res.data.length > 0) {
          setSelectedArtifactId(res.data[0].id);
        }
      } finally {
        setLoading(false);
      }
    }
    loadArtifacts();
  }, []);

  const selectedArtifact = artifacts.find((a) => a.id === selectedArtifactId) || artifacts[0];

  const handleRegenerate = async () => {
    if (!selectedArtifact) return;
    try {
      setIsRegenerating(true);
      const res = await artifactService.regenerateArtifacts(selectedArtifact.blueprintId);
      setArtifacts(res.data);
      toast.success('Artifacts Re-synthesized', 'Latest files aligned with blueprint.');
    } catch {
      toast.error('Regeneration failed', 'Unable to regenerate configuration files.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Group files logically for developer navigation
  const categories = [
    {
      name: 'CI/CD Pipelines',
      files: artifacts.filter((a) => a.fileType === 'jenkinsfile'),
    },
    {
      name: 'Container Hardening',
      files: artifacts.filter((a) => a.fileType === 'dockerfile' || a.fileType === 'dockerignore'),
    },
    {
      name: 'Kubernetes Manifests',
      files: artifacts.filter((a) => a.fileType.startsWith('k8s_')),
    },
    {
      name: 'Infrastructure As Code',
      files: artifacts.filter((a) => a.fileType.startsWith('terraform_')),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Generated DevOps Manifests
            </h1>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-medium">
              <Lock className="w-3 h-3" /> zero secrets embedded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Production-ready configuration files generated from verified DevOps Blueprint specs.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />}
          onClick={handleRegenerate}
          isLoading={isRegenerating}
        >
          Regenerate From Blueprint
        </Button>
      </div>

      {/* Two-Pane IDE Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left Column: Categorized File Explorer */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="p-2.5 space-y-3">
            {categories.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <p className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Folder className="w-3 h-3 text-slate-400" />
                  {cat.name}
                </p>
                <div className="space-y-0.5">
                  {cat.files.map((art) => {
                    const isSelected = art.id === selectedArtifact?.id;
                    return (
                      <button
                        key={art.id}
                        onClick={() => setSelectedArtifactId(art.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary-600' : 'text-slate-400'}`} />
                          <span className="truncate text-xs">{art.filename}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {art.language}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </Card>

          {selectedArtifact && (
            <Card className="p-3.5 space-y-2 text-xs">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Release Spec Stamp
              </p>
              <div className="flex justify-between py-1 border-b border-border/70">
                <span className="text-slate-500">Blueprint Version</span>
                <span className="font-mono font-semibold text-slate-800">
                  {selectedArtifact.blueprintVersion}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/70">
                <span className="text-slate-500">Status</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Last Generated</span>
                <span className="text-slate-600 text-[11px]">{formatDate(selectedArtifact.updatedAt)}</span>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Code Viewer */}
        <div className="lg:col-span-3">
          {selectedArtifact ? (
            <CodeViewer
              code={selectedArtifact.content}
              filename={selectedArtifact.filename}
              language={selectedArtifact.language}
            />
          ) : (
            <div className="p-12 text-center bg-white rounded-lg border border-border">
              <p className="text-xs text-slate-500">No artifact selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
