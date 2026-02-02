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
    this.invitationLogs = [];
    // Fairs Portal Data
    this.fairs = [];
    this.fairEntrepreneurs = [];
    this.fairAssignments = [];
    this.fairSales = [];
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
        let pRuc = '';
        let pCiudad = '';

        // Check if notes is a JSON string containing our structure
        // Relaxed check: just starts with {
        if (notes.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(notes);
            history = parsed.history || [];
            generalNotes = parsed.general_notes || '';
            // New: Extract RUC and CIUDAD from notes if available
            if (parsed.ruc) pRuc = parsed.ruc;
            if (parsed.ciudad) pCiudad = parsed.ciudad;

            // Console log to debug specific case (remove later)
            if (e.id === '33' || e.name?.includes('Biscutycake')) {
              console.log('DEBUG LOAD:', e.name, 'Parsed Ciudad:', pCiudad, 'Parsed RUC:', pRuc);
            }

          } catch (err) {
            console.warn('Failed to parse notes JSON:', err);
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
          followUpHistory: history,
          ruc: e.ruc || pRuc || '', // Prefer column, fallback to notes
          ciudad: e.ciudad || pCiudad || '' // Prefer column, fallback to notes
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
          eventLocation: s.event_location,
          showUrgencyBanner: s.show_urgency_banner, // Map DB column to frontend prop
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


      // Fetch Invitation Logs
      const { data: logs, error: logError } = await supabase
        .from('invitation_logs')
        .select('*')
        .order('created_at', { ascending: true })
        .range(0, 4999);

      this.invitationLogs = logs || [];

      if (logError) {
        // If table doesn't exist yet, just ignore to avoid breaking the app
        console.warn("Could not load invitation logs (table might stay missing)", logError);
      }

      // Merge logs into entrepreneurs
      this.emprendedores = this.emprendedores.map(e => {
        const confirmedAssignments = this.asignaciones.filter(a =>
          a.id_emprendedor === e.id && a.asistio === true
        );
        confirmedAssignments.sort((a, b) => compareWeeks(b.semana, a.semana));

        // Find last invitation
        const myLogs = this.invitationLogs.filter(l => l.entrepreneur_id === e.id);
        const lastLog = myLogs.length > 0 ? myLogs[0] : null;

        return {
          ...e,
          veces_en_stand: confirmedAssignments.length,
          ultima_semana_participacion: confirmedAssignments.length > 0 ? confirmedAssignments[0].semana : null,
          lastInvitation: lastLog ? { date: lastLog.created_at, channel: lastLog.channel } : null
        };
      });



      await this.loadEarnings();
      // Load Fairs Portal Data
      await this.loadFairsData();

      this.normalizeCategories();
      return true;
    } catch (error) {
      console.error('Error loading data:', error);
      return false;
    }
  }

  getInvitationLogs() {
    return this.invitationLogs || [];
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
        note: data.note, // Add note
        response_limit: data.limit,
        event_date: data.eventDate,
        event_time: data.eventTime,
        event_location: data.eventLocation,
        event_location: data.eventLocation,
        show_urgency_banner: data.showUrgencyBanner, // Add urgency banner flag
        questions: data.questions,
        survey_type: data.survey_type,
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
    if (updates.note !== undefined) dbUpdates.note = updates.note; // Add note
    if (updates.limit !== undefined) dbUpdates.response_limit = updates.limit;
    if (updates.eventDate !== undefined) dbUpdates.event_date = updates.eventDate;
    if (updates.eventTime !== undefined) dbUpdates.event_time = updates.eventTime;
    if (updates.eventTime !== undefined) dbUpdates.event_time = updates.eventTime;
    if (updates.eventLocation !== undefined) dbUpdates.event_location = updates.eventLocation;
    if (updates.showUrgencyBanner !== undefined) dbUpdates.show_urgency_banner = updates.showUrgencyBanner; // Add urgency banner flag
    if (updates.questions !== undefined) dbUpdates.questions = updates.questions;
    if (updates.survey_type !== undefined) dbUpdates.survey_type = updates.survey_type;
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
    const index = this.emprendedores.findIndex(e => String(e.id) === String(id));
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

      const currentCiudad = current.ciudad || '';
      const newCiudad = updates.ciudad !== undefined ? updates.ciudad : currentCiudad;

      // Construct JSON for DB
      const notesObject = {
        general_notes: newGeneralNotes,
        history: currentHistory,
        ruc: newRuc,
        ciudad: newCiudad
      };

      const supabaseUpdates = {
        nombre_emprendimiento: updates.nombre_emprendimiento ?? current.nombre_emprendimiento,
        persona_contacto: updates.persona_contacto ?? current.persona_contacto,
        telefono: updates.telefono ?? current.telefono,
        correo: updates.correo ?? current.correo,
        categoria_principal: updates.categoria_principal ?? current.categoria_principal,
        actividad_economica: updates.actividad_economica ?? current.actividad_economica,
        // ciudad: updates.ciudad ?? current.ciudad, // Commented out to avoid schema error
        red_social: updates.red_social ?? current.red_social,
        subcategoria_interna: updates.categoria_principal ?? current.subcategoria_interna,
        semaforizacion: updates.tipo_emprendedor ?? current.semaforizacion,
        notas: JSON.stringify(notesObject)
      };

      // Optimistic update
      this.emprendedores[index] = {
        ...current,
        ...updates,
        notas: newGeneralNotes,
        followUpHistory: currentHistory,
        ruc: newRuc,
        ciudad: newCiudad
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


  // --- Fairs Portal Methods ---

  async loadFairsData() {
    try {
      // Load Fairs
      const { data: fairs, error: fairsError } = await supabase
        .from('fairs')
        .select('*')
        .order('created_at', { ascending: false });

      if (fairsError && fairsError.code !== '42P01') { // Ignore if table doesn't exist yet
        console.error('Error loading fairs:', fairsError);
      }
      this.fairs = fairs || [];

      // Load Fair Entrepreneurs
      const { data: fairEnts, error: entError } = await supabase
        .from('fair_entrepreneurs')
        .select('*')
        .order('name', { ascending: true });

      if (entError && entError.code !== '42P01') {
        console.error('Error loading fair entrepreneurs:', entError);
      }
      this.fairEntrepreneurs = fairEnts || [];

      // Load Assignments
      const { data: assignments, error: assignError } = await supabase
        .from('fair_assignments')
        .select('*');

      if (assignError && assignError.code !== '42P01') {
        console.error('Error loading fair assignments:', assignError);
      }
      this.fairAssignments = assignments || [];

      // Load Fair Sales
      const { data: sales, error: salesError } = await supabase
        .from('fair_sales')
        .select('*');

      if (salesError && salesError.code !== '42P01') {
        console.error('Error loading fair sales:', salesError);
      }
      this.fairSales = sales || [];

    } catch (error) {
      console.error('Error loading fairs data:', error);
    }
  }

  // Fairs
  getFairs() {
    return this.fairs;
  }

  async addFair(fairData) {
    const { data, error } = await supabase
      .from('fairs')
      .insert([fairData])
      .select()
      .single();

    if (error) {
      console.error('Error adding fair:', error);
      return null;
    }
    this.fairs.unshift(data);
    return data;
  }

  async updateFair(id, updates) {
    const { data, error } = await supabase
      .from('fairs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating fair:', error);
      return null;
    }
    this.fairs = this.fairs.map(f => f.id === id ? data : f);
    return data;
  }

  async deleteFair(id) {
    const { error } = await supabase.from('fairs').delete().eq('id', id);
    if (error) {
      console.error('Error deleting fair:', error);
      return false;
    }
    this.fairs = this.fairs.filter(f => f.id !== id);
    return true;
  }

  // Fair Entrepreneurs
  getFairEntrepreneurs() {
    return this.fairEntrepreneurs;
  }

  async addFairEntrepreneur(entrepreneurData) {
    const { data, error } = await supabase
      .from('fair_entrepreneurs')
      .insert([entrepreneurData])
      .select()
      .single();

    if (error) {
      console.error('Error adding fair entrepreneur:', error);
      return null;
    }
    this.fairEntrepreneurs.push(data);
    return data;
  }

  async updateFairEntrepreneur(id, updates) {
    console.log('DEBUG: updateFairEntrepreneur called with id:', id, 'updates:', updates);

    const { data, error } = await supabase
      .from('fair_entrepreneurs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating fair entrepreneur:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      return null;
    }

    console.log('DEBUG: updateFairEntrepreneur success, returned data:', data);
    this.fairEntrepreneurs = this.fairEntrepreneurs.map(e => e.id === id ? data : e);
    return data;
  }

  async deleteFairEntrepreneur(id) {
    const { error } = await supabase.from('fair_entrepreneurs').delete().eq('id', id);
    if (error) {
      console.error('Error deleting fair entrepreneur:', error);
      return false;
    }
    this.fairEntrepreneurs = this.fairEntrepreneurs.filter(e => e.id !== id);
    return true;
  }

  // Fair Assignments
  getFairAssignments(fairId) {
    return this.fairAssignments.filter(a => a.fair_id === fairId);
  }

  async assignEntrepreneurToFair(fairId, entrepreneurId) {
    const exists = this.fairAssignments.find(a => a.fair_id === fairId && a.entrepreneur_id === entrepreneurId);
    if (exists) return null;

    const { data, error } = await supabase
      .from('fair_assignments')
      .insert([{ fair_id: fairId, entrepreneur_id: entrepreneurId }])
      .select()
      .single();

    if (error) {
      console.error('Error assigning entrepreneur:', error);
      return null;
    }
    this.fairAssignments.push(data);
    return data;
  }

  async removeEntrepreneurFromFair(fairId, entrepreneurId) {
    const { error } = await supabase
      .from('fair_assignments')
      .delete()
      .eq('fair_id', fairId)
      .eq('entrepreneur_id', entrepreneurId);

    if (error) {
      console.error('Error removing entrepreneur assignment:', error);
      return false;
    }
    this.fairAssignments = this.fairAssignments.filter(a => !(a.fair_id === fairId && a.entrepreneur_id === entrepreneurId));
    return true;
  }

  async updateFairAssignmentStatus(fairId, entrepreneurId, status) {
    const index = this.fairAssignments.findIndex(a => a.fair_id === fairId && a.entrepreneur_id === entrepreneurId);
    if (index >= 0) {
      // Optimistic Update
      this.fairAssignments[index] = { ...this.fairAssignments[index], status };

      const { error } = await supabase
        .from('fair_assignments')
        .update({ status })
        .eq('fair_id', fairId)
        .eq('entrepreneur_id', entrepreneurId);

      if (error) {
        console.error('Error updating assignment status:', error);
        return false;
      }
      return true;
    }
    return false;
  }

  async bulkImportFairEntrepreneurs(fairId, entrepreneursData) {
    if (!entrepreneursData || entrepreneursData.length === 0) return [];

    // 1. Bulk Insert Entrepreneurs
    const { data: createdEntrepreneurs, error: entError } = await supabase
      .from('fair_entrepreneurs')
      .insert(entrepreneursData)
      .select();

    if (entError) {
      console.error('Error bulk adding fair entrepreneurs:', entError);
      return [];
    }

    // Update local state
    this.fairEntrepreneurs.push(...createdEntrepreneurs);

    // 2. Prepare Assignments
    const assignments = createdEntrepreneurs.map(e => ({
      fair_id: fairId,
      entrepreneur_id: e.id,
      status: 'assigned'
    }));

    // 3. Bulk Insert Assignments
    const { data: createdAssignments, error: assignError } = await supabase
      .from('fair_assignments')
      .insert(assignments)
      .select();

    if (assignError) {
      console.error('Error bulk assigning entrepreneurs:', assignError);
      return createdEntrepreneurs;
    }

    // Update local state
    this.fairAssignments.push(...createdAssignments);

    return createdEntrepreneurs;
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

  async addInvitationLog(data) {
    const { error } = await supabase
      .from('invitation_logs')
      .insert([{
        ...data,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error logging invitation:', error);
      return false;
    }
    return true;
  }

  async addInvitationLogBatch(dataArray) {
    const { error } = await supabase
      .from('invitation_logs')
      .insert(dataArray.map(item => ({
        ...item,
        created_at: item.created_at || new Date().toISOString()
      })));

    if (error) {
      console.error('Error logging batch invitations:', error);
      return { success: false, error };
    }
    return { success: true };
  }

  // Fair Sales
  getFairSales(fairId) {
    return this.fairSales.filter(s => s.fair_id === fairId);
  }

  async addFairSale(saleData) {
    // Check if exists locally first to avoid unnecessary DB calls if possible, 
    // but better to check DB or just use upsert if we had constraints. 
    // Since we are using a local cache `this.fairSales`, let's check that.
    const existingIndex = this.fairSales.findIndex(s =>
      s.fair_id === saleData.fair_id &&
      s.entrepreneur_id === saleData.entrepreneur_id &&
      s.sale_date === saleData.sale_date
    );

    if (existingIndex !== -1) {
      // Update existing
      const existingId = this.fairSales[existingIndex].id;
      const { data, error } = await supabase
        .from('fair_sales')
        .update({ amount: saleData.amount })
        .eq('id', existingId)
        .select()
        .single();

      if (error) {
        console.error('Error updating fair sale:', error);
        return null;
      }

      // Update local cache
      this.fairSales[existingIndex] = data;
      return data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('fair_sales')
        .insert([saleData])
        .select()
        .single();

      if (error) {
        console.error('Error adding fair sale:', error);
        return null;
      }
      this.fairSales.push(data);
      return data;
    }
  }

  async deleteFairSale(id) {
    const { error } = await supabase.from('fair_sales').delete().eq('id', id);
    if (error) {
      console.error('Error deleting fair sale:', error);
      return false;
    }
    this.fairSales = this.fairSales.filter(s => s.id !== id);
    return true;
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
