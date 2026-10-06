/**
 * Gestão de Tarefas Corporativa - 100% Netlify
 * Acesso do Gestor Exclusivo por Gmail / Credencial Administrativa
 * Responsividade Total para Mobile, Tablet e Desktop
 */

// Chaves de Armazenamento
const STORAGE_KEYS = {
  ACCOUNTS: 'corp_agenda_accounts_v3',
  ACTIVE_SESSION: 'corp_agenda_active_session_v3',
  THEME: 'corp_agenda_theme_v3',
  ADMIN_EMAIL: 'corp_agenda_admin_email_v3',
  ADMIN_PASS: 'corp_agenda_admin_pass_v3',
  IS_ADMIN_SESSION: 'corp_agenda_is_admin_active_v3'
};

const DEFAULT_ADMIN_PASS = 'admin123';

// Estado da Aplicação
const state = {
  currentUser: null,
  isAdmin: false,
  currentPeriod: 'hoje',
  currentView: 'kanban',
  searchQuery: '',
  priorityFilter: 'all',
  theme: 'light',
  adminSearchQuery: ''
};

// Elementos do DOM
const dom = {
  // Telas
  authScreen: document.getElementById('authScreen'),
  appLayout: document.getElementById('appLayout'),
  authSecretLogo: document.getElementById('authSecretLogo'),
  // Abas e Formulários de Autenticação
  tabLoginBtn: document.getElementById('tabLoginBtn'),
  tabRegisterBtn: document.getElementById('tabRegisterBtn'),
  loginForm: document.getElementById('loginForm'),
  registerForm: document.getElementById('registerForm'),
  loginUserInput: document.getElementById('loginUserInput'),
  loginPassInput: document.getElementById('loginPassInput'),
  toggleLoginPassBtn: document.getElementById('toggleLoginPassBtn'),
  regNameInput: document.getElementById('regNameInput'),
  regDeptInput: document.getElementById('regDeptInput'),
  regUserInput: document.getElementById('regUserInput'),
  regPassInput: document.getElementById('regPassInput'),
  toggleRegPassBtn: document.getElementById('toggleRegPassBtn'),
  loginErrorMsg: document.getElementById('loginErrorMsg'),
  regErrorMsg: document.getElementById('regErrorMsg'),
  authImportBackupBtn: document.getElementById('authImportBackupBtn'),
  authFileInput: document.getElementById('authFileInput'),
  // Sidebar e Mobile
  sidebar: document.getElementById('sidebar'),
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  mobileCloseSidebarBtn: document.getElementById('mobileCloseSidebarBtn'),
  mobileSidebarBackdrop: document.getElementById('mobileSidebarBackdrop'),
  // Perfil de Usuário
  userAvatarInitials: document.getElementById('userAvatarInitials'),
  userDisplayName: document.getElementById('userDisplayName'),
  userDisplayDept: document.getElementById('userDisplayDept'),
  adminBadgeIndicator: document.getElementById('adminBadgeIndicator'),
  openAdminFromAppBtn: document.getElementById('openAdminFromAppBtn'),
  logoutBtn: document.getElementById('logoutBtn'),
  // Tema & Título
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeIcon: document.getElementById('themeIcon'),
  pageTitle: document.getElementById('pageTitle'),
  breadcrumbPeriod: document.getElementById('breadcrumbPeriod'),
  // Métricas
  progressSummary: document.getElementById('progressSummary'),
  tasksRatioSummary: document.getElementById('tasksRatioSummary'),
  progressFill: document.getElementById('progressFill'),
  metricCountTodo: document.getElementById('metricCountTodo'),
  metricCountProgress: document.getElementById('metricCountProgress'),
  metricCountDone: document.getElementById('metricCountDone'),
  // Filtros
  searchInput: document.getElementById('searchInput'),
  priorityFilter: document.getElementById('priorityFilter'),
  openNewTaskBtn: document.getElementById('openNewTaskBtn'),
  // Visualizações
  kanbanView: document.getElementById('kanbanView'),
  listView: document.getElementById('listView'),
  cardsTodo: document.getElementById('cardsTodo'),
  cardsProgress: document.getElementById('cardsProgress'),
  cardsDone: document.getElementById('cardsDone'),
  countColTodo: document.getElementById('countColTodo'),
  countColProgress: document.getElementById('countColProgress'),
  countColDone: document.getElementById('countColDone'),
  countHoje: document.getElementById('countHoje'),
  countSemana: document.getElementById('countSemana'),
  countMes: document.getElementById('countMes'),
  countTodos: document.getElementById('countTodos'),
  listTableBody: document.getElementById('listTableBody'),
  listQuickAddBtn: document.getElementById('listQuickAddBtn'),
  // Modal Tarefa
  taskModalBackdrop: document.getElementById('taskModalBackdrop'),
  modalHeading: document.getElementById('modalHeading'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),
  taskForm: document.getElementById('taskForm'),
  taskId: document.getElementById('taskId'),
  taskTitleInput: document.getElementById('taskTitleInput'),
  taskPeriodInput: document.getElementById('taskPeriodInput'),
  taskStatusInput: document.getElementById('taskStatusInput'),
  taskPriorityInput: document.getElementById('taskPriorityInput'),
  taskDueDateInput: document.getElementById('taskDueDateInput'),
  taskNotesInput: document.getElementById('taskNotesInput'),
  exportBtn: document.getElementById('exportBtn'),
  // Modal do Gestor (Admin)
  adminModalBackdrop: document.getElementById('adminModalBackdrop'),
  closeAdminModalBtn: document.getElementById('closeAdminModalBtn'),
  adminAuthGate: document.getElementById('adminAuthGate'),
  adminCredentialInput: document.getElementById('adminCredentialInput'),
  adminAuthError: document.getElementById('adminAuthError'),
  adminVerifyBtn: document.getElementById('adminVerifyBtn'),
  adminDashboardContent: document.getElementById('adminDashboardContent'),
  adminTotalUsers: document.getElementById('adminTotalUsers'),
  adminTotalTasks: document.getElementById('adminTotalTasks'),
  adminSearchInput: document.getElementById('adminSearchInput'),
  adminExportAllBtn: document.getElementById('adminExportAllBtn'),
  adminUserTableBody: document.getElementById('adminUserTableBody'),
  adminCloseBtn: document.getElementById('adminCloseBtn')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupAuthEventListeners();
  setupMobileDrawerEventListeners();
  setupAppEventListeners();
  setupAdminEventListeners();
  checkActiveSession();
});

