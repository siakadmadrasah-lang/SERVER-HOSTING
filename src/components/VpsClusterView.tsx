import React, { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Plus,
  RefreshCw,
  Terminal,
  Power,
  RotateCw,
  Square,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Layers,
  Globe,
  ArrowRightLeft,
  Monitor,
  Trash2,
  KeyRound,
  X,
  Box,
  Play
} from 'lucide-react';
import { CurrentSessionUser } from '../types';

interface VpsClusterViewProps {
  currentUser: CurrentSessionUser;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning') => void;
  onOpenTerminal?: () => void;
}

export interface RemoteServerNode {
  id: string;
  name: string;
  hostname: string;
  ipAddress: string;
  sshPort: number;
  location: string;
  provider: string;
  nodeRole: 'Master WHM + KVM' | 'Slave Hosting cPanel' | 'KVM Hypervisor Node' | 'DNS Cluster Node';
  status: 'online' | 'syncing' | 'maintenance';
  cpuCores: number;
  cpuUsage: number;
  ramTotalGb: number;
  ramUsedGb: number;
  diskTotalGb: number;
  diskUsedGb: number;
  vpsContainersCount: number;
  hostingAccountsCount: number;
  latencyMs: number;
  osName: string;
}

export interface ClientVpsInstance {
  id: string;
  hostname: string;
  clientName: string;
  clientEmail: string;
  nodeId: string;
  nodeName: string;
  ipAddress: string;
  osTemplate: string;
  vcpu: number;
  ramGb: number;
  nvmeGb: number;
  bandwidthTb: number;
  bandwidthUsedGb: number;
  status: 'running' | 'stopped' | 'rebuilding';
  virtualization: 'KVM' | 'LXC';
  monthlyPriceIdr: number;
  createdAt: string;
}

export interface DockerContainerItem {
  id: string;
  name: string;
  image: string;
  portMapping: string;
  status: 'running' | 'stopped';
  cpuPercent: number;
  memoryMb: number;
  uptime: string;
  description: string;
}

const DEFAULT_SERVER_NODES: RemoteServerNode[] = [
  {
    id: 'node-master-01',
    name: 'Master Cloud PRO (Server Utama)',
    hostname: 'srv1.denbagoes.my.id',
    ipAddress: '103.175.218.14',
    sshPort: 22,
    location: 'Jakarta IIX, Indonesia',
    provider: 'Baremetal NVMe Enterprise',
    nodeRole: 'Master WHM + KVM',
    status: 'online',
    cpuCores: 16,
    cpuUsage: 24,
    ramTotalGb: 64,
    ramUsedGb: 18.4,
    diskTotalGb: 1000,
    diskUsedGb: 215,
    vpsContainersCount: 4,
    hostingAccountsCount: 12,
    latencyMs: 4,
    osName: 'Ubuntu 24.04.2 LTS (Kernel 6.8)'
  },
  {
    id: 'node-sg-02',
    name: 'SG-NVMe-02 (Node Hosting & Backup)',
    hostname: 'sg2.denbagoes.my.id',
    ipAddress: '159.223.68.90',
    sshPort: 22,
    location: 'Singapore (Equinix SG1)',
    provider: 'DigitalOcean / Vultr Cloud',
    nodeRole: 'Slave Hosting cPanel',
    status: 'online',
    cpuCores: 8,
    cpuUsage: 31,
    ramTotalGb: 32,
    ramUsedGb: 11.2,
    diskTotalGb: 500,
    diskUsedGb: 142,
    vpsContainersCount: 2,
    hostingAccountsCount: 28,
    latencyMs: 14,
    osName: 'Ubuntu 24.04 LTS + CloudPRO Agent'
  },
  {
    id: 'node-kvm-03',
    name: 'ID-KVM-Hypervisor-03 (Khusus Sewa VPS)',
    hostname: 'kvm3.denbagoes.my.id',
    ipAddress: '103.150.190.77',
    sshPort: 2222,
    location: 'Cyber 1 Jakarta, Indonesia',
    provider: 'Proxmox / Virtualizor KVM',
    nodeRole: 'KVM Hypervisor Node',
    status: 'online',
    cpuCores: 32,
    cpuUsage: 42,
    ramTotalGb: 128,
    ramUsedGb: 68.0,
    diskTotalGb: 2000,
    diskUsedGb: 840,
    vpsContainersCount: 14,
    hostingAccountsCount: 0,
    latencyMs: 6,
    osName: 'Debian 12 Bookworm (Proxmox VE 8.2)'
  }
];

