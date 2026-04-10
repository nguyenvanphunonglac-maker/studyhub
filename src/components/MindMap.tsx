"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAuth } from "@/context/AuthContext";
import { mindmapService, MindMapData } from "@/services/mindmapService";
import { Plus, Save, Trash2, ArrowLeft, Maximize2, MousePointer2, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import PageShell from "./PageShell";

export default function MindMap() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [maps, setMaps] = useState<MindMapData[]>([]);
  const [activeMap, setActiveMap] = useState<MindMapData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = mindmapService.subscribeToMindMaps(user.uid, setMaps);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (activeMap) {
      setNodes(activeMap.nodes || []);
      setEdges(activeMap.edges || []);
    }
  }, [activeMap, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleCreate = async () => {
    if (!user || !newTitle.trim()) return;
    const id = await mindmapService.createMindMap(user.uid, newTitle);
    setNewTitle("");
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!user || !activeMap) return;
    await mindmapService.updateMindMap(user.uid, activeMap.id!, {
      nodes,
      edges
    });
    alert("Đã lưu sơ đồ!");
  };

  const addNode = useCallback(() => {
    const id = `${nodes.length + 1}`;
    const newNode: Node = {
      id,
      data: { label: `Ý tưởng ${id}` },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      style: { 
        background: '#fff', 
        color: '#2D2A26', 
        borderRadius: '16px', 
        padding: '15px',
        border: '2px solid #2D2A26',
        fontWeight: 'bold',
        minWidth: '150px',
        textAlign: 'center'
      }
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes]);

  const handleDeleteMap = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !confirm(t('delete_confirm'))) return;
    await mindmapService.deleteMindMap(user.uid, id);
    if (activeMap?.id === id) setActiveMap(null);
  };

  if (activeMap) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-background animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute top-8 left-8 z-10 flex items-center gap-4">
          <button 
            onClick={() => setActiveMap(null)}
            className="w-12 h-12 bg-card border border-border-notion rounded-2xl flex items-center justify-center hover:bg-active-notion transition-all shadow-soft"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="bg-card border border-border-notion px-6 py-3 rounded-2xl shadow-soft">
             <h2 className="font-black text-accent text-sm uppercase tracking-widest">{activeMap.title}</h2>
          </div>
        </div>

        <div className="absolute top-8 right-8 z-10 flex items-center gap-3">
          <button 
            onClick={addNode}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-background rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-accent/20 hover:scale-105 transition-all"
          >
            <Plus size={16} /> Thêm ý tưởng
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-card border border-border-notion text-accent rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-soft hover:bg-active-notion transition-all"
          >
            <Save size={16} /> Lưu sơ đồ
          </button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          colorMode="light"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2D2A2610" />
          <Controls className="!bg-card !border-border-notion !shadow-soft !rounded-xl overflow-hidden" />
          <Panel position="bottom-center" className="bg-card/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-border-notion mb-8 flex gap-8">
             <div className="flex items-center gap-2 text-foreground/40 text-[10px] font-black uppercase tracking-widest">
                <MousePointer2 size={12} /> Kéo thả nút
             </div>
             <div className="flex items-center gap-2 text-foreground/40 text-[10px] font-black uppercase tracking-widest">
                <Maximize2 size={12} /> Cuộn để thu phóng
             </div>
             <div className="flex items-center gap-2 text-foreground/40 text-[10px] font-black uppercase tracking-widest">
                <Type size={12} /> Nhấn đúp để sửa chữ
             </div>
          </Panel>
        </ReactFlow>
      </div>
    );
  }

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
