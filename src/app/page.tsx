'use client';

import { useState, useEffect } from 'react';
import { FileText, Lightbulb, Code, BookOpen, Copy, Play, RotateCcw, Trash2, Github, HelpCircle, Sparkles, Info } from 'lucide-react';
import { AIProvider } from '@/context/AIContext';
import JsonInputSection from '@/components/JsonInputSection';
import FieldExplanationSection from '@/components/FieldExplanationSection';
import StructureSummarySection from '@/components/StructureSummarySection';
import TypeScriptSection from '@/components/TypeScriptSection';
import DocumentationSection from '@/components/DocumentationSection';

export default function Home() {
  const [activeTab, setActiveTab] = useState('formatted');
  const [jsonInput, setJsonInput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 确保组件在客户端完全挂载后再渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

  const tabs = [
    { id: 'formatted', label: '格式化展示', icon: FileText },
    { id: 'explanation', label: '字段解释', icon: Lightbulb },
    { id: 'summary', label: '结构总结', icon: BookOpen },
    { id: 'typescript', label: 'TypeScript', icon: Code },
    { id: 'documentation', label: '接口文档', icon: BookOpen },
  ];

  // 安全的JSON格式化函数
  const formatJsonSafely = (input: string) => {
    if (!input.trim()) {
      return <span className="text-gray-400">请在上方输入 JSON 数据...</span>;
    }
    
    try {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      return <span className="text-red-500">JSON 格式错误，请检查输入</span>;
    }
  };

  // 复制格式化结果的函数 - 只在客户端执行
  const copyFormattedJson = async () => {
    if (!isClient || !jsonInput.trim()) return;
    
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      
      // 检查是否支持 clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(formatted);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        // 降级方案：使用传统的复制方法
        const textArea = document.createElement('textarea');
        textArea.value = formatted;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 在客户端挂载之前显示加载状态
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">JsonInsight</h1>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <AIProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Enhanced Header with Navigation */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">JsonInsight</h1>
                </div>
                <div className="hidden md:flex items-center space-x-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  <span>由 Claude 3.5 提供支持</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <HelpCircle className="w-4 h-4 mr-1" />
                  使用帮助
                </button>
                <button className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </button>
              </div>
            </div>
            
            {/* Product Description */}
            <div className="text-center pb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                让程序员秒懂陌生 JSON 接口结构
              </h2>
              <p className="text-lg text-gray-600 mb-1">
                通过 AI 解析字段含义和结构语义，快速看懂接口内容
              </p>
              <p className="text-sm text-gray-500">
                支持复杂嵌套结构 • 智能字段解释 • 自动生成文档
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* JSON Input Section with Enhanced Card Design */}
          <div className="mb-8">
            <JsonInputSection 
              jsonInput={jsonInput}
              setJsonInput={setJsonInput}
            />
          </div>

          {/* Results Section with Enhanced Design */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Enhanced Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-3 transition-all duration-200 cursor-pointer ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-700 bg-white shadow-sm font-semibold'
                          : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-blue-600' : ''}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content with Better Spacing */}
            <div className="p-8">
              {activeTab === 'formatted' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">JSON 格式化展示</h3>
                      <p className="text-sm text-gray-600 mt-1">标准化的 JSON 格式，便于阅读和理解</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={copyFormattedJson}
                        className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                          copySuccess 
                            ? 'border-green-300 text-green-700 bg-green-50' 
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {copySuccess ? '已复制!' : '复制格式化结果'}
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    <div className="max-h-[500px] min-h-[300px] overflow-y-auto overflow-x-auto p-6">
                      <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words min-w-0">
                        {formatJsonSafely(jsonInput)}
                      </pre>
                    </div>
                    {/* 滚动提示 */}
                    {jsonInput.trim() && jsonInput.length > 1000 && (
                      <div className="bg-blue-50 border-t border-blue-200 px-6 py-2">
                        <p className="text-xs text-blue-600 flex items-center">
                          <Info className="w-3 h-3 mr-1" />
                          内容较长，可上下滚动查看完整 JSON 结构
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'explanation' && <FieldExplanationSection />}
              {activeTab === 'summary' && <StructureSummarySection />}
              {activeTab === 'typescript' && <TypeScriptSection />}
              {activeTab === 'documentation' && <DocumentationSection />}
            </div>
          </div>
        </main>

        {/* Enhanced Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">JsonInsight</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                让程序员秒懂陌生 JSON 接口结构的 AI 工具
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <span>© 2024 JsonInsight</span>
                <span>•</span>
                <span>由 Claude 3.5 提供支持</span>
                <span>•</span>
                <a href="#" className="hover:text-gray-700 transition-colors">隐私政策</a>
                <span>•</span>
                <a href="#" className="hover:text-gray-700 transition-colors">使用条款</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AIProvider>
  );
}
