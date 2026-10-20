export interface RenderServiceResult {
  success: boolean;
  serviceId?: string;
  liveUrl?: string;
  dashboardUrl?: string;
  message?: string;
}

export class RenderService {
  private static getHeaders() {
    const key = process.env.RENDER_API_KEY || '';
    return {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  // 1. Get Render Owner ID (Workspace / Team)
  public static async getOwnerId(): Promise<string | null> {
    try {
      const res = await fetch('https://api.render.com/v1/owners', {
        headers: this.getHeaders(),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as Array<{ owner: { id: string } }>;
      return data[0]?.owner?.id || null;
    } catch {
      return null;
    }
  }

  // 2. Deploy or update GHCR Container on Render
  public static async deployGHCRImage(
    serviceName: string,
    imagePath: string,
    port = 80
  ): Promise<RenderServiceResult> {
    try {
      const token = process.env.RENDER_API_KEY;
      if (!token) {
        return { success: false, message: 'RENDER_API_KEY is not configured.' };
      }

      const cleanName = serviceName.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 30);
      const ownerId = await this.getOwnerId();
      if (!ownerId) {
        return { success: false, message: 'Could not fetch Render owner workspace.' };
      }

      // Check if service already exists
      const servicesRes = await fetch('https://api.render.com/v1/services?limit=20', {
        headers: this.getHeaders(),
      });
      let existingServiceId: string | null = null;
      let liveUrl: string | null = null;
      let dashboardUrl: string | null = null;

      if (servicesRes.ok) {
        const servicesData = (await servicesRes.json()) as Array<{
          service: { id: string; name: string; dashboardUrl: string; serviceDetails: { url?: string } };
        }>;
        const match = servicesData.find(
          (s) =>
            s.service.name.toLowerCase() === cleanName ||
            s.service.name.toLowerCase() === serviceName.toLowerCase()
        );
        if (match) {
          existingServiceId = match.service.id;
          liveUrl = match.service.serviceDetails?.url || null;
          dashboardUrl = match.service.dashboardUrl;
        }
      }

      if (existingServiceId) {
        // Trigger re-deploy on existing service
        const deployRes = await fetch(`https://api.render.com/v1/services/${existingServiceId}/deploys`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({}),
        });
        if (deployRes.ok) {
          return {
            success: true,
            serviceId: existingServiceId,
            liveUrl: liveUrl || `https://${cleanName}.onrender.com`,
            dashboardUrl: dashboardUrl || `https://dashboard.render.com/web/${existingServiceId}`,
            message: `Triggered live cloud deploy on Render for ${cleanName}`,
          };
        }
      }

      // Create new Web Service on Render from container image
      const createRes = await fetch('https://api.render.com/v1/services', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          type: 'web_service',
          name: cleanName,
          ownerId,
          image: {
            imagePath,
          },
          serviceDetails: {
            env: 'image',
            plan: 'free',
            region: 'singapore',
            openPorts: [
              {
                port,
                protocol: 'TCP',
              },
            ],
          },
        }),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        return {
          success: false,
          message: `Render API: ${errText}`,
        };
      }

      const created = (await createRes.json()) as {
        service: {
          id: string;
          dashboardUrl: string;
          serviceDetails: { url?: string };
        };
      };

      return {
        success: true,
        serviceId: created.service.id,
        liveUrl: created.service.serviceDetails.url || `https://${cleanName}.onrender.com`,
        dashboardUrl: created.service.dashboardUrl,
        message: `Successfully provisioned live HTTPS container on Render!`,
      };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }
}
