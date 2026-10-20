import dotenv from 'dotenv';
import path from 'path';

// Load .env from root directory if present
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  githubClientId: process.env.GITHUB_CLIENT_ID || 'dummy_github_client_id',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_github_secret',
  jenkinsUrl: process.env.JENKINS_URL || 'http://jenkins.platform.internal:8080',
  jenkinsUser: process.env.JENKINS_USER || 'admin',
  jenkinsToken: process.env.JENKINS_API_TOKEN || '',
  sonarqubeUrl: process.env.SONARQUBE_URL || 'http://sonarqube.platform.internal:9000',
  sonarqubeToken: process.env.SONARQUBE_TOKEN || '',
  kubeConfigPath: process.env.KUBECONFIG || '',
  prometheusUrl: process.env.PROMETHEUS_URL || 'http://prometheus.platform.internal:9090',
  grafanaUrl: process.env.GRAFANA_URL || 'http://grafana.platform.internal:3000',
};
