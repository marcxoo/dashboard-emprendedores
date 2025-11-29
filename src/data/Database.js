import { supabase } from '../lib/supabase';

export const STANDS = [
  { id: 1, name: "Stand 1", category: "Libre / Mixto" },
  { id: 2, name: "Stand 2", category: "Libre / Mixto" },
  { id: 3, name: "Stand 3", category: "Libre / Mixto" },
  { id: 4, name: "Stand 4", category: "Libre / Mixto" },
  { id: 5, name: "Stand 5", category: "Libre / Mixto" },
  { id: 6, name: "Stand 6", category: "Libre / Mixto" },
];

export class Database {
  constructor() {
    this.emprendedores = [];
    this.asignaciones = [];
    this.earnings = [];
  }

  async loadData() {
    try {
      const { data: entrepreneurs, error: empError } = await supabase
        .from('entrepreneurs')
        .select('*')
        .order('id', { ascending: true });

      if (empError) throw empError;
      this.emprendedores = entrepreneurs || [];

      const { data: assignments, error: assignError } = await supabase
        .from('assignments')
        .select('*');

      if (assignError) throw assignError;
      this.asignaciones = assignments || [];

      await this.loadEarnings();

      this.normalizeCategories();
      return true;
    } catch (error) {
      console.error('Error loading data:', error);
      return false;
    }
  }

  async loadEarnings() {
    try {
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      this.earnings = data || [];
    } catch (error) {
      console.error('Error loading earnings:', error);
      // Don't block main app load if earnings fail, just log it
      this.earnings = [];
    }
  }

  async addEarning(data) {
    const { data: inserted, error } = await supabase
      .from('earnings')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error adding earning:', error);
      return null;
    }