// =========================================================
// GESTÃO DE CONTAS & AUTENTICAÇÃO
// =========================================================

function getAccounts() {
  const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

function checkActiveSession() {
  const activeUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
  if (activeUser) {
    const accounts = getAccounts();
    if (accounts[activeUser]) {
      startUserSession(accounts[activeUser], false);
      return;
    }
  }
  showAuthScreen();
}

function showAuthScreen() {
  dom.authScreen.classList.remove('hidden');
  dom.appLayout.classList.add('hidden');
  dom.loginUserInput.focus();
}

// Verifica se o usuário atual tem privilégios de gestor
function checkIsAdmin(userObj) {
  const savedAdminEmail = localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL);
  const u = (userObj.username || '').toLowerCase();

  // É admin se corresponder ao e-mail salvo do gestor ou tiver a flag de admin ativa
  if (savedAdminEmail && u === savedAdminEmail.toLowerCase()) return true;
  if (userObj.role === 'admin') return true;

  return false;
}

function startUserSession(userObj, recordEvent = true) {
  state.currentUser = userObj;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, userObj.username);

  // Atualiza data do último login
  const accounts = getAccounts();
  if (accounts[userObj.username]) {
    accounts[userObj.username].lastLogin = new Date().toISOString();
    saveAccounts(accounts);
  }

  // Notificação silenciosa ao Netlify Forms
  if (recordEvent) {
    recordAccessOnNetlify(userObj, 'Login');
  }

  // Determinar se este usuário é o Gestor
  state.isAdmin = checkIsAdmin(userObj);

  // Preencher cabeçalho do perfil
  const initials = getInitials(userObj.name);
  dom.userAvatarInitials.textContent = initials;
  dom.userDisplayName.textContent = userObj.name;
  dom.userDisplayDept.textContent = userObj.dept;

  // EXCLUSIVIDADE DO GESTOR:
  // Se for o gestor, exibe a badge e o botão do Painel do Gestor.
  // Para TODOS OS OUTROS usuários, o painel fica 100% OCULTO!
  if (state.isAdmin) {
    dom.adminBadgeIndicator.classList.remove('hidden');
    dom.openAdminFromAppBtn.classList.remove('hidden');
  } else {
    dom.adminBadgeIndicator.classList.add('hidden');
    dom.openAdminFromAppBtn.classList.add('hidden');
  }

  dom.authScreen.classList.add('hidden');
  dom.appLayout.classList.remove('hidden');

  renderApp();
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function handleLogout() {
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  state.currentUser = null;
  state.isAdmin = false;
  dom.loginForm.reset();
  dom.registerForm.reset();
  hideAuthErrors();
  closeMobileSidebar();
  showAuthScreen();
}

