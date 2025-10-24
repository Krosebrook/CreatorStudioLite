import { BaseConnector, ConnectorConfig } from './BaseConnector';

export class ConnectorRegistry {
  private static instance: ConnectorRegistry;
  private connectors: Map<string, typeof BaseConnector> = new Map();
  private activeConnectors: Map<string, BaseConnector> = new Map();

  private constructor() {}

  static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  register(id: string, connectorClass: typeof BaseConnector): void {
    this.connectors.set(id, connectorClass);
  }

  getConnectorClass(id: string): typeof BaseConnector | undefined {
    return this.connectors.get(id);
  }

  async createConnector(id: string, config: ConnectorConfig): Promise<BaseConnector> {
    const ConnectorClass = this.connectors.get(id);
    if (!ConnectorClass) {
      throw new Error(`Connector ${id} not found in registry`);
    }

    const connector = new (ConnectorClass as any)(config);
    this.activeConnectors.set(id, connector);
    return connector;
  }

  getActiveConnector(id: string): BaseConnector | undefined {
    return this.activeConnectors.get(id);
  }

  getAllActiveConnectors(): BaseConnector[] {
    return Array.from(this.activeConnectors.values());
  }

  removeConnector(id: string): void {
    this.activeConnectors.delete(id);
  }

  listAvailableConnectors(): string[] {
    return Array.from(this.connectors.keys());
  }
}

export const connectorRegistry = ConnectorRegistry.getInstance();