    this.earnings.unshift(inserted);
    return inserted;
  }

  async deleteEarning(id) {
    const { error } = await supabase
      .from('earnings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting earning:', error);
      return false;
    }

    this.earnings = this.earnings.filter(e => e.id !== id);
    return true;
  }

  normalizeString(str) {
    if (!str) return '';
    return str
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\s*[-–—]\s*/g, ' - ')
      .toUpperCase();
  }

  async normalizeCategories() {
    let changed = false;
    const updates = [];

    this.emprendedores = this.emprendedores.map(e => {
      const normalizedCat = this.normalizeString(e.categoria_principal);
      if (e.categoria_principal !== normalizedCat) {
        changed = true;
        const updatedEmp = {
          ...e,
          categoria_principal: normalizedCat,
          subcategoria_interna: normalizedCat
        };
        updates.push(this.updateEntrepreneur(e.id, updatedEmp));
        return updatedEmp;
      }
      return e;
    });

    if (changed) {
      await Promise.all(updates);
    }
  }

  async loadInitialData(csvContent) {
    // Check if data exists
    const { count, error } = await supabase
      .from('entrepreneurs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("Error checking count:", error);
      return;
    }

    if (count > 0) {
      console.log("Data already exists, skipping initial load.");
      return;
    }

    const lines = csvContent.split('\n');
    const uniqueEntrepreneurs = new Map();

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      if (trimmedLine.startsWith('Propietario,Nombre')) return;

      const cols = trimmedLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length < 5) return;

      const [propietario, nombreEmprendimiento, celular, actividad, email, rawCategoria] = cols;
      if (!propietario && !nombreEmprendimiento) return;

      let categoria = rawCategoria ? this.normalizeString(rawCategoria) : 'SIN CATEGORÍA';

      const emprendedor = {
        nombre_emprendimiento: nombreEmprendimiento || propietario,
        persona_contacto: propietario || nombreEmprendimiento,
        telefono: celular,
        correo: email,
        ciudad: null,
        actividad_economica: actividad,
        subcategoria_interna: categoria,
        categoria_principal: categoria,
        semaforizacion: null,
        veces_en_stand: 0,
        ultima_semana_participacion: null,
        notas: ''
      };

      if (this.isValidName(emprendedor.nombre_emprendimiento)) {
        const key = `${emprendedor.nombre_emprendimiento.toLowerCase()}|${(emprendedor.correo || '').toLowerCase()}`;
        if (!uniqueEntrepreneurs.has(key)) {
          uniqueEntrepreneurs.set(key, emprendedor);
        }
      }
    });

    const entrepreneursToInsert = Array.from(uniqueEntrepreneurs.values());

    if (entrepreneursToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('entrepreneurs')
        .insert(entrepreneursToInsert);

      if (insertError) console.error('Error inserting initial data:', insertError);
      else await this.loadData();
    }
  }

  isValidName(name) {
    if (!name) return false;
    if (name.length < 2) return false;
    if (/^\d/.test(name)) return false;
    if (name.toLowerCase() === 'si' || name.toLowerCase() === 'no') return false;
    if (name.includes('Registro Único') || name.includes('Celular')) return false;
    return true;
  }

  getEmprendedores() {
    return this.emprendedores;
  }

  async saveAssignment(assignment) {
    // Optimistic update
    this.asignaciones.push(assignment);

    const { error } = await supabase
      .from('assignments')
      .insert([assignment]);

    if (error) {
      console.error('Error saving assignment:', error);
      // Revert optimistic update? For now, we assume success or reload on error
    }

    // Update entrepreneur stats
    const empIndex = this.emprendedores.findIndex(e => e.id === assignment.id_emprendedor);
    if (empIndex >= 0) {
      const emp = this.emprendedores[empIndex];
      const newCount = (emp.veces_en_stand || 0) + 1;

      // Optimistic
      this.emprendedores[empIndex].veces_en_stand = newCount;
      this.emprendedores[empIndex].ultima_semana_participacion = assignment.semana;

      await supabase
        .from('entrepreneurs')
        .update({
          veces_en_stand: newCount,
          ultima_semana_participacion: assignment.semana
        })
        .eq('id', emp.id);
    }
  }

  async setManualAssignment(assignment) {
    // 1. Remove conflicting assignments
    const conflicting = this.asignaciones.filter(a =>
      a.id_stand === assignment.id_stand &&
      a.semana === assignment.semana &&
      a.bloque === assignment.bloque &&
      (
        assignment.jornada === 'completa' ||
        (assignment.jornada === 'manana' && (a.jornada === 'manana' || a.jornada === 'completa' || !a.jornada)) ||
        (assignment.jornada === 'tarde' && (a.jornada === 'tarde' || a.jornada === 'completa' || !a.jornada))
      )
    );

    for (const conflict of conflicting) {
      await this.deleteAssignment(conflict.id_asignacion);
    }

    // 2. Add new assignment
    const newAssignment = {
      id_asignacion: crypto.randomUUID(),
      ...assignment,
      jornada: assignment.jornada || 'completa',
      bloque: assignment.bloque || 'lunes-martes',
      asistio: null
    };

    await this.saveAssignment(newAssignment);
  }

  async removeAssignment(standId, week, jornada, bloque) {
    const assignment = this.asignaciones.find(a =>
      a.id_stand === standId &&
      a.semana === week &&
      a.bloque === bloque &&
      (a.jornada === jornada || (!a.jornada && jornada === 'completa'))
    );

    if (assignment) {
      await this.deleteAssignment(assignment.id_asignacion);
    }
  }

  async deleteAssignment(id) {
    const assignment = this.asignaciones.find(a => a.id_asignacion === id);
    if (!assignment) return false;

    // Optimistic remove
    this.asignaciones = this.asignaciones.filter(a => a.id_asignacion !== id);

    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id_asignacion', id);

    if (error) {
      console.error('Error deleting assignment:', error);
      return false;
    }

    // Decrement stats
    const empIndex = this.emprendedores.findIndex(e => e.id === assignment.id_emprendedor);
    if (empIndex >= 0) {
      const emp = this.emprendedores[empIndex];
      const newCount = Math.max(0, (emp.veces_en_stand || 0) - 1);

      this.emprendedores[empIndex].veces_en_stand = newCount;

      await supabase
        .from('entrepreneurs')
        .update({ veces_en_stand: newCount })
        .eq('id', emp.id);
    }
    return true;
  }

  async updateAssignmentStatus(id, status) {
    const index = this.asignaciones.findIndex(a => a.id_asignacion === id);
    if (index >= 0) {
      this.asignaciones[index].estado = status;
      await supabase
        .from('assignments')
        .update({ estado: status })
        .eq('id_asignacion', id);
    }
  }

  async updateAssignmentAttendance(id, attended, comments = '') {
    const index = this.asignaciones.findIndex(a => a.id_asignacion === id);
    if (index >= 0) {
      this.asignaciones[index].asistio = attended;
      this.asignaciones[index].comentarios = comments; // Optimistic update

      const updateData = { asistio: attended };
      if (comments !== undefined) updateData.comentarios = comments;

      await supabase
        .from('assignments')
        .update(updateData)
        .eq('id_asignacion', id);
      return true;
    }
    return false;
  }

  getAsignaciones(semana) {
    return this.asignaciones.filter(a => a.semana === semana);
  }

  async addEntrepreneur(data) {
    const newEntrepreneur = {
      nombre_emprendimiento: data.nombre_emprendimiento,
      persona_contacto: data.persona_contacto,
      telefono: data.telefono,
      correo: data.correo,
      ciudad: null,
      actividad_economica: data.actividad_economica || '',
      subcategoria_interna: data.categoria_principal,
      categoria_principal: data.categoria_principal,
      semaforizacion: null,
      veces_en_stand: 0,
      ultima_semana_participacion: null,
      notas: ''
    };

    const { data: inserted, error } = await supabase
      .from('entrepreneurs')
      .insert([newEntrepreneur])
      .select()
      .single();

    if (error) {
      console.error('Error adding entrepreneur:', error);
      return null;
    }

    this.emprendedores.push(inserted);
    return inserted;
  }

  async updateEntrepreneur(id, data) {
    const index = this.emprendedores.findIndex(e => e.id === id);
    if (index >= 0) {
      const updates = {
        nombre_emprendimiento: data.nombre_emprendimiento,
        persona_contacto: data.persona_contacto,
        telefono: data.telefono,
        correo: data.correo,
        categoria_principal: data.categoria_principal,
        actividad_economica: data.actividad_economica,
        subcategoria_interna: data.categoria_principal
      };

      this.emprendedores[index] = { ...this.emprendedores[index], ...updates };

      const { error } = await supabase
        .from('entrepreneurs')
        .update(updates)
        .eq('id', id);

      if (error) console.error('Error updating entrepreneur:', error);
      return this.emprendedores[index];
    }
    return null;
  }

  async deleteEntrepreneur(id) {
    const index = this.emprendedores.findIndex(e => e.id === id);
    if (index >= 0) {
      this.emprendedores.splice(index, 1);
      this.asignaciones = this.asignaciones.filter(a => a.id_emprendedor !== id);

      // Delete assignments first (foreign key constraint might handle this if cascade is set, but let's be safe)
      await supabase.from('assignments').delete().eq('id_emprendedor', id);

      const { error } = await supabase
        .from('entrepreneurs')
        .delete()
        .eq('id', id);

      return !error;
    }
    return false;
  }

  async clearWeekAssignments(week) {
    const assignmentsToRemove = this.asignaciones.filter(a => a.semana === week);

    for (const assignment of assignmentsToRemove) {
      await this.deleteAssignment(assignment.id_asignacion);
    }
  }

  async clearBlockAssignments(week, block) {
    const assignmentsToRemove = this.asignaciones.filter(a => a.semana === week && (a.bloque === block || (!a.bloque && block === 'lunes-martes')));

    for (const assignment of assignmentsToRemove) {
      await this.deleteAssignment(assignment.id_asignacion);
    }
  }

  async clearData() {
    this.asignaciones = [];
    this.emprendedores = this.emprendedores.map(e => ({
      ...e,
      veces_en_stand: 0,
      ultima_semana_participacion: null
    }));

    await supabase.from('assignments').delete().neq('id_asignacion', '0'); // Delete all
    await supabase.from('entrepreneurs').update({ veces_en_stand: 0, ultima_semana_participacion: null }).neq('id', 0);
  }
}
