import { useState, useEffect, useCallback } from 'react';
import api from '../../../shared/api/client';
import type { CuentaAlumno, AlumnoSearch } from '../types';

export function useTesoreriaCuenta() {
  const [searchAlumno, setSearchAlumno] = useState('');
  const [alumnosResults, setAlumnosResults] = useState<AlumnoSearch[]>([]);
  const [cuentaData, setCuentaData] = useState<CuentaAlumno | null>(null);
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<number | null>(null);

  // Search alumnos with debounce
  useEffect(() => {
    if (!searchAlumno || searchAlumno.length < 2) { setAlumnosResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/alumnos', { params: { search: searchAlumno, activo: true } });
        setAlumnosResults((data.data || []).slice(0, 10));
      } catch { setAlumnosResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchAlumno]);

  // Fetch cuenta alumno
  const fetchCuenta = useCallback(async (alumnoId: number) => {
    try {
      const { data } = await api.get(`/cuotas/cuenta/${alumnoId}`);
      setCuentaData(data.data);
    } catch { setCuentaData(null); }
  }, []);

  useEffect(() => { if (selectedAlumnoId) fetchCuenta(selectedAlumnoId); }, [selectedAlumnoId, fetchCuenta]);

  const selectAlumno = (id: number) => {
    setSelectedAlumnoId(id);
    setSearchAlumno('');
    setAlumnosResults([]);
  };

  const clearAlumno = () => {
    setSelectedAlumnoId(null);
    setCuentaData(null);
    setSearchAlumno('');
  };

  return {
    searchAlumno, setSearchAlumno,
    alumnosResults,
    cuentaData,
    selectedAlumnoId, setSelectedAlumnoId,
    selectAlumno, clearAlumno,
    fetchCuenta,
  };
}
