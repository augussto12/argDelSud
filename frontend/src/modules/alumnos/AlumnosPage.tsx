import { useEffect, useState } from 'react';
import api from '../../shared/api/client';
import type { Alumno, ApiResponse } from '../../shared/types';
import { Plus, Search, Pencil, Ban, Users } from 'lucide-react';
import Spinner from '../../shared/components/Spinner';
import TableLoader from '../../shared/components/TableLoader';
import TablePagination from '../../shared/components/TablePagination';
import { useToastStore } from '../../shared/hooks/useToastStore';
import AlumnoFormModal from './components/AlumnoFormModal';

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);

  const fetchAlumnos = async () => {
    setLoading(true);
    try {
      const params: any = { activo: 'true' };
      if (search) params.search = search;
      const res = await api.get<ApiResponse<Alumno[]>>('/alumnos', { params });
      setAlumnos(res.data?.data ?? []);
    } catch (_e) { setAlumnos([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); fetchAlumnos(); }, [search]);

  const paginatedAlumnos = alumnos.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Desactivar este alumno?')) return;
    try {
      await api.delete(`/alumnos/${id}`);
      useToastStore.getState().success('Alumno desactivado');
      fetchAlumnos();
    } catch {
      useToastStore.getState().error('Error al desactivar alumno');
    }
  };

  return (
    <div className="animate-slideUp space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Alumnos</h1>
          <p className="text-sm text-muted mt-0.5">Gestión de alumnos del club</p>
        </div>
        <button onClick={() => { setEditingAlumno(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-600 hover:to-accent-500 text-white font-semibold rounded-xl shadow-lg shadow-accent-500/20 transition-all hover:-translate-y-0.5 cursor-pointer text-sm">
          <Plus size={16} /> Nuevo Alumno
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" />
        <input type="text" placeholder="Buscar por nombre, apellido o DNI..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-input border-input text-sm text-heading placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-400 transition-colors" />
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <Spinner text="Cargando alumnos..." />
        ) : alumnos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <Users size={32} className="mb-2 text-secondary-200" />
            <p>No se encontraron alumnos</p>
          </div>
        ) : (
          paginatedAlumnos.map((a) => (
            <div key={a.id} className="bg-card border border-card rounded-xl p-4 space-y-2 animate-fadeIn">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-heading truncate">{a.apellido}, {a.nombre}</p>
                  <code className="text-xs bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded-md">DNI: {a.dni}</code>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditingAlumno(a); setShowForm(true); }}
                    className="tap-target rounded-lg text-accent-400 hover:bg-accent-50 transition-colors cursor-pointer" title="Editar">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(a.id)}
                    className="tap-target rounded-lg text-danger-400 hover:bg-danger-50 transition-colors cursor-pointer" title="Desactivar">
                    <Ban size={18} />
                  </button>
                </div>
              </div>
              {a.telefono && <p className="text-sm text-body">📞 {a.telefono}</p>}
              {a.inscripciones?.filter(i => i.activa).length! > 0 && (
                <div className="flex flex-wrap gap-1">
                  {a.inscripciones?.filter(i => i.activa).map(i => (
                    <span key={i.id} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-50 text-accent-500">
                      {i.taller?.nombre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card border border-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-card">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Apellido</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">DNI</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted hidden lg:table-cell">Teléfono</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted hidden lg:table-cell">Talleres</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableLoader colSpan={6} text="Cargando alumnos..." />
              ) : alumnos.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-muted">
                  <Users size={32} className="inline-block mb-2 text-secondary-200" /><br />No se encontraron alumnos
                </td></tr>
              ) : (
                paginatedAlumnos.map((a) => (
                  <tr key={a.id} className="border-b border-card hover-row transition-colors">
                    <td className="px-4 py-3 font-semibold text-heading">{a.apellido}</td>
                    <td className="px-4 py-3 text-body">{a.nombre}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded-md">{a.dni}</code>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-body">{a.telefono || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {a.inscripciones?.filter(i => i.activa).map(i => (
                          <span key={i.id} className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-50 text-accent-500">
                            {i.taller?.nombre}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditingAlumno(a); setShowForm(true); }}
                          className="tap-target rounded-lg text-accent-400 hover:bg-accent-50 transition-colors cursor-pointer" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(a.id)}
                          className="tap-target rounded-lg text-danger-400 hover:bg-danger-50 transition-colors cursor-pointer" title="Desactivar">
                          <Ban size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card border border-card rounded-xl overflow-hidden mt-3">
        <TablePagination
          currentPage={page}
          totalItems={alumnos.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {showForm && <AlumnoFormModal alumno={editingAlumno} onClose={() => setShowForm(false)} onSaved={fetchAlumnos} />}
    </div>
  );
}
