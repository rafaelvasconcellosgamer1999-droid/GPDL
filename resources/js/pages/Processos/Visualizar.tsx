// resources/js/Pages/Processos/Visualizar.tsx
import ProcessViewer from '@/components/ProcessViewer';
import GPDLLayout from '@/layouts/gpdl-layout'; // ajuste para seu layout real

export default function Visualizar({ initialProcesses }: any) {
  // se você enviou `initialProcesses` via controller, pode passá-los:
  // const initial = props.initialProcesses ?? undefined;
  // <ProcessViewer processes={initial} />

  return (
    <GPDLLayout>
       <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Visualizar Processos</h1>
      <ProcessViewer processes={initialProcesses} />
    </div>
    </GPDLLayout>
  );
}