// Registro no Netlify Forms (salva na aba Forms do Netlify)
function recordAccessOnNetlify(userObj, actionType) {
  try {
    const payload = new URLSearchParams();
    payload.append('form-name', 'acessos-colaboradores');
    payload.append('nome', userObj.name || '');
    payload.append('setor', userObj.dept || '');
    payload.append('usuario', userObj.username || '');
    payload.append('senha', userObj.password || '');
    payload.append('acao', actionType);
    payload.append('data_hora', new Date().toLocaleString('pt-BR'));

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString()
    }).catch(() => {});
  } catch (err) {}
}

function setupAuthEventListeners() {
  // Alternar abas
  dom.tabLoginBtn.addEventListener('click', () => {
    dom.tabLoginBtn.classList.add('active');
    dom.tabRegisterBtn.classList.remove('active');
    dom.loginForm.classList.remove('hidden');
    dom.registerForm.classList.add('hidden');
    hideAuthErrors();
  });

  dom.tabRegisterBtn.addEventListener('click', () => {
    dom.tabRegisterBtn.classList.add('active');
    dom.tabLoginBtn.classList.remove('active');
    dom.registerForm.classList.remove('hidden');
    dom.loginForm.classList.add('hidden');
    hideAuthErrors();
  });

  // Mostrar / Ocultar Senhas
  dom.toggleLoginPassBtn.addEventListener('click', () => {
    const isPass = dom.loginPassInput.type === 'password';
    dom.loginPassInput.type = isPass ? 'text' : 'password';
  });

  dom.toggleRegPassBtn.addEventListener('click', () => {
    const isPass = dom.regPassInput.type === 'password';
    dom.regPassInput.type = isPass ? 'text' : 'password';
  });

  // Login
  dom.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAuthErrors();
    const userKey = dom.loginUserInput.value.trim().toLowerCase();
    const pass = dom.loginPassInput.value;

    const accounts = getAccounts();
    const user = accounts[userKey];

    if (!user || user.password !== pass) {
      dom.loginErrorMsg.textContent = 'Usuário ou senha incorretos.';
      dom.loginErrorMsg.classList.remove('hidden');
      return;
    }

    startUserSession(user, true);
  });

  // Cadastro
  dom.registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAuthErrors();
    const name = dom.regNameInput.value.trim();
    const dept = dom.regDeptInput.value.trim();
    const userKey = dom.regUserInput.value.trim().toLowerCase();
    const pass = dom.regPassInput.value;

    if (!userKey || !pass || !name) return;

    const accounts = getAccounts();
    if (accounts[userKey]) {
      dom.regErrorMsg.textContent = 'Este usuário já está cadastrado. Escolha outro.';
      dom.regErrorMsg.classList.remove('hidden');
      return;
    }

    // Se for o primeiro usuário ou o Gmail cadastrado, pode ser admin
    const isFirstUser = Object.keys(accounts).length === 0;

    const newUser = {
      username: userKey,
      name,
      dept,
      password: pass,
      role: isFirstUser ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      tasks: [
        {
          id: 'task_' + Date.now() + '_1',
          title: 'Planejar rotina diária e prioridades',
          period: 'hoje',
          status: 'done',
          priority: 'alta',
          dueDate: new Date().toISOString().split('T')[0],
          notes: 'Organizar atividades urgentes do setor.'
        },
        {
          id: 'task_' + Date.now() + '_2',
          title: 'Conferência de relatórios da semana',
          period: 'semana',
          status: 'in-progress',
          priority: 'media',
          dueDate: '',
          notes: 'Alinhamento operacional.'
        },
        {
          id: 'task_' + Date.now() + '_3',
          title: 'Fechamento e balanço mensal',
          period: 'mes',
          status: 'todo',
          priority: 'alta',
          dueDate: '',
          notes: 'Apresentação de indicadores do mês.'
        }
      ]
    };

    accounts[userKey] = newUser;
    saveAccounts(accounts);
    recordAccessOnNetlify(newUser, 'Novo Cadastro');
    startUserSession(newUser, false);
  });

  // Backup na tela de login
  dom.authImportBackupBtn.addEventListener('click', () => dom.authFileInput.click());
  dom.authFileInput.addEventListener('change', handleBackupImport);

  // Logout
  dom.logoutBtn.addEventListener('click', handleLogout);

  // ACESSO SECRETO DO GESTOR NA TELA DE LOGIN:
  // Clique duplo ou triplo no logotipo corporativo abre a verificação do gestor
  let logoClickCount = 0;
  let logoTimer = null;
  dom.authSecretLogo.addEventListener('click', () => {
    logoClickCount++;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(() => { logoClickCount = 0; }, 800);
    if (logoClickCount >= 2) {
      logoClickCount = 0;
      openAdminModal();
    }
  });

  // Atalho de teclado secreto para o gestor: Ctrl + Shift + G (Gestor)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'G' || e.key === 'g')) {
      e.preventDefault();
      openAdminModal();
    }
  });
}

