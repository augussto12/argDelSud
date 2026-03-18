import { useState, useEffect, useCallback } from 'react';
import api from '../../../shared/api/client';
import { useToastStore } from '../../../shared/hooks/useToastStore';
import { showConfirm } from '../../../shared/hooks/useConfirmStore';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  creado_at: string;
  rol: { id: number; nombre: string };
}

export interface Rol {
  id: number;
  nombre: string;
}

const EMPTY_FORM = { nombre: '', email: '', password: '', rol_id: '' };

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchUsuarios = useCallback(async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      const { data } = await api.get('/usuarios', { params });
      setUsuarios(data.data || []);
    } catch { setUsuarios([]); }
    finally { setLoadingPage(false); }
  }, [search]);

  useEffect(() => { setPage(1); fetchUsuarios(); }, [fetchUsuarios]);
  useEffect(() => { api.get('/usuarios/roles').then(r => setRoles(r.data.data || [])).catch(() => {}); }, []);

  const paginatedUsuarios = usuarios.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, rol_id: roles[0]?.id?.toString() || '' });
    setShowPassword(false);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (u: Usuario) => {
    setEditing(u);
    setForm({ nombre: u.nombre, email: u.email, password: '', rol_id: u.rol.id.toString() });
    setShowPassword(false);
    setFieldErrors({});
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    else if (form.nombre.trim().length < 2) errs.nombre = 'Mínimo 2 caracteres';
    if (!form.email.trim()) errs.email = 'El email es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Formato de email inválido';
    if (!editing && !form.password) errs.password = 'La contraseña es obligatoria';
    else if (form.password && form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (!form.rol_id) errs.rol_id = 'Seleccioná un rol';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      if (editing) {
        const payload: any = { nombre: form.nombre, email: form.email, rol_id: parseInt(form.rol_id) };
        if (form.password) payload.password = form.password;
        await api.put(`/usuarios/${editing.id}`, payload);
        useToastStore.getState().success('Usuario actualizado exitosamente');
      } else {
        await api.post('/usuarios', {
          nombre: form.nombre, email: form.email,
          password: form.password, rol_id: parseInt(form.rol_id),
        });
        useToastStore.getState().success('Usuario creado exitosamente');
      }
      setShowModal(false);
      fetchUsuarios();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        const srvErrs: Record<string, string> = {};
        data.errors.forEach((e: any) => { srvErrs[e.campo] = e.mensaje; });
        setFieldErrors(srvErrs);
      } else {
        const msg = data?.message;
        if (msg?.includes('email')) setFieldErrors({ email: 'Ya existe un usuario con ese email.' });
        else useToastStore.getState().error(msg || 'Error al guardar.');
      }
    } finally { setLoading(false); }
  };

  const handleDesactivar = async (id: number) => {
    const confirmed = await showConfirm({ title: 'Desactivar usuario', message: '¿Seguro que querés desactivar este usuario?', confirmText: 'Desactivar', variant: 'danger' });
    if (!confirmed) return;
    try {
      await api.delete(`/usuarios/${id}`);
      useToastStore.getState().success('Usuario desactivado');
      fetchUsuarios();
    } catch (err: any) {
      useToastStore.getState().error(err.response?.data?.message || 'Error al desactivar');
    }
  };

  return {
    usuarios, paginatedUsuarios, roles,
    search, setSearch,
    showModal, setShowModal,
    editing, form, setForm,
    showPassword, setShowPassword,
    loading, loadingPage, mensaje, setMensaje,
    fieldErrors, setFieldErrors,
    page, setPage, pageSize, setPageSize,
    openCreate, openEdit, handleSubmit, handleDesactivar,
  };
}
