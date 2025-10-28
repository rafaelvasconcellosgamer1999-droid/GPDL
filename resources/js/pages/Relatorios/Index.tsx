import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';
import GPDLLayout from '@/layouts/gpdl-layout';
import { Head } from '@inertiajs/react';

interface StatusData {
  abertos: number;
  pendentes_ciencia: number;
  vencidos: number;
  finalizados: number;
}

interface ProcuradorData {
  nome: string;
  total: number;
}

interface AssuntoData {
  assunto: string;
  total: number;
}

const TabelaInterativa = ({
  titulo,
  dados,
  onToggle,
  onSelectAll,
  maxHeight = 'auto'
}: {
  titulo: string;
  dados: Array<{name: string; value: number; color: string; selected: boolean; percentual: string}>;
  onToggle: (name: string) => void;
  onSelectAll: () => void;
  maxHeight?: string;
}) => (
  <div className="mt-4">
    <div className="flex justify-between items-center mb-3">
      <h4 className="text-sm font-medium text-[var(--text-muted)]">{titulo}</h4>
      <button 
        onClick={onSelectAll}
        className="text-xs text-[var(--brand-500)] hover:text-[var(--brand-600)]"
      >
        Mostrar todos
      </button>
    </div>
    
    <div className="overflow-x-auto" style={{ maxHeight }}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--gpdl-border)]">
            <th className="text-left pb-2 text-[var(--text-muted)] font-medium text-sm">Categoria</th>
            <th className="text-right pb-2 text-[var(--text-muted)] font-medium text-sm">Total</th>
            <th className="text-right pb-2 text-[var(--text-muted)] font-medium text-sm">%</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr 
              key={item.name}
              className={`border-b border-[var(--gpdl-border)] last:border-b-0 cursor-pointer transition-colors ${
                item.selected 
                  ? 'bg-[var(--surface-hover)]' 
                  : 'opacity-40'
              }`}
              onClick={() => onToggle(item.name)}
            >
              <td className="py-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-[var(--text-strong)] text-sm break-words">
                    {item.name}
                  </span>
                </div>
              </td>
              <td className="py-2 text-right text-[var(--text-strong)] font-medium text-sm whitespace-nowrap">
                {item.value}
              </td>
              <td className="py-2 text-right text-[var(--text-strong)] font-medium text-sm whitespace-nowrap">
                {item.percentual}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default function RelatoriosIndex() {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [procuradorData, setProcuradorData] = useState<ProcuradorData[]>([]);
  const [assuntoData, setAssuntoData] = useState<AssuntoData[]>([]);
  const [totalProcessos, setTotalProcessos] = useState<number>(0);
  
  // Estados para controle das seleções
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedProcuradores, setSelectedProcuradores] = useState<string[]>([]);
  const [selectedAssuntos, setSelectedAssuntos] = useState<string[]>([]);

  useEffect(() => {
    axios.get('/api/relatorios/status').then(r => setStatusData(r.data));
    axios.get('/api/relatorios/procurador').then(r => setProcuradorData(r.data));
    axios.get('/api/relatorios/assunto').then(r => setAssuntoData(r.data));
    axios.get('/api/relatorios/total').then(r => setTotalProcessos(r.data.total));
  }, []);

  // Dados para a tabela/legenda de STATUS
  const statusLegenda = [
    { 
      name: 'Aberto', 
      value: statusData?.abertos || 0, 
      color: '#3B82F6',
      selected: selectedStatus.length === 0 || selectedStatus.includes('Aberto')
    },
    { 
      name: 'Pendente de ciência', 
      value: statusData?.pendentes_ciencia || 0, 
      color: '#FACC15',
      selected: selectedStatus.length === 0 || selectedStatus.includes('Pendente de ciência')
    },
    { 
      name: 'Vencido', 
      value: statusData?.vencidos || 0, 
      color: '#EF4444',
      selected: selectedStatus.length === 0 || selectedStatus.includes('Vencido')
    },
    { 
      name: 'Finalizado', 
      value: statusData?.finalizados || 0, 
      color: '#22C55E',
      selected: selectedStatus.length === 0 || selectedStatus.includes('Finalizado')
    },
  ];

  const totalStatus = statusLegenda.reduce((sum, item) => sum + item.value, 0);
  const statusComPercentuais = statusLegenda.map(item => ({
    ...item,
    percentual: totalStatus > 0 ? ((item.value / totalStatus) * 100).toFixed(1) + '%' : '0.0%'
  }));

  // Dados para a tabela/legenda de PROCURADORES
  const procuradorPalette = ['#3B82F6', '#FACC15', '#22C55E', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
  const procuradoresLegenda = procuradorData.map((procurador, index) => ({
    name: procurador.nome,
    value: procurador.total,
    color: procuradorPalette[index % procuradorPalette.length],
    selected: selectedProcuradores.length === 0 || selectedProcuradores.includes(procurador.nome)
  }));

  const totalProcuradores = procuradoresLegenda.reduce((sum, item) => sum + item.value, 0);
  const procuradoresComPercentuais = procuradoresLegenda.map(item => ({
    ...item,
    percentual: totalProcuradores > 0 ? ((item.value / totalProcuradores) * 100).toFixed(1) + '%' : '0.0%'
  }));

  // Dados para a tabela/legenda de ASSUNTOS
  const assuntoPalette = ['#3B82F6', '#FACC15', '#22C55E', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
  const assuntosLegenda = assuntoData.map((assunto, index) => ({
    name: assunto.assunto,
    value: assunto.total,
    color: assuntoPalette[index % assuntoPalette.length],
    selected: selectedAssuntos.length === 0 || selectedAssuntos.includes(assunto.assunto)
  }));

  const totalAssuntos = assuntosLegenda.reduce((sum, item) => sum + item.value, 0);
  const assuntosComPercentuais = assuntosLegenda.map(item => ({
    ...item,
    percentual: totalAssuntos > 0 ? ((item.value / totalAssuntos) * 100).toFixed(1) + '%' : '0.0%'
  }));

  // Configuração dos gráficos SEM TEXTOS E NÚMEROS
  const chartStatus = statusData && {
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {c} ({d}%)' 
    },
    legend: { show: false },
    series: [
      {
        type: 'pie',
        radius: '70%',
        data: statusComPercentuais
          .filter(item => item.selected)
          .map(item => ({
            value: item.value,
            name: item.name,
            itemStyle: { color: item.color }
          })),
        label: {
          show: false,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    ],
  };

  const chartProcurador = {
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { type: 'shadow' } 
    },
    legend: { show: false },
    xAxis: {
      type: 'category',
      data: procuradoresComPercentuais
        .filter(item => item.selected)
        .map(item => item.name),
      axisLabel: { 
        color: 'var(--text-strong)',
        rotate: 45,
        show: false
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: { 
        color: 'var(--text-muted)',
        show: false
      },
      splitLine: { 
        lineStyle: { color: 'rgba(255,255,255,0.1)' },
        show: false
      },
    },
    series: [
      {
        data: procuradoresComPercentuais
          .filter(item => item.selected)
          .map(item => ({
            value: item.value,
            itemStyle: { color: item.color }
          })),
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
        },
        label: {
          show: false,
        },
      },
    ],
    grid: {
      left: '0%',
      right: '0%',
      top: '0%',
      bottom: '0%',
      containLabel: false
    }
  };

  const chartAssunto = {
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { type: 'shadow' } 
    },
    legend: { show: false },
    yAxis: {
      type: 'category',
      data: assuntosComPercentuais
        .filter(item => item.selected)
        .map(item => item.name),
      axisLabel: {
        color: 'var(--text-strong)',
        show: false
      },
    },
    xAxis: {
      type: 'value',
      axisLabel: { 
        color: 'var(--text-muted)',
        show: false
      },
      splitLine: { 
        lineStyle: { color: 'rgba(255,255,255,0.1)' },
        show: false
      },
    },
    series: [
      {
        data: assuntosComPercentuais
          .filter(item => item.selected)
          .map(item => ({
            value: item.value,
            itemStyle: { color: item.color }
          })),
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
        },
        label: {
          show: false,
        },
      },
    ],
    grid: {
      left: '0%',
      right: '0%',
      top: '0%',
      bottom: '0%',
      containLabel: false
    }
  };

  // Funções para toggle dos status
  const toggleStatus = (statusName: string) => {
    setSelectedStatus(prev => {
      if (prev.includes(statusName)) {
        return prev.filter(name => name !== statusName);
      } else {
        return [...prev, statusName];
      }
    });
  };

  const toggleProcurador = (procuradorName: string) => {
    setSelectedProcuradores(prev => {
      if (prev.includes(procuradorName)) {
        return prev.filter(name => name !== procuradorName);
      } else {
        return [...prev, procuradorName];
      }
    });
  };

  const toggleAssunto = (assuntoName: string) => {
    setSelectedAssuntos(prev => {
      if (prev.includes(assuntoName)) {
        return prev.filter(name => name !== assuntoName);
      } else {
        return [...prev, assuntoName];
      }
    });
  };

  // Funções para selecionar todos
  const selectAllStatus = () => setSelectedStatus([]);
  const selectAllProcuradores = () => setSelectedProcuradores([]);
  const selectAllAssuntos = () => setSelectedAssuntos([]);

  return (
    <GPDLLayout breadcrumbs={[{ title: 'Relatórios', href: '/relatorios' }]}>
      <Head title="Relatórios" />

      <div className="space-y-8">
        {/* ✅ Card de total de processos */}
        <div className="rounded-xl bg-[var(--surface-card)] border border-[var(--gpdl-border)] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-[var(--text-muted)] text-sm font-medium">Total de Processos</h2>
            <p className="text-5xl font-bold text-[var(--brand-500)]">{totalProcessos}</p>
            <p className="text-[var(--text-muted)] text-sm">em todo o sistema no período selecionado</p>
          </div>
        </div>

        {/* 🧩 Linha de gráficos superiores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico por status */}
          <div className="rounded-xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-[var(--text-strong)]">Processos por Status</h2>
            
            {chartStatus ? (
              <ReactECharts option={chartStatus} style={{ height: 300 }} />
            ) : (
              <p className="text-[var(--text-muted)] text-sm">Carregando dados...</p>
            )}

            <TabelaInterativa
              titulo="Processos por Status"
              dados={statusComPercentuais}
              onToggle={toggleStatus}
              onSelectAll={selectAllStatus}
            />
          </div>

          {/* Gráfico por procurador */}
          <div className="rounded-xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-[var(--text-strong)]">Processos por Procurador</h2>
            
            {procuradorData.length > 0 ? (
              <ReactECharts option={chartProcurador} style={{ height: 300 }} />
            ) : (
              <p className="text-[var(--text-muted)] text-sm">Carregando dados...</p>
            )}

            <TabelaInterativa
              titulo="Processos por Procurador"
              dados={procuradoresComPercentuais}
              onToggle={toggleProcurador}
              onSelectAll={selectAllProcuradores}
              maxHeight="200px"
            />
          </div>
        </div>

        {/* Gráfico por assunto */}
        <div className="rounded-xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-strong)]">Processos por Assunto</h2>
          
          {assuntoData.length > 0 ? (
            <ReactECharts option={chartAssunto} style={{ height: 400 }} />
          ) : (
            <p className="text-[var(--text-muted)] text-sm">Carregando dados...</p>
          )}

          <TabelaInterativa
            titulo="Processos por Assunto"
            dados={assuntosComPercentuais}
            onToggle={toggleAssunto}
            onSelectAll={selectAllAssuntos}
            maxHeight="250px"
          />
        </div>
      </div>
    </GPDLLayout>
  );
}