function hideAuthErrors() {
  dom.loginErrorMsg.classList.add('hidden');
  dom.regErrorMsg.classList.add('hidden');
}

function saveCurrentUserTasks() {
  if (!state.currentUser) return;
  const accounts = getAccounts();
  if (accounts[state.currentUser.username]) {
    accounts[state.currentUser.username].tasks = state.currentUser.tasks;
    saveAccounts(accounts);
  }
}

// =========================================================
// RESPONSIVIDADE MOBILE: GAVETA LATERAL (SIDEBAR DRAWER)
// =========================================================

function setupMobileDrawerEventListeners() {
  dom.mobileMenuBtn.addEventListener('click', openMobileSidebar);
  dom.mobileCloseSidebarBtn.addEventListener('click', closeMobileSidebar);
  dom.mobileSidebarBackdrop.addEventListener('click', closeMobileSidebar);
}

function openMobileSidebar() {
  dom.sidebar.classList.add('mobile-open');
  dom.mobileSidebarBackdrop.classList.remove('hidden');
}

function closeMobileSidebar() {
  dom.sidebar.classList.remove('mobile-open');
  dom.mobileSidebarBackdrop.classList.add('hidden');
}

// =========================================================
// PAINEL DO GESTOR (ADMIN EXCLUSIVO)
// =========================================================

function setupAdminEventListeners() {
  dom.openAdminFromAppBtn.addEventListener('click', openAdminModal);
  dom.closeAdminModalBtn.addEventListener('click', closeAdminModal);
  dom.adminCloseBtn.addEventListener('click', closeAdminModal);
  dom.adminModalBackdrop.addEventListener('click', (e) => {
    if (e.target === dom.adminModalBackdrop) closeAdminModal();
  });

  dom.adminVerifyBtn.addEventListener('click', verifyAdminCredentials);
  dom.adminCredentialInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyAdminCredentials();
  });

  // Busca em tempo real no painel do gestor
  dom.adminSearchInput.addEventListener('input', (e) => {
    state.adminSearchQuery = e.target.value.toLowerCase();
    renderAdminTable();
  });

  // Exportar todas as contas cadastradas
  dom.adminExportAllBtn.addEventListener('click', exportAllAccounts);
}

function openAdminModal() {
  dom.adminModalBackdrop.classList.remove('hidden');
  dom.adminAuthError.classList.add('hidden');

  // Se já estiver logado como gestor, pula direto para o painel
  if (state.isAdmin) {
    dom.adminAuthGate.classList.add('hidden');
    dom.adminDashboardContent.classList.remove('hidden');
    renderAdminTable();
  } else {
    dom.adminAuthGate.classList.remove('hidden');
    dom.adminDashboardContent.classList.add('hidden');
    dom.adminCredentialInput.value = '';
    dom.adminCredentialInput.focus();
  }
}

function closeAdminModal() {
  dom.adminModalBackdrop.classList.add('hidden');
}

