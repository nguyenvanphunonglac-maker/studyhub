"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  BackgroundVariant,
  NodeProps,
  Handle,
  Position,
  NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAuth } from "@/context/AuthContext";
import { mindmapService, MindMapData } from "@/services/mindmapService";
import { Plus, Save, Trash2, ArrowLeft, Maximize2, MousePointer2, Pencil, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import PageShell from "../layout/PageShell";

// ── Custom Node ────────────────────────────────────────────────────────────────
function MindMapNode({ data, selected }: NodeProps) {
  return (
    <div
      style={{
        background: data.isRoot ? '#2D2A26' : '#ffffff',
        color: data.isRoot ? '#ffffff' : '#2D2A26',
        borderRadius: '14px',
        padding: '10px 18px',
        border: selected ? '2.5px solid #6366f1' : '2px solid #2D2A26',
        fontWeight: 700,
        minWidth: '110px',
        textAlign: 'center',
        boxShadow: selected ? '0 0 0 4px rgba(99,102,241,0.15)' : '0 2px 8px rgba(0,0,0,0.08)',
        fontSize: '14px',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'box-shadow 0.15s',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0, width: 8, height: 8 }} />
      <span>{String(data.label ?? '')}</span>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes = { mindmap: MindMapNode };

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MindMap() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [maps, setMaps] = useState<MindMapData[]>([]);
  const [activeMap, setActiveMap] = useState<MindMapData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Node context menu state
  const [menu, setMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  // Edit modal state
  const [editModal, setEditModal] = useState<{ nodeId: string; label: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = mindmapService.subscribeToMindMaps(user.uid, setMaps);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (activeMap) {
      const nodesWithType = (activeMap.nodes || []).map((n: Node) => ({
        ...n,
        type: 'mindmap',
      }));
      setNodes(nodesWithType);
      setEdges(activeMap.edges || []);
    }
    setMenu(null);
  }, [activeMap?.id]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Click on node → show popup menu
  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    event.stopPropagation();
    const rect = (event.target as HTMLElement).closest('.react-flow__node')?.getBoundingClientRect();
    if (rect) {
      setMenu({ nodeId: node.id, x: rect.left + rect.width / 2, y: rect.bottom + 8 });
    }
  }, []);

  // Click on canvas → close menu
  const onPaneClick = useCallback(() => setMenu(null), []);

  const handleEditNode = () => {
    if (!menu) return;
    const node = nodes.find(n => n.id === menu.nodeId);
    if (node) setEditModal({ nodeId: node.id, label: String(node.data.label ?? '') });
    setMenu(null);
  };

  const handleDeleteNode = () => {
    if (!menu) return;
    setNodes(nds => nds.filter(n => n.id !== menu.nodeId));
    setEdges(eds => eds.filter(e => e.source !== menu.nodeId && e.target !== menu.nodeId));
    setMenu(null);
  };

  const handleConfirmEdit = () => {
    if (!editModal) return;
    setNodes(nds => nds.map(n =>
      n.id === editModal.nodeId
        ? { ...n, data: { ...n.data, label: editModal.label } }
        : n
    ));
    setEditModal(null);
  };

  const handleCreate = async () => {
    if (!user || !newTitle.trim()) return;
    await mindmapService.createMindMap(user.uid, newTitle);
    setNewTitle("");
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!user || !activeMap) return;
    // Strip callbacks before saving
    const cleanNodes = nodes.map(n => ({
      id: n.id,
      type: n.type,
      data: { label: n.data.label, isRoot: n.data.isRoot },
      position: n.position,
    }));
    await mindmapService.updateMindMap(user.uid, activeMap.id!, { nodes: cleanNodes, edges });
    alert("Đã lưu sơ đồ!");
  };

  const addNode = useCallback(() => {
    const id = `node-${Date.now()}`;
    setNodes(nds => nds.concat({
      id,
      type: 'mindmap',
      data: { label: 'Ý tưởng mới', isRoot: false },
      position: { x: 80 + Math.random() * 350, y: 80 + Math.random() * 300 },
    }));
  }, [setNodes]);

  const handleDeleteMap = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !confirm(t('delete_confirm'))) return;
    await mindmapService.deleteMindMap(user.uid, id);
    if (activeMap?.id === id) setActiveMap(null);
  };

  // ── Editor view ──────────────────────────────────────────────────────────────
  if (activeMap) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-background">
        {/* Toolbar */}
        <div className="flex-shrink-0 flex items-center justify-between gap-2 px-3 py-2.5 bg-card/90 backdrop-blur-md border-b border-border-notion">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setActiveMap(null)}
              className="flex-shrink-0 w-9 h-9 bg-active-notion border border-border-notion rounded-xl flex items-center justify-center hover:bg-error/10 hover:text-error transition-all"
            >
              <ArrowLeft size={17} />
            </button>
            <span className="font-black text-accent text-sm truncate max-w-[130px] sm:max-w-sm">
              {activeMap.title}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={addNode}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-accent text-background rounded-xl font-black uppercase text-[10px] tracking-widest hover:opacity-90 transition-all"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Thêm node</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-card border border-border-notion text-accent rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-active-notion transition-all"
            >
              <Save size={14} />
              <span className="hidden sm:inline">Lưu</span>
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative" onClick={() => setMenu(null)}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            colorMode="light"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2D2A2610" />
            <Controls className="!bg-card !border-border-notion !rounded-xl overflow-hidden" />
            <Panel position="bottom-center" className="bg-card/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-border-notion mb-3 flex flex-wrap justify-center gap-4">
              <span className="flex items-center gap-1.5 text-foreground/30 text-[10px] font-bold uppercase tracking-widest">
                <MousePointer2 size={11} /> Click để chọn
              </span>
              <span className="flex items-center gap-1.5 text-foreground/30 text-[10px] font-bold uppercase tracking-widest">
                <Pencil size={11} /> Click node → Sửa / Xóa
              </span>
              <span className="flex items-center gap-1.5 text-foreground/30 text-[10px] font-bold uppercase tracking-widest">
                <Maximize2 size={11} /> Cuộn để thu phóng
              </span>
            </Panel>
          </ReactFlow>

          {/* Node context popup */}
          <AnimatePresence>
            {menu && (
              <motion.div
                key="node-menu"
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.12 }}
                className="fixed z-[100] flex gap-1.5 bg-card border border-border-notion rounded-2xl shadow-2xl p-1.5"
                style={{ left: menu.x, top: menu.y, transform: 'translateX(-50%)' }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={handleEditNode}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-accent hover:bg-accent hover:text-background transition-all"
                >
                  <Pencil size={13} /> Sửa
                </button>
                <button
                  onClick={handleDeleteNode}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-error hover:bg-error hover:text-background transition-all"
                >
                  <Trash2 size={13} /> Xóa
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Edit label modal */}
        <AnimatePresence>
          {editModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4"
              onClick={() => setEditModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-card border border-border-notion rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-accent">Sửa nội dung</h3>
                  <button onClick={() => setEditModal(null)} className="p-1.5 hover:bg-active-notion rounded-lg transition-colors">
                    <X size={16} className="text-foreground/40" />
                  </button>
                </div>
                <input
                  autoFocus
                  value={editModal.label}
                  onChange={e => setEditModal(m => m ? { ...m, label: e.target.value } : m)}
                  onKeyDown={e => { if (e.key === 'Enter') handleConfirmEdit(); }}
                  className="w-full px-4 py-3 bg-active-notion/40 border border-border-notion rounded-xl text-sm font-bold text-accent outline-none focus:ring-2 focus:ring-accent/20 mb-4"
                  placeholder="Nhập nội dung..."
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm font-bold text-foreground/40 hover:text-accent transition-colors">Hủy</button>
                  <button onClick={handleConfirmEdit} className="px-5 py-2 bg-accent text-background rounded-xl text-sm font-bold hover:opacity-90 transition-all">Lưu</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <PageShell>
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 md:mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-accent font-black uppercase text-[10px] tracking-[0.3em] mb-4">
              💡 Sơ đồ tư duy
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-accent mb-4 tracking-tighter leading-tight">
              Bản đồ kiến thức <br /><span className="text-foreground/20">Trực quan hóa mọi suy nghĩ của bạn</span>
            </h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="w-full sm:w-auto p-4 sm:p-5 bg-accent text-background rounded-[24px] shadow-2xl hover:scale-105 transition-all flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {maps.map((map) => (
              <motion.div
                key={map.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setActiveMap(map)}
                className="bg-card border border-border-notion rounded-[40px] p-8 shadow-soft group hover:border-accent/10 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => handleDeleteMap(map.id!, e)}
                    className="p-3 bg-error/10 text-error rounded-2xl hover:bg-error hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="w-16 h-16 bg-active-notion rounded-[24px] flex items-center justify-center text-accent mb-8 group-hover:scale-110 transition-transform">
                  <Maximize2 size={24} />
                </div>
                <h3 className="text-xl font-black text-accent mb-2">{map.title}</h3>
                <p className="text-foreground/30 text-xs font-bold uppercase tracking-widest">
                  {map.nodes?.length || 0} ý tưởng • {map.edges?.length || 0} kết nối
                </p>
                <div className="mt-8 pt-8 border-t border-border-notion flex items-center gap-2 text-accent/20 group-hover:text-accent transition-colors font-black text-[10px] uppercase tracking-widest">
                  Mở sơ đồ <ArrowLeft size={12} className="rotate-180" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isCreating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border-2 border-dashed border-accent/20 rounded-[40px] p-8 flex flex-col justify-center gap-6"
            >
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
                placeholder="Tên sơ đồ mới..."
                className="bg-active-notion border-none rounded-2xl p-4 font-bold outline-none text-accent"
              />
              <div className="flex gap-2">
                <button onClick={() => setIsCreating(false)} className="flex-1 py-3 text-foreground/40 font-black uppercase text-[10px] tracking-widest">Hủy</button>
                <button onClick={handleCreate} className="flex-1 py-3 bg-accent text-background rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-accent/20">Tạo</button>
              </div>
            </motion.div>
          )}

          {maps.length === 0 && !isCreating && (
            <div className="col-span-full py-40 text-center bg-card border border-dashed border-border-notion rounded-[60px] opacity-20">
              <Maximize2 size={64} className="mx-auto mb-6" />
              <p className="font-black uppercase tracking-[0.2em] text-xs">Chưa có sơ đồ nào được tạo</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