const DEFAULT_CLIENT_VPS: ClientVpsInstance[] = [
  {
    id: 'vps-101',
    hostname: 'rdm.man1kota.sch.id',
    clientName: 'MAN 1 Kota (Server RDM & CBT)',
    clientEmail: 'operator@man1kota.sch.id',
    nodeId: 'node-kvm-03',
    nodeName: 'ID-KVM-Hypervisor-03',
    ipAddress: '103.150.190.101',
    osTemplate: 'Ubuntu 24.04 LTS + RDM/ionCube Ready',
    vcpu: 4,
    ramGb: 8,
    nvmeGb: 120,
    bandwidthTb: 4,
    bandwidthUsedGb: 420,
    status: 'running',
    virtualization: 'KVM',
    monthlyPriceIdr: 250000,
    createdAt: '2026-06-10'
  },
  {
    id: 'vps-102',
    hostname: 'siakad.mtsn2garut.sch.id',
    clientName: 'MTsN 2 (Server SIAKAD & E-Learning)',
    clientEmail: 'admin@mtsn2garut.sch.id',
    nodeId: 'node-master-01',
    nodeName: 'Master Cloud PRO',
    ipAddress: '103.175.218.55',
    osTemplate: 'Ubuntu 24.04 LTS + Cloud PRO Panel',
    vcpu: 2,
    ramGb: 4,
    nvmeGb: 80,
    bandwidthTb: 2,
    bandwidthUsedGb: 185,
    status: 'running',
    virtualization: 'KVM',
    monthlyPriceIdr: 150000,
    createdAt: '2026-07-18'
  },
  {
    id: 'vps-103',
    hostname: 'erp.ptmitraniaga.co.id',
    clientName: 'PT Mitra Niaga Digital',
    clientEmail: 'devops@ptmitraniaga.co.id',
    nodeId: 'node-sg-02',
    nodeName: 'SG-NVMe-02',
    ipAddress: '159.223.68.112',
    osTemplate: 'AlmaLinux 9 + Docker Engine',
    vcpu: 8,
    ramGb: 16,
    nvmeGb: 250,
    bandwidthTb: 8,
    bandwidthUsedGb: 910,
    status: 'running',
    virtualization: 'KVM',
    monthlyPriceIdr: 480000,
    createdAt: '2026-08-02'
  },
  {
    id: 'vps-104',
    hostname: 'bot-wa.tokoberkah.id',
    clientName: 'Toko Berkah Nusantara',
    clientEmail: 'owner@tokoberkah.id',
    nodeId: 'node-master-01',
    nodeName: 'Master Cloud PRO',
    ipAddress: '103.175.218.89',
    osTemplate: 'Debian 12 + Node.js 20 WA Gateway',
    vcpu: 2,
    ramGb: 2,
    nvmeGb: 40,
    bandwidthTb: 1,
    bandwidthUsedGb: 64,
    status: 'stopped',
    virtualization: 'LXC',
    monthlyPriceIdr: 95000,
    createdAt: '2026-09-01'
  }
];

const DEFAULT_DOCKER_CONTAINERS: DockerContainerItem[] = [
  {
    id: 'cnt-1',
    name: 'siakad-rdm-php81-ioncube',
    image: 'cloudpro/php81-ioncube-apache:latest',
    portMapping: '8081:80',
    status: 'running',
    cpuPercent: 4.2,
    memoryMb: 310,
    uptime: '18 hari 4 jam',
    description: 'Container terisolasi khusus RDM Kemenag & aplikasi terenkripsi ionCube Loader'
  },
  {
    id: 'cnt-2',
    name: 'whatsapp-gateway-baileys',
    image: 'node:20-alpine (WA Multi-Device API)',
    portMapping: '3005:3005',
    status: 'running',
    cpuPercent: 1.8,
    memoryMb: 145,
    uptime: '12 hari 9 jam',
    description: 'Server API notifikasi WhatsApp otomatis untuk tagihan hosting & absensi SIAKAD'
  },
  {
    id: 'cnt-3',
    name: 'redis-object-cache-cluster',
    image: 'redis:7.2-alpine',
    portMapping: '6379:6379',
    status: 'running',
    cpuPercent: 0.9,
    memoryMb: 88,
    uptime: '34 hari 11 jam',
    description: 'In-memory cache berkecepatan tinggi untuk akselerasi query database MySQL & sesi login'
  },
  {
    id: 'cnt-4',
    name: 'n8n-workflow-automation',
    image: 'n8nio/n8n:latest',
    portMapping: '5678:5678',
    status: 'stopped',
    cpuPercent: 0.0,
    memoryMb: 0,
    uptime: 'Berhenti',
    description: 'Otomasi webhook pembayaran QRIS, provisioning VPS otomatis, dan sinkronisasi data'
  }
];