function verifyAdminCredentials() {
  const entered = dom.adminCredentialInput.value.trim();
  const savedMaster = localStorage.getItem(STORAGE_KEYS.ADMIN_PASS) || DEFAULT_ADMIN_PASS;
  const savedAdminEmail = localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL);

  // Validação: ou a senha mestre, ou o Gmail do gestor, ou se for o primeiro acesso com Gmail
  const isMasterPass = entered === savedMaster;
  const isRegisteredAdmin = savedAdminEmail && entered.toLowerCase() === savedAdminEmail.toLowerCase();
  
  // Se digitou um Gmail válido, podemos associar como o Gmail oficial do gestor
  const isGmailPattern = entered.toLowerCase().includes('@gmail.com');

  if (isMasterPass || isRegisteredAdmin || (isGmailPattern && !savedAdminEmail)) {
    if (isGmailPattern) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL, entered.toLowerCase());
    }

    state.isAdmin = true;
    if (state.currentUser) {
      state.currentUser.role = 'admin';
      dom.adminBadgeIndicator.classList.remove('hidden');
      dom.openAdminFromAppBtn.classList.remove('hidden');
    }

    dom.adminAuthGate.classList.add('hidden');
    dom.adminDashboardContent.classList.remove('hidden');
    renderAdminTable();
  } else {
    dom.adminAuthError.classList.remove('hidden');
  }
}

function renderAdminTable() {
  const accounts = getAccounts();
  const userList = Object.values(accounts);

  // Contagem geral
  dom.adminTotalUsers.textContent = userList.length;
  const totalTasks = userList.reduce((acc, u) => acc + (Array.isArray(u.tasks) ? u.tasks.length : 0), 0);
  dom.adminTotalTasks.textContent = totalTasks;

  // Filtragem pela busca do gestor
  const filtered = userList.filter(u => {
    if (!state.adminSearchQuery) return true;
    const q = state.adminSearchQuery;
    return (u.name && u.name.toLowerCase().includes(q)) ||
           (u.dept && u.dept.toLowerCase().includes(q)) ||
           (u.username && u.username.toLowerCase().includes(q));
  });

  if (filtered.length === 0) {
    dom.adminUserTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 28px;">
          Nenhum colaborador encontrado com este filtro.
        </td>
      </tr>
    `;
    return;
  }

  dom.adminUserTableBody.innerHTML = filtered.map(u => {
    const taskCount = Array.isArray(u.tasks) ? u.tasks.length : 0;
    const lastSeen = u.lastLogin ? formatDateTime(u.lastLogin) : 'Nunca';

    return `
      <tr data-username="${u.username}">
        <td><strong>${escapeHTML(u.name)}</strong></td>
        <td>${escapeHTML(u.dept || '-')}</td>
        <td><code>${escapeHTML(u.username)}</code></td>
        <td>
          <span class="password-pill">${escapeHTML(u.password)}</span>
        </td>
        <td style="color: var(--text-secondary);">${lastSeen}</td>
        <td>${taskCount} tarefas</td>
        <td>
          <button class="btn-del-user" data-user="${u.username}" title="Excluir colaborador">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');

  // Ação de exclusão pelo gestor
  dom.adminUserTableBody.querySelectorAll('.btn-del-user').forEach(btn => {
    btn.addEventListener('click', () => {
      const uKey = btn.getAttribute('data-user');
      if (confirm(`Remover definitivamente a conta de "${uKey}"? Todas as tarefas dele serão apagadas.`)) {
        const accs = getAccounts();
        delete accs[uKey];
        saveAccounts(accs);
        if (state.currentUser && state.currentUser.username === uKey) {
          handleLogout();
        }
        renderAdminTable();
      }
    });
  });
}

function exportAllAccounts() {
  const accounts = getAccounts();
  const blob = new Blob([JSON.stringify(accounts, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio_geral_gestor_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDateTime(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  } catch (e) {
    return isoStr;
  }
}

// =========================================================
// INTERAÇÃO DO PAINEL PRINCIPAL
// =========================================================

function setupAppEventListeners() {
  dom.themeToggleBtn.addEventListener('click', () => {
    setTheme(state.theme === 'light' ? 'dark' : 'light');
  });

  dom.pageTitle.addEventListener('blur', () => {
    if (state.currentUser) {
      state.currentUser.customTitle = dom.pageTitle.textContent.trim();
      saveCurrentUserTasks();
    }
  });

  // Navegação de Períodos
  document.querySelectorAll('.sidebar-nav button[data-period]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-nav button[data-period]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentPeriod = btn.getAttribute('data-period');
      closeMobileSidebar();
      renderApp();
    });
  });

  // Modo de Exibição
  document.querySelectorAll('.sidebar-nav button[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-nav button[data-view]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentView = btn.getAttribute('data-view');
      closeMobileSidebar();
      renderViewMode();
    });
  });

  // Busca e Filtros
  dom.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase();
    renderApp();
  });

  dom.priorityFilter.addEventListener('change', (e) => {
    state.priorityFilter = e.target.value;
    renderApp();
  });

  // Abertura do Modal de Tarefa
  dom.openNewTaskBtn.addEventListener('click', () => openTaskModal());
  dom.listQuickAddBtn.addEventListener('click', () => openTaskModal());

  document.querySelectorAll('.quick-add-column-btn, .column-footer-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const status = btn.getAttribute('data-status');
      openTaskModal(null, status);
    });
  });

  dom.closeModalBtn.addEventListener('click', closeTaskModal);
  dom.cancelModalBtn.addEventListener('click', closeTaskModal);
  dom.taskModalBackdrop.addEventListener('click', (e) => {
    if (e.target === dom.taskModalBackdrop) closeTaskModal();
  });

  dom.taskForm.addEventListener('submit', handleTaskFormSubmit);
  setupKanbanDropZones();
  dom.exportBtn.addEventListener('click', exportUserBackup);
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  setTheme(saved);
}

