import { supabase } from '../lib/supabase';
import { compareWeeks } from '../utils/dateUtils';

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
    this.asignaciones = [];
    this.earnings = [];
    this.customSurveys = [];
  }

  async loadData() {
    try {
      const { data: entrepreneurs, error: empError } = await supabase
        .from('entrepreneurs')
        .select('*')
        .order('id', { ascending: true });

      if (empError) throw empError;

      // Parse 'notas' to extract history or legacy notes
      this.emprendedores = (entrepreneurs || []).map(e => {
        let notes = e.notas || '';
        let history = [];
        let generalNotes = '';
        let noContesto = false;

        // Check if notes is a JSON string containing our structure
        if (notes.trim().startsWith('{') && notes.includes('"history":')) {
          try {
            const parsed = JSON.parse(notes);
            history = parsed.history || [];
            generalNotes = parsed.general_notes || '';
            // New: Extract RUC from notes if available
            if (parsed.ruc) {
              e.ruc = parsed.ruc;
            }
          } catch {
            // Fallback if parse fails
            generalNotes = notes;
          }
        } else {
          // Legacy format
          noContesto = notes.includes('{{NC}}');
          generalNotes = notes.replace('{{NC}}', '').trim();
        }

        return {
          ...e,
          no_contesto: noContesto, // Keep for legacy compatibility if needed
          notas: generalNotes,
          ...e,
          no_contesto: noContesto, // Keep for legacy compatibility if needed
          notas: generalNotes,
          followUpHistory: history,
          ruc: e.ruc || '' // Ensure top-level property
        };
      });

      const { data: assignments, error: assignError } = await supabase
        .from('assignments')
        .select('*');

      if (assignError) throw assignError;
      this.asignaciones = assignments || [];

      // Load Custom Surveys from Supabase
      const { data: surveys, error: surveyError } = await supabase
        .from('custom_surveys')
        .select('*, survey_responses(*)');

      if (surveyError) {
        console.error("Error loading surveys:", surveyError);
        this.customSurveys = [];
      } else {
        this.customSurveys = (surveys || []).map(s => ({
          ...s,
          createdAt: s.created_at, // Map DB column to frontend prop
          limit: s.response_limit, // Map DB column to frontend prop
          eventDate: s.event_date,
          eventTime: s.event_time,
          eventLocation: s.event_location,
          responses: s.survey_responses || [] // Map relation to frontend prop
        }));
      }

      // Recalculate stats based on confirmed assignments (asistio === true)
      // This ensures 'veces_en_stand' reflects actual participation, not just scheduling
      this.emprendedores = this.emprendedores.map(e => {
        const confirmedAssignments = this.asignaciones.filter(a =>
          a.id_emprendedor === e.id && a.asistio === true
        );

        // Sort to find latest week
        confirmedAssignments.sort((a, b) => compareWeeks(b.semana, a.semana));

        return {
          ...e,
          veces_en_stand: confirmedAssignments.length,
          ultima_semana_participacion: confirmedAssignments.length > 0 ? confirmedAssignments[0].semana : null
        };
      });

      await this.loadEarnings();

      this.normalizeCategories();
      return true;
    } catch (error) {
      console.error('Error loading data:', error);
      return false;
    }
  }

  // --- Custom Survey Methods (LocalStorage Mock) ---

  getCustomSurveys() {
    return this.customSurveys;
  }

  async addCustomSurvey(data) {
    const newId = crypto.randomUUID();
    const newSurvey = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      responses: []
    };

    // Optimistic update
    this.customSurveys.push(newSurvey);

    // Persist to Supabase
    const { error } = await supabase
      .from('custom_surveys')
      .insert([{
        id: newId,
        title: data.title,
        description: data.description,
        response_limit: data.limit,
        event_date: data.eventDate,
        event_time: data.eventTime,
        event_location: data.eventLocation,
        questions: data.questions,
        active: data.active ?? true
      }]);

    if (error) {
      console.error("Error creating survey:", error);
      // Revert optimistic update?
      this.customSurveys = this.customSurveys.filter(s => s.id !== newId);
      return null; // Or throw
    }

    return newSurvey;
  }

  async deleteCustomSurvey(id) {
    const original = [...this.customSurveys];
    this.customSurveys = this.customSurveys.filter(s => s.id !== id);

    const { error } = await supabase
      .from('custom_surveys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting survey:", error);
      this.customSurveys = original;
      return false;
    }
    return true;
  }

  async updateCustomSurvey(id, updates) {
    const index = this.customSurveys.findIndex(s => s.id === id);
    if (index === -1) return false;

    const original = this.customSurveys[index];
    this.customSurveys[index] = { ...original, ...updates };

    const dbUpdates = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.limit !== undefined) dbUpdates.response_limit = updates.limit;
    if (updates.eventDate !== undefined) dbUpdates.event_date = updates.eventDate;
    if (updates.eventTime !== undefined) dbUpdates.event_time = updates.eventTime;
    if (updates.eventLocation !== undefined) dbUpdates.event_location = updates.eventLocation;
    if (updates.questions !== undefined) dbUpdates.questions = updates.questions;
    if (updates.active !== undefined) dbUpdates.active = updates.active;

    const { error } = await supabase
      .from('custom_surveys')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error("Error updating survey:", error);
      this.customSurveys[index] = original;
      return false;
    }
    return true;
  }

  async addSurveyResponse(surveyId, responseData) {
    const surveyIndex = this.customSurveys.findIndex(s => s.id === surveyId);
    if (surveyIndex === -1) return false;

    const newResponse = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(), // Use created_at to match DB
      answers: responseData
    };

    // Optimistic locally
    const updatedSurvey = { ...this.customSurveys[surveyIndex] };
    updatedSurvey.responses = [...(updatedSurvey.responses || []), newResponse];
    this.customSurveys[surveyIndex] = updatedSurvey;

    const { error } = await supabase
      .from('survey_responses')
      .insert([{
        id: newResponse.id,
        survey_id: surveyId,
        answers: responseData
      }]);

    if (error) {
      console.error("Error saving response:", error);
      // Revert
      return false;
    }
    return true;
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

    // Entrepreneur stats are now recalculated in loadData() based on confirmed attendance.
    // We do not manually increment here to avoid counting unconfirmed assignments.
  }

  async saveAssignmentsBatch(assignments) {
    if (!assignments || assignments.length === 0) return;

    // 1. Optimistic update for assignments
    this.asignaciones.push(...assignments);

    // 2. Bulk insert assignments
    const { error } = await supabase
      .from('assignments')
      .insert(assignments);

    if (error) {
      console.error('Error saving assignments batch:', error);
      // In a real app we might want to revert optimistic updates here
    }

    // Entrepreneur stats are now recalculated in loadData() based on confirmed attendance.
    // We do not manually increment here.

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

    // Stats are recalculated in loadData
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

  async submitSurvey(id, surveyData) {
    const index = this.asignaciones.findIndex(a => a.id_asignacion === id);
    if (index >= 0) {
      // Format: [SURVEY] JSON_STRING
      const commentString = `[SURVEY] ${JSON.stringify(surveyData)}`;

      this.asignaciones[index].comentarios = commentString; // Optimistic

      const { error } = await supabase
        .from('assignments')
        .update({ comentarios: commentString })
        .eq('id_asignacion', id);

      if (error) {
        console.error('Error submitting survey:', error);
        return false;
      }
      return true;
    }
    return false;
  }

  getAsignaciones(semana) {
    return this.asignaciones.filter(a => a.semana === semana);
  }

  async addEntrepreneur(data) {
    // Prepare data for Supabase
    // New format: { general_notes: "...", history: [] }
    // But for new entrepreneur, history is empty.
    const notesObject = {
      general_notes: data.notas || '',
      history: [],
      ruc: data.ruc || ''
    };

    const supabaseData = {
      nombre_emprendimiento: data.nombre_emprendimiento,
      persona_contacto: data.persona_contacto,
      telefono: data.telefono,
      correo: data.correo,
      ciudad: data.ciudad || '',
      actividad_economica: data.actividad_economica || '',
      red_social: data.red_social || '',
      subcategoria_interna: data.categoria_principal,
      categoria_principal: data.categoria_principal,
      semaforizacion: data.tipo_emprendedor || 'Externo',

      veces_en_stand: 0,
      ultima_semana_participacion: null,
      ruc: data.ruc || '', // Store in local object
      notas: JSON.stringify({
        general_notes: data.notas || '',
        history: [],
        ruc: data.ruc || '' // Store inside JSON
      })
    };

    const { data: inserted, error } = await supabase
      .from('entrepreneurs')
      .insert([supabaseData])
      .select()
      .single();

    if (error) {
      console.error('Error adding entrepreneur:', error);
      return null;
    }

    // Transform back for local state
    const newEmp = {
      ...inserted,
      notas: data.notas || '',
      followUpHistory: [],
      no_contesto: false
    };

    this.emprendedores.push(newEmp);
    return newEmp;
  }

  async updateEntrepreneur(id, data) {
    const index = this.emprendedores.findIndex(e => e.id === id);
    if (index >= 0) {
      const current = this.emprendedores[index];

      // Merge updates
      const updates = { ...data };

      // Handle notes/history
      // If 'notas' is updated via this method, it updates 'general_notes'
      // 'followUpHistory' should be preserved unless explicitly updated (which we won't do here usually)

      const currentHistory = current.followUpHistory || [];
      const currentGeneralNotes = current.notas || '';

      const newGeneralNotes = updates.notas !== undefined ? updates.notas : currentGeneralNotes;

      const currentRuc = current.ruc || '';
      const newRuc = updates.ruc !== undefined ? updates.ruc : currentRuc;

      // Construct JSON for DB
      const notesObject = {
        general_notes: newGeneralNotes,
        history: currentHistory,
        ruc: newRuc
      };

      const supabaseUpdates = {
        nombre_emprendimiento: updates.nombre_emprendimiento ?? current.nombre_emprendimiento,
        persona_contacto: updates.persona_contacto ?? current.persona_contacto,
        telefono: updates.telefono ?? current.telefono,
        correo: updates.correo ?? current.correo,
        categoria_principal: updates.categoria_principal ?? current.categoria_principal,
        actividad_economica: updates.actividad_economica ?? current.actividad_economica,
        ciudad: updates.ciudad ?? current.ciudad,
        red_social: updates.red_social ?? current.red_social,
        subcategoria_interna: updates.categoria_principal ?? current.subcategoria_interna,
        semaforizacion: updates.tipo_emprendedor ?? current.semaforizacion,
        semaforizacion: updates.tipo_emprendedor ?? current.semaforizacion,
        // ruc: updates.ruc ?? current.ruc, // Removed: Not a column
        notas: JSON.stringify(notesObject)
      };

      // Optimistic update
      this.emprendedores[index] = {
        ...current,
        ...updates,
        notas: newGeneralNotes,
        followUpHistory: currentHistory,
        ruc: newRuc
      };

      const { error } = await supabase
        .from('entrepreneurs')
        .update(supabaseUpdates)
        .eq('id', id);

      if (error) console.error('Error updating entrepreneur:', error);
      return this.emprendedores[index];
    }
    return null;
  }

  async addFollowUp(id, followUpData) {
    const index = this.emprendedores.findIndex(e => e.id === id);
    if (index >= 0) {
      const current = this.emprendedores[index];
      const currentHistory = current.followUpHistory || [];
      const currentGeneralNotes = current.notas || '';

      const newHistory = [followUpData, ...currentHistory];

      // Optimistic update
      this.emprendedores[index] = {
        ...current,
        followUpHistory: newHistory
      };

      // DB Update
      const notesObject = {
        general_notes: currentGeneralNotes,
        history: newHistory
      };

      const { error } = await supabase
        .from('entrepreneurs')
        .update({ notas: JSON.stringify(notesObject) })
        .eq('id', id);

      if (error) {
        console.error('Error adding follow-up:', error);
        // Revert optimistic?
        return false;
      }
      return true;
    }
    return false;
  }

  async deleteFollowUp(id, followUpIndex) {
    const index = this.emprendedores.findIndex(e => e.id === id);
    if (index >= 0) {
      const current = this.emprendedores[index];
      const currentHistory = current.followUpHistory || [];
      const currentGeneralNotes = current.notas || '';

      // Remove item at specific index
      const newHistory = currentHistory.filter((_, idx) => idx !== followUpIndex);

      // Optimistic update
      this.emprendedores[index] = {
        ...current,
        followUpHistory: newHistory
      };

      // DB Update
      const notesObject = {
        general_notes: currentGeneralNotes,
        history: newHistory
      };

      const { error } = await supabase
        .from('entrepreneurs')
        .update({ notas: JSON.stringify(notesObject) })
        .eq('id', id);

      if (error) {
        console.error('Error deleting follow-up:', error);
        return false;
      }
      return true;
    }
    return false;
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
      ultima_semana_participacion: null,
      followUpHistory: []
    }));

    await supabase.from('assignments').delete().neq('id_asignacion', '0'); // Delete all
    await supabase.from('entrepreneurs').update({ veces_en_stand: 0, ultima_semana_participacion: null, notas: '' }).neq('id', 0);
  }
}