const OS_TEMPLATES = [
  'Ubuntu 24.04 LTS + Cloud PRO Panel',
  'Ubuntu 24.04 LTS + RDM/ionCube Ready',
  'Ubuntu 22.04 LTS Clean Minimal',
  'Debian 12 Bookworm (KVM Tuned)',
  'AlmaLinux 9 + cPanel/CyberPanel Ready',
  'AlmaLinux 9 + Docker Engine',
  'Windows Server 2022 Datacenter (RDP)'
];

export const VpsClusterView: React.FC<VpsClusterViewProps> = ({
  currentUser,
  onShowToast,
  onOpenTerminal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'nodes' | 'instances' | 'docker_migration'>('nodes');

  // Nodes state
  const [nodes, setNodes] = useState<RemoteServerNode[]>(() => {
    try {
      const saved = localStorage.getItem('cloudpro_vps_nodes_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_SERVER_NODES;
  });

  // Client VPS Instances state
  const [vpsList, setVpsList] = useState<ClientVpsInstance[]>(() => {
    try {
      const saved = localStorage.getItem('cloudpro_client_vps_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_CLIENT_VPS;
  });

  // Docker containers state
  const [containers, setContainers] = useState<DockerContainerItem[]>(() => {
    try {
      const saved = localStorage.getItem('cloudpro_docker_containers_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_DOCKER_CONTAINERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cloudpro_vps_nodes_v1', JSON.stringify(nodes));
    } catch {
      // ignore
    }
  }, [nodes]);

  useEffect(() => {
    try {
      localStorage.setItem('cloudpro_client_vps_v1', JSON.stringify(vpsList));
    } catch {
      // ignore
    }
  }, [vpsList]);

  useEffect(() => {
    try {
      localStorage.setItem('cloudpro_docker_containers_v1', JSON.stringify(containers));
    } catch {
      // ignore
    }
  }, [containers]);

  // Add Node Modal state
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeHostname, setNewNodeHostname] = useState('');
  const [newNodeIp, setNewNodeIp] = useState('');
  const [newNodePort, setNewNodePort] = useState('22');
  const [newNodeLocation, setNewNodeLocation] = useState('Jakarta, Indonesia');
  const [newNodeProvider, setNewNodeProvider] = useState('KVM Cloud VPS');
  const [newNodeRole, setNewNodeRole] = useState<RemoteServerNode['nodeRole']>('Slave Hosting cPanel');
  const [testingNodeId, setTestingNodeId] = useState<string | null>(null);
  const [copiedAgentCmd, setCopiedAgentCmd] = useState(false);

  // Deploy New Client VPS Modal state
  const [isDeployVpsOpen, setIsDeployVpsOpen] = useState(false);
  const [vpsHostname, setVpsHostname] = useState('');
  const [vpsClientName, setVpsClientName] = useState('');
  const [vpsClientEmail, setVpsClientEmail] = useState('');
  const [vpsNodeId, setVpsNodeId] = useState('node-kvm-03');
  const [vpsOs, setVpsOs] = useState(OS_TEMPLATES[0]);
  const [vpsPlan, setVpsPlan] = useState<'starter' | 'business' | 'enterprise'>('business');
  const [activeVncVps, setActiveVncVps] = useState<ClientVpsInstance | null>(null);
  const [rebuildingVpsId, setRebuildingVpsId] = useState<string | null>(null);

  // WHM Migration Wizard state
  const [sourceHost, setSourceHost] = useState('');
  const [sourceUser, setSourceUser] = useState('root');
  const [sourcePanelType, setSourcePanelType] = useState<'cpanel_whm' | 'cyberpanel' | 'aaPanel' | 'raw_vps'>('cpanel_whm');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);

  const agentInstallCommand = `cd /var/www/html/siakad && sudo git fetch origin main && sudo git reset --hard origin/main && sudo bash update.sh`;

  const handleCopyAgentCmd = () => {
    navigator.clipboard.writeText(agentInstallCommand);
    setCopiedAgentCmd(true);
    if (onShowToast) {
      onShowToast('Perintah koneksi & update agent VPS berhasil disalin!', 'success');
    }
    setTimeout(() => setCopiedAgentCmd(false), 2000);
  };

  const handleTestNodeConnection = (node: RemoteServerNode) => {
    setTestingNodeId(node.id);
    setTimeout(() => {
      setNodes(prev =>
        prev.map(n =>
          n.id === node.id
            ? { ...n, status: 'online', latencyMs: Math.max(2, Math.floor(Math.random() * 16)) }
            : n
        )
      );
      setTestingNodeId(null);
      if (onShowToast) {
        onShowToast(`Koneksi SSH & Agent ke ${node.name} (${node.ipAddress}:${node.sshPort}) Terhubung Normal!`, 'success');
      }
    }, 700);
  };

  const handleAddRemoteNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim() || !newNodeIp.trim()) return;

    const createdNode: RemoteServerNode = {
      id: `node-${Date.now()}`,
      name: newNodeName.trim(),
      hostname: newNodeHostname.trim() || `node-${nodes.length + 1}.denbagoes.my.id`,
      ipAddress: newNodeIp.trim(),
      sshPort: parseInt(newNodePort, 10) || 22,
      location: newNodeLocation.trim() || 'Indonesia',
      provider: newNodeProvider.trim() || 'Dedicated KVM Node',
      nodeRole: newNodeRole,
      status: 'online',
      cpuCores: 8,
      cpuUsage: 12,
      ramTotalGb: 32,
      ramUsedGb: 4.5,
      diskTotalGb: 500,
      diskUsedGb: 28,
      vpsContainersCount: 0,
      hostingAccountsCount: 0,
      latencyMs: 9,
      osName: 'Ubuntu 24.04 LTS + CloudPRO Bridge'
    };

    setNodes(prev => [createdNode, ...prev]);
    setIsAddNodeModalOpen(false);
    setNewNodeName('');
    setNewNodeHostname('');
    setNewNodeIp('');
    if (onShowToast) {
      onShowToast(`Server Node "${createdNode.name}" (${createdNode.ipAddress}) berhasil dihubungkan ke Cluster Cloud PRO!`, 'success');
    }
  };

  const handleDeleteNode = (node: RemoteServerNode) => {
    if (node.id === 'node-master-01') {
      if (onShowToast) onShowToast('Node Master Utama tidak dapat dihapus dari cluster.', 'warning');
      return;
    }
    setNodes(prev => prev.filter(n => n.id !== node.id));
    if (onShowToast) {
      onShowToast(`Node ${node.name} telah dilepas dari cluster manajemen.`, 'info');
    }
  };

  const handleToggleVpsPower = (vps: ClientVpsInstance, action: 'start' | 'stop' | 'reboot') => {
    if (action === 'reboot') {
      if (onShowToast) {
        onShowToast(`Merestart instance VPS ${vps.hostname} (${vps.ipAddress})...`, 'info');
      }
      setVpsList(prev => prev.map(item => (item.id === vps.id ? { ...item, status: 'running' } : item)));
      return;
    }
    const nextStatus = action === 'start' ? 'running' : 'stopped';
    setVpsList(prev => prev.map(item => (item.id === vps.id ? { ...item, status: nextStatus } : item)));
    if (onShowToast) {
      onShowToast(
        `VPS ${vps.hostname} (${vps.ipAddress}) berhasil di-${action === 'start' ? 'nyalakan (RUNNING)' : 'matikan (STOPPED)'}.`,
        'success'
      );
    }
  };

  const handleRebuildVpsOs = (vps: ClientVpsInstance) => {
    setRebuildingVpsId(vps.id);
    setVpsList(prev => prev.map(item => (item.id === vps.id ? { ...item, status: 'rebuilding' } : item)));
    setTimeout(() => {
      setVpsList(prev => prev.map(item => (item.id === vps.id ? { ...item, status: 'running' } : item)));
      setRebuildingVpsId(null);
      if (onShowToast) {
        onShowToast(`Instalasi ulang OS (${vps.osTemplate}) pada VPS ${vps.hostname} selesai!`, 'success');
      }
    }, 1200);
  };

  const handleDeployNewVps = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vpsHostname.trim() || !vpsClientName.trim()) return;

    const selectedNode = nodes.find(n => n.id === vpsNodeId) || nodes[0];
    const planSpecs = {
      starter: { vcpu: 2, ramGb: 2, nvmeGb: 40, bw: 1, price: 95000 },
      business: { vcpu: 4, ramGb: 8, nvmeGb: 120, bw: 4, price: 250000 },
      enterprise: { vcpu: 8, ramGb: 16, nvmeGb: 250, bw: 8, price: 480000 }
    }[vpsPlan];

    const randomOctet = Math.floor(115 + Math.random() * 130);
    const baseIpPrefix = selectedNode.ipAddress.split('.').slice(0, 3).join('.');

    const newVps: ClientVpsInstance = {
      id: `vps-${Date.now()}`,
      hostname: vpsHostname.trim().toLowerCase(),
      clientName: vpsClientName.trim(),
      clientEmail: vpsClientEmail.trim() || `admin@${vpsHostname.trim().toLowerCase()}`,
      nodeId: selectedNode.id,
      nodeName: selectedNode.name,
      ipAddress: `${baseIpPrefix}.${randomOctet}`,
      osTemplate: vpsOs,
      vcpu: planSpecs.vcpu,
      ramGb: planSpecs.ramGb,
      nvmeGb: planSpecs.nvmeGb,
      bandwidthTb: planSpecs.bw,
      bandwidthUsedGb: 1,
      status: 'running',
      virtualization: 'KVM',
      monthlyPriceIdr: planSpecs.price,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setVpsList(prev => [newVps, ...prev]);
    setIsDeployVpsOpen(false);
    setVpsHostname('');
    setVpsClientName('');
    setVpsClientEmail('');
    if (onShowToast) {
      onShowToast(`Instance VPS KVM "${newVps.hostname}" (${newVps.ipAddress}) berhasil di-deploy dan siap digunakan!`, 'success');
    }
  };

  const handleToggleContainer = (cnt: DockerContainerItem) => {
    const next = cnt.status === 'running' ? 'stopped' : 'running';
    setContainers(prev =>
      prev.map(c =>
        c.id === cnt.id
          ? {
              ...c,
              status: next,
              cpuPercent: next === 'running' ? 2.1 : 0,
              memoryMb: next === 'running' ? 180 : 0,
              uptime: next === 'running' ? 'Baru saja aktif' : 'Berhenti'
            }
          : c
      )
    );
    if (onShowToast) {
      onShowToast(`Docker Container "${cnt.name}" ${next === 'running' ? 'dijalankan' : 'dihentikan'}.`, 'success');
    }
  };

  const handleStartMigration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceHost.trim()) return;
    setIsMigrating(true);
    setMigrationProgress(25);
    setTimeout(() => setMigrationProgress(65), 500);
    setTimeout(() => setMigrationProgress(100), 1000);
    setTimeout(() => {
      setIsMigrating(false);
      setMigrationProgress(0);
      if (onShowToast) {
        onShowToast(`Migrasi akun & database dari ${sourceHost} ke Cloud PRO selesai tanpa downtime!`, 'success');
      }
      setSourceHost('');
    }, 1400);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Multi-VPS & Hosting Cluster Control */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Server className="w-4 h-4" />
              <span>ENTERPRISE MULTI-SERVER, KVM HYPERVISOR &amp; REMOTE VPS BRIDGE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Pusat Koneksi Multi-VPS, Proxmox/KVM &amp; Cluster Server Hosting
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Kelola banyak node server VPS (DigitalOcean, Vultr, Baremetal IIX, Proxmox KVM) sekaligus akun shared hosting dari satu panel induk terpusat. Cocok untuk pengusaha penyedia layanan VPS maupun Web Hosting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsAddNodeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Hubungkan Server / VPS Baru</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab('instances');
                setIsDeployVpsOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Cpu className="w-4 h-4" />
              <span>Deploy VPS Klien (KVM)</span>
            </button>
          </div>
        </div>

        {/* Cluster Summary Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Node Server Terhubung</div>
            <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5 tabular-nums">
              {nodes.length} Node Aktif
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">SSH &amp; CloudPRO Agent Ready</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Instance VPS Klien (KVM/LXC)</div>
            <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5 tabular-nums">
              {vpsList.length} Server VPS
            </div>
            <div className="text-[11px] text-sky-400 mt-0.5">
              {vpsList.filter(v => v.status === 'running').length} Menyala · Siap Sewa
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Total Kapasitas Cluster</div>
            <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5 tabular-nums">
              {nodes.reduce((acc, n) => acc + n.cpuCores, 0)} vCPU / {nodes.reduce((acc, n) => acc + n.ramTotalGb, 0)} GB
            </div>
            <div className="text-[11px] text-amber-400 mt-0.5">NVMe RAID-10 Storage</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Docker &amp; Migrasi WHM</div>
            <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5 tabular-nums">
              {containers.filter(c => c.status === 'running').length}/{containers.length} Container
            </div>
            <div className="text-[11px] text-indigo-400 mt-0.5">Rsync + cPanel Importer</div>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          onClick={() => setActiveSubTab('nodes')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'nodes'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>1. Koneksi Node Server &amp; Remote SSH ({nodes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('instances')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'instances'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>2. Manajemen Instance VPS Klien ({vpsList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('docker_migration')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'docker_migration'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>3. Docker Container &amp; Migrasi Antar-Server</span>
        </button>
      </div>

      {/* SUB-TAB 1: MULTI-NODE SERVER BRIDGE */}
      {activeSubTab === 'nodes' && (
        <div className="space-y-5">
          {/* Quick SSH Agent Command Box */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <KeyRound className="w-4 h-4" />
                <span>Perintah Sinkronisasi &amp; Koneksi Agent Server Ubuntu (`/var/www/html/siakad`)</span>
              </div>
              <p className="text-xs text-slate-300">
                Jalankan perintah satu baris ini di terminal SSH VPS Anda untuk menarik pembaruan panel, menginstal ionCube/cURL, dan menyinkronkan daemon:
              </p>
              <code className="block mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                {agentInstallCommand}
              </code>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyAgentCmd}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
              >
                {copiedAgentCmd ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAgentCmd ? 'Perintah Disalin!' : 'Salin Perintah SSH'}</span>
              </button>
              {onOpenTerminal && (
                <button
                  onClick={onOpenTerminal}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span>Buka Web Terminal</span>
                </button>
              )}
            </div>
          </div>

          {/* Connected Server Nodes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {nodes.map((node) => (
              <div
                key={node.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between space-y-4 hover:border-sky-500/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-semibold text-sky-400">
                        {node.nodeRole} · {node.location}
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">{node.name}</h3>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">
                        {node.hostname} ({node.ipAddress}:{node.sshPort})
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{node.latencyMs}ms</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    OS: <span className="text-slate-200 font-medium">{node.osName}</span> · Provider:{' '}
                    <span className="text-slate-200 font-medium">{node.provider}</span>
                  </div>

                  {/* Resource Progress Bars */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Beban CPU ({node.cpuCores} Cores)</span>
                        <span className="font-mono">{node.cpuUsage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{ width: `${node.cpuUsage}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Memori RAM ECC</span>
                        <span className="font-mono">
                          {node.ramUsedGb} / {node.ramTotalGb} GB
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.round((node.ramUsedGb / node.ramTotalGb) * 100))}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Penyimpanan NVMe</span>
                        <span className="font-mono">
                          {node.diskUsedGb} / {node.diskTotalGb} GB
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.round((node.diskUsedGb / node.diskTotalGb) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Node Footer Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400">
                    <strong className="text-white">{node.vpsContainersCount}</strong> VPS ·{' '}
                    <strong className="text-white">{node.hostingAccountsCount}</strong> Hosting
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTestNodeConnection(node)}
                      disabled={testingNodeId === node.id}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${testingNodeId === node.id ? 'animate-spin' : ''}`} />
                      <span>{testingNodeId === node.id ? 'Menguji...' : 'Tes SSH'}</span>
                    </button>

                    {node.id !== 'node-master-01' && (
                      <button
                        onClick={() => handleDeleteNode(node)}
                        title="Lepas Node dari Cluster"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CLIENT VPS INSTANCES (KVM / LXC) */}
      {activeSubTab === 'instances' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Daftar Instance VPS Klien (Virtualizor / Proxmox KVM Bridge)
                </h3>
                <p className="text-xs text-slate-400">
                  Kontrol penuh power VPS pelanggan (Start, Stop, Reboot, Rebuild OS 1-Klik, dan Konsol VNC).
                </p>
              </div>
              <button
                onClick={() => setIsDeployVpsOpen(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Deploy VPS Klien Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                    <th className="py-3 px-3">Hostname &amp; Klien</th>
                    <th className="py-3 px-3">IP Publik &amp; Node</th>
                    <th className="py-3 px-3">Sistem Operasi (OS)</th>
                    <th className="py-3 px-3">Spesifikasi KVM</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Kontrol Power &amp; OS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs">
                  {vpsList.map((vps) => (
                    <tr key={vps.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{vps.hostname}</div>
                        <div className="text-[11px] text-slate-400">
                          {vps.clientName} · {vps.clientEmail}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-semibold text-sky-400">{vps.ipAddress}</div>
                        <div className="text-[11px] text-slate-400">{vps.nodeName}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="text-slate-200 font-medium">{vps.osTemplate}</div>
                        <div className="text-[11px] text-slate-400">
                          Virtualisasi {vps.virtualization} · Rp {vps.monthlyPriceIdr.toLocaleString('id-ID')}/bln
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-300">
                        {vps.vcpu} vCPU · {vps.ramGb} GB RAM · {vps.nvmeGb} GB NVMe
                      </td>
                      <td className="py-3.5 px-3">
                        {vps.status === 'running' ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Running</span>
                          </span>
                        ) : vps.status === 'rebuilding' ? (
                          <span className="text-amber-400 font-bold flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Reinstalling OS...</span>
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                            <span>Stopped</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {vps.status === 'stopped' ? (
                            <button
                              onClick={() => handleToggleVpsPower(vps, 'start')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1"
                              title="Nyalakan VPS"
                            >
                              <Play className="w-3 h-3" />
                              <span>Start</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleVpsPower(vps, 'stop')}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1"
                              title="Matikan VPS"
                            >
                              <Square className="w-3 h-3" />
                              <span>Stop</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleVpsPower(vps, 'reboot')}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold flex items-center gap-1"
                            title="Reboot VPS"
                          >
                            <RotateCw className="w-3 h-3 text-sky-400" />
                            <span>Reboot</span>
                          </button>

                          <button
                            onClick={() => handleRebuildVpsOs(vps)}
                            disabled={rebuildingVpsId === vps.id}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] font-semibold"
                            title="Install Ulang OS"
                          >
                            Rebuild OS
                          </button>

                          <button
                            onClick={() => setActiveVncVps(vps)}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Monitor className="w-3 h-3" />
                            <span>VNC</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DOCKER ENGINE & SERVER MIGRATION */}
      {activeSubTab === 'docker_migration' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 7 cols: Docker Containers */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Manajer Docker Container Terisolasi</h3>
                <p className="text-xs text-slate-400">
                  Jalankan microservice, Redis, WhatsApp Gateway, atau container RDM tanpa bentrok port utama.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400">Docker Engine v26.1</span>
            </div>

            <div className="space-y-3">
              {containers.map((cnt) => (
                <div
                  key={cnt.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          cnt.status === 'running' ? 'bg-emerald-400' : 'bg-slate-500'
                        }`}
                      />
                      <span className="font-bold text-sm text-white">{cnt.name}</span>
                      <span className="text-[11px] font-mono text-sky-400">{cnt.portMapping}</span>
                    </div>
                    <div className="text-xs text-slate-400">{cnt.description}</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Image: {cnt.image} · CPU: {cnt.cpuPercent}% · RAM: {cnt.memoryMb} MB · Uptime: {cnt.uptime}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleContainer(cnt)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      cnt.status === 'running'
                        ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {cnt.status === 'running' ? 'Stop Container' : 'Start Container'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 cols: WHM / cPanel / VPS Full Migration Wizard */}
          <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase">
              <ArrowRightLeft className="w-4 h-4" />
              <span>WHM / cPanel / VPS Transfer Tool</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Migrasi Otomatis dari Server Lama ke Cloud PRO
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pindahkan akun hosting, seluruh berkas <code className="text-sky-300">public_html</code>, database MySQL, dan zona DNS dari cPanel/WHM, CyberPanel, aaPanel, atau VPS Ubuntu lama melalui protokol Rsync SSH.
            </p>

            <form onSubmit={handleStartMigration} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Panel Sumber / Jenis Server Asal
                </label>
                <select
                  value={sourcePanelType}
                  onChange={(e) => setSourcePanelType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="cpanel_whm">WHM / cPanel Full Backup (cpmove / SSH)</option>
                  <option value="cyberpanel">CyberPanel / OpenLiteSpeed Server</option>
                  <option value="aaPanel">aaPanel / Pagoda Linux Panel</option>
                  <option value="raw_vps">VPS Ubuntu / Debian Standar (Rsync /var/www)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  IP Publik atau Hostname Server Lama
                </label>
                <input
                  type="text"
                  required
                  value={sourceHost}
                  onChange={(e) => setSourceHost(e.target.value)}
                  placeholder="Contoh: 103.120.45.88 atau oldserver.domain.id"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username Root / Reseller SSH
                </label>
                <input
                  type="text"
                  value={sourceUser}
                  onChange={(e) => setSourceUser(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              {isMigrating && (
                <div className="p-3 rounded-xl bg-slate-950 border border-sky-500/40 space-y-1.5">
                  <div className="flex justify-between text-xs text-sky-300 font-semibold">
                    <span>Menyalin database &amp; virtual host...</span>
                    <span>{migrationProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all duration-300"
                      style={{ width: `${migrationProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isMigrating}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>{isMigrating ? 'Sedang Memindahkan Data...' : 'Mulai Migrasi Akun & Database'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD REMOTE SERVER NODE */}
      {isAddNodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Hubungkan Node VPS / Dedicated Server Baru</h3>
                <p className="text-xs text-slate-400">
                  Tambahkan server eksternal ke dalam Cluster Cloud PRO via SSH Bridge.
                </p>
              </div>
              <button
                onClick={() => setIsAddNodeModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRemoteNode} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Identitas Node Server</label>
                <input
                  type="text"
                  required
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  placeholder="Contoh: Node-04 Surabaya NVMe"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat IPv4 Publik</label>
                  <input
                    type="text"
                    required
                    value={newNodeIp}
                    onChange={(e) => setNewNodeIp(e.target.value)}
                    placeholder="103.xxx.xxx.xxx"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Port SSH</label>
                  <input
                    type="number"
                    value={newNodePort}
                    onChange={(e) => setNewNodePort(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hostname FQDN</label>
                  <input
                    type="text"
                    value={newNodeHostname}
                    onChange={(e) => setNewNodeHostname(e.target.value)}
                    placeholder="srv4.denbagoes.my.id"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Peran Node Cluster</label>
                  <select
                    value={newNodeRole}
                    onChange={(e) => setNewNodeRole(e.target.value as RemoteServerNode['nodeRole'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="Slave Hosting cPanel">Slave Hosting cPanel</option>
                    <option value="KVM Hypervisor Node">KVM Hypervisor Node (Sewa VPS)</option>
                    <option value="Master WHM + KVM">Master WHM + KVM</option>
                    <option value="DNS Cluster Node">DNS Cluster Nameserver</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lokasi Data Center</label>
                  <input
                    type="text"
                    value={newNodeLocation}
                    onChange={(e) => setNewNodeLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Provider / Hypervisor</label>
                  <input
                    type="text"
                    value={newNodeProvider}
                    onChange={(e) => setNewNodeProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddNodeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold"
                >
                  Hubungkan &amp; Sinkronkan Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DEPLOY NEW CLIENT VPS INSTANCE */}
      {isDeployVpsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Deploy Instance VPS Klien Baru (KVM)</h3>
                <p className="text-xs text-slate-400">
                  Provisioning otomatis mesin virtual untuk penyewaan VPS atau aplikasi sekolah/instansi.
                </p>
              </div>
              <button
                onClick={() => setIsDeployVpsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeployNewVps} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hostname VPS Klien</label>
                <input
                  type="text"
                  required
                  value={vpsHostname}
                  onChange={(e) => setVpsHostname(e.target.value)}
                  placeholder="Contoh: vps1.pelanggan.id atau cbt.madrasah.sch.id"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Pelanggan / Instansi</label>
                  <input
                    type="text"
                    required
                    value={vpsClientName}
                    onChange={(e) => setVpsClientName(e.target.value)}
                    placeholder="Contoh: MTsN 1 Bekasi"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Klien</label>
                  <input
                    type="email"
                    value={vpsClientEmail}
                    onChange={(e) => setVpsClientEmail(e.target.value)}
                    placeholder="admin@madrasah.sch.id"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pilih Node Hypervisor</label>
                  <select
                    value={vpsNodeId}
                    onChange={(e) => setVpsNodeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.ipAddress})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Template Image OS</label>
                  <select
                    value={vpsOs}
                    onChange={(e) => setVpsOs(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    {OS_TEMPLATES.map(tpl => (
                      <option key={tpl} value={tpl}>
                        {tpl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Paket Spesifikasi的资源 (vCPU / RAM / NVMe)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVpsPlan('starter')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      vpsPlan === 'starter'
                        ? 'bg-sky-600/20 border-sky-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold">Starter KVM</div>
                    <div className="text-[10px] mt-0.5">2 vCPU · 2GB RAM</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Rp 95.000/bln</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVpsPlan('business')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      vpsPlan === 'business'
                        ? 'bg-sky-600/20 border-sky-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold">Pro RDM/SIAKAD</div>
                    <div className="text-[10px] mt-0.5">4 vCPU · 8GB RAM</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Rp 250.000/bln</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVpsPlan('enterprise')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      vpsPlan === 'enterprise'
                        ? 'bg-sky-600/20 border-sky-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold">Dedicated KVM</div>
                    <div className="text-[10px] mt-0.5">8 vCPU · 16GB RAM</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Rp 480.000/bln</div>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDeployVpsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Provisioning VPS Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: HTML5 noVNC CONSOLE PREVIEW */}
      {activeVncVps && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">
                  HTML5 noVNC KVM Console — {activeVncVps.hostname} ({activeVncVps.ipAddress})
                </span>
              </div>
              <button
                onClick={() => setActiveVncVps(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 bg-black font-mono text-xs text-emerald-400 space-y-1.5 min-h-[240px]">
              <div>Ubuntu 24.04.2 LTS {activeVncVps.hostname} tty1</div>
              <div>Kernel 6.8.0-45-generic on an x86_64 ({activeVncVps.vcpu} vCPU / {activeVncVps.ramGb}GB RAM)</div>
              <div className="text-slate-400">Cloud PRO KVM Hypervisor Bridge — Direct VNC Display :0</div>
              <div className="pt-2 text-white">
                root@{activeVncVps.hostname.split('.')[0]}:~# systemctl status nginx php8.3-fpm mariadb
              </div>
              <div className="text-emerald-300">
                ● nginx.service - High Performance Web Server (active running)
              </div>
              <div className="text-emerald-300">
                ● php8.3-fpm.service - The PHP 8.3 FastCGI Process Manager + ionCube v13.0.4 (active running)
              </div>
              <div className="text-emerald-300">
                ● mariadb.service - MariaDB 10.11.8 Database Server (active running)
              </div>
              <div className="pt-2 text-sky-300">
                root@{activeVncVps.hostname.split('.')[0]}:~# _
              </div>
            </div>

            <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Status: Terhubung ke Hypervisor {activeVncVps.nodeName}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleToggleVpsPower(activeVncVps, 'reboot');
                    setActiveVncVps(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold"
                >
                  Send Ctrl+Alt+Del (Reboot)
                </button>
                <button
                  onClick={() => setActiveVncVps(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold"
                >
                  Tutup Konsol
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