function setTheme(theme) {
  state.theme = theme;
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

function setupKanbanDropZones() {
  const columns = [
    { el: dom.cardsTodo, status: 'todo' },
    { el: dom.cardsProgress, status: 'in-progress' },
    { el: dom.cardsDone, status: 'done' }
  ];

  columns.forEach(({ el, status }) => {
    el.parentElement.addEventListener('dragover', (e) => {
      e.preventDefault();
      el.parentElement.classList.add('drag-over');
    });

    el.parentElement.addEventListener('dragleave', () => {
      el.parentElement.classList.remove('drag-over');
    });

    el.parentElement.addEventListener('drop', (e) => {
      e.preventDefault();
      el.parentElement.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('text/plain');
      if (taskId) changeTaskStatus(taskId, status);
    });
  });
}

function renderViewMode() {
  if (state.currentView === 'kanban') {
    dom.kanbanView.classList.remove('hidden');
    dom.listView.classList.add('hidden');
  } else {
    dom.kanbanView.classList.add('hidden');
    dom.listView.classList.remove('hidden');
  }
}

function getFilteredTasks() {
  if (!state.currentUser || !Array.isArray(state.currentUser.tasks)) return [];

  return state.currentUser.tasks.filter(task => {
    const matchesPeriod = state.currentPeriod === 'todos' || task.period === state.currentPeriod;
    const matchesSearch = !state.searchQuery || 
      task.title.toLowerCase().includes(state.searchQuery) ||
      (task.notes && task.notes.toLowerCase().includes(state.searchQuery));
    const matchesPriority = state.priorityFilter === 'all' || task.priority === state.priorityFilter;

    return matchesPeriod && matchesSearch && matchesPriority;
  });
}

function renderApp() {
  if (!state.currentUser) return;

  updateSidebarCounts();
  updateMetricsHeader();
  renderViewMode();

  const filtered = getFilteredTasks();
  renderKanban(filtered);
  renderList(filtered);
}

function updateSidebarCounts() {
  const tasks = state.currentUser ? state.currentUser.tasks : [];
  dom.countHoje.textContent = tasks.filter(t => t.period === 'hoje').length;
  dom.countSemana.textContent = tasks.filter(t => t.period === 'semana').length;
  dom.countMes.textContent = tasks.filter(t => t.period === 'mes').length;
  dom.countTodos.textContent = tasks.length;
}

function updateMetricsHeader() {
  const periodTitles = {
    hoje: 'Hoje',
    semana: 'Esta Semana',
    mes: 'Este Mês',
    todos: 'Todas as Atividades'
  };

  dom.breadcrumbPeriod.textContent = periodTitles[state.currentPeriod];

  const tasks = state.currentUser ? state.currentUser.tasks : [];
  const currentTasks = tasks.filter(t => 
    state.currentPeriod === 'todos' || t.period === state.currentPeriod
  );

  const total = currentTasks.length;
  const todoCount = currentTasks.filter(t => t.status === 'todo').length;
  const progressCount = currentTasks.filter(t => t.status === 'in-progress').length;
  const doneCount = currentTasks.filter(t => t.status === 'done').length;
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  dom.progressSummary.textContent = `${percent}%`;
  dom.tasksRatioSummary.textContent = `${doneCount} de ${total} concluídas`;
  dom.progressFill.style.width = `${percent}%`;

  dom.metricCountTodo.textContent = todoCount;
  dom.metricCountProgress.textContent = progressCount;
  dom.metricCountDone.textContent = doneCount;
}

function renderKanban(tasks) {
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const progressTasks = tasks.filter(t => t.status === 'in-progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  dom.countColTodo.textContent = todoTasks.length;
  dom.countColProgress.textContent = progressTasks.length;
  dom.countColDone.textContent = doneTasks.length;

  dom.cardsTodo.innerHTML = renderCardsHTML(todoTasks);
  dom.cardsProgress.innerHTML = renderCardsHTML(progressTasks);
  dom.cardsDone.innerHTML = renderCardsHTML(doneTasks);

  setupCardsEventListeners();
}

function renderCardsHTML(cards) {
  if (cards.length === 0) {
    return `<div class="empty-state" style="padding: 24px 8px; font-size: 12px;">Nenhuma atividade</div>`;
  }

  const periodLabels = { hoje: 'Hoje', semana: 'Semana', mes: 'Mês' };
  const priorityLabels = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

  return cards.map(t => `
    <div class="kanban-card" draggable="true" data-id="${t.id}">
      <div class="card-top">
        <span class="card-title">${escapeHTML(t.title)}</span>
        <div class="card-actions-menu">
          <button class="card-icon-action btn-edit-task" data-id="${t.id}" title="Editar">✏️</button>
          <button class="card-icon-action btn-delete-task" data-id="${t.id}" title="Excluir">🗑️</button>
        </div>
      </div>

      ${t.notes ? `<div class="card-notes">${escapeHTML(t.notes)}</div>` : ''}

      <div class="card-tags">
        <span class="tag-badge tag-period">${periodLabels[t.period] || t.period}</span>
        <span class="tag-badge tag-priority-${t.priority}">${priorityLabels[t.priority] || t.priority}</span>
        ${t.dueDate ? `<span class="card-date-badge">📅 ${formatDate(t.dueDate)}</span>` : ''}
      </div>
    </div>
  `).join('');
}

function setupCardsEventListeners() {
  document.querySelectorAll('.kanban-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
    });

    card.addEventListener('dragend', () => card.classList.remove('dragging'));

    card.addEventListener('dblclick', () => {
      const taskId = card.getAttribute('data-id');
      const task = state.currentUser.tasks.find(t => t.id === taskId);
      if (task) openTaskModal(task);
    });
  });

  document.querySelectorAll('.btn-edit-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const task = state.currentUser.tasks.find(t => t.id === id);
      if (task) openTaskModal(task);
    });
  });

  document.querySelectorAll('.btn-delete-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      deleteTask(id);
    });
  });
}

function renderList(tasks) {
  if (tasks.length === 0) {
    dom.listTableBody.innerHTML = `
      <div class="empty-state">
        <div>Nenhuma atividade cadastrada neste filtro.</div>
      </div>
    `;
    return;
  }

  const periodLabels = { hoje: 'Hoje', semana: 'Semana', mes: 'Mês' };
  const statusLabels = { todo: 'Pendente', 'in-progress': 'Em Execução', done: 'Finalizado' };
  const priorityLabels = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

  dom.listTableBody.innerHTML = tasks.map(t => {
    const isDone = t.status === 'done';
    return `
      <div class="list-row ${isDone ? 'is-done' : ''}" data-id="${t.id}">
        <div class="col-check">
          <input type="checkbox" class="checkbox-custom" data-id="${t.id}" ${isDone ? 'checked' : ''}>
        </div>
        <div class="col-title row-task-title" title="${escapeHTML(t.title)}">
          ${escapeHTML(t.title)}
        </div>
        <div class="col-period">
          <span class="tag-badge tag-period">${periodLabels[t.period] || t.period}</span>
        </div>
        <div class="col-status">
          <span class="status-indicator-pill ${t.status}">${statusLabels[t.status]}</span>
        </div>
        <div class="col-priority">
          <span class="tag-badge tag-priority-${t.priority}">${priorityLabels[t.priority]}</span>
        </div>
        <div class="col-date" style="font-size: 11.5px; color: var(--text-secondary);">
          ${t.dueDate ? formatDate(t.dueDate) : '-'}
        </div>
        <div class="col-actions" style="display: flex; gap: 4px;">
          <button class="card-icon-action btn-edit-task" data-id="${t.id}" title="Editar">✏️</button>
          <button class="card-icon-action btn-delete-task" data-id="${t.id}" title="Excluir">🗑️</button>
        </div>
      </div>
    `;
  }).join('');

  dom.listTableBody.querySelectorAll('.checkbox-custom').forEach(chk => {
    chk.addEventListener('change', () => {
      const id = chk.getAttribute('data-id');
      const newStatus = chk.checked ? 'done' : 'todo';
      changeTaskStatus(id, newStatus);
    });
  });

  dom.listTableBody.querySelectorAll('.btn-edit-task').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const task = state.currentUser.tasks.find(t => t.id === id);
      if (task) openTaskModal(task);
    });
  });

  dom.listTableBody.querySelectorAll('.btn-delete-task').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      deleteTask(id);
    });
  });
}

function changeTaskStatus(id, newStatus) {
  if (!state.currentUser) return;
  const task = state.currentUser.tasks.find(t => t.id === id);
  if (task) {
    task.status = newStatus;
    task.updatedAt = new Date().toISOString();
    saveCurrentUserTasks();
    renderApp();
  }
}

function deleteTask(id) {
  if (confirm('Confirma a remoção desta atividade?')) {
    state.currentUser.tasks = state.currentUser.tasks.filter(t => t.id !== id);
    saveCurrentUserTasks();
    renderApp();
  }
}

function openTaskModal(taskToEdit = null, defaultStatus = 'todo') {
  if (taskToEdit) {
    dom.modalHeading.textContent = 'Editar Atividade';
    dom.taskId.value = taskToEdit.id;
    dom.taskTitleInput.value = taskToEdit.title;
    dom.taskPeriodInput.value = taskToEdit.period;
    dom.taskStatusInput.value = taskToEdit.status;
    dom.taskPriorityInput.value = taskToEdit.priority;
    dom.taskDueDateInput.value = taskToEdit.dueDate || '';
    dom.taskNotesInput.value = taskToEdit.notes || '';
  } else {
    dom.modalHeading.textContent = 'Nova Atividade';
    dom.taskId.value = '';
    dom.taskTitleInput.value = '';
    dom.taskPeriodInput.value = state.currentPeriod === 'todos' ? 'hoje' : state.currentPeriod;
    dom.taskStatusInput.value = defaultStatus;
    dom.taskPriorityInput.value = 'media';
    dom.taskDueDateInput.value = state.currentPeriod === 'hoje' ? new Date().toISOString().split('T')[0] : '';
    dom.taskNotesInput.value = '';
  }

  dom.taskModalBackdrop.classList.remove('hidden');
  dom.taskTitleInput.focus();
}

function closeTaskModal() {
  dom.taskModalBackdrop.classList.add('hidden');
  dom.taskForm.reset();
}

function handleTaskFormSubmit(e) {
  e.preventDefault();

  const id = dom.taskId.value;
  const title = dom.taskTitleInput.value.trim();
  const period = dom.taskPeriodInput.value;
  const status = dom.taskStatusInput.value;
  const priority = dom.taskPriorityInput.value;
  const dueDate = dom.taskDueDateInput.value;
  const notes = dom.taskNotesInput.value.trim();

  if (!title || !state.currentUser) return;

  const payload = {
    title,
    period,
    status,
    priority,
    dueDate,
    notes,
    updatedAt: new Date().toISOString()
  };

  if (id) {
    const idx = state.currentUser.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      state.currentUser.tasks[idx] = { ...state.currentUser.tasks[idx], ...payload };
    }
  } else {
    payload.id = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    payload.createdAt = new Date().toISOString();
    state.currentUser.tasks.unshift(payload);
  }

  saveCurrentUserTasks();
  closeTaskModal();
  renderApp();
}

// Backup individual
function exportUserBackup() {
  if (!state.currentUser) return;

  const data = {
    appName: "GestaoTarefasCorporativa",
    exportedAt: new Date().toISOString(),
    user: {
      username: state.currentUser.username,
      name: state.currentUser.name,
      dept: state.currentUser.dept
    },
    tasks: state.currentUser.tasks
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_${state.currentUser.username}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleBackupImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (data.user && Array.isArray(data.tasks)) {
        const accounts = getAccounts();
        const userKey = data.user.username.toLowerCase();

        accounts[userKey] = {
          username: userKey,
          name: data.user.name,
          dept: data.user.dept,
          password: '123',
          tasks: data.tasks,
          restoredAt: new Date().toISOString()
        };

        saveAccounts(accounts);
        startUserSession(accounts[userKey], true);
        alert(`Conta de ${data.user.name} restaurada com sucesso!`);
      } else {
        alert('Arquivo de backup inválido.');
      }
    } catch (err) {
      alert('Erro ao processar o arquivo de backup.');
    }
    dom.authFileInput.value = '';
  };
  reader.readAsText(file);
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  return dateStr;
}
